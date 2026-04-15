---
name: falkordb-skills
description: >
  Practical FalkorDB guidance — Cypher queries, performance tuning, UDF management,
  and Docker operations. Use when writing or reviewing FalkorDB queries, optimizing
  query performance, setting up FalkorDB containers, or working with user-defined functions.
license: MIT
metadata:
  author: FalkorDB
  version: "1.1"
---

## Conventions

- CLI examples use `redis-cli` unless noted.
- Cypher examples are passed as quoted strings to `GRAPH.QUERY`.
- Use parameterized queries for cache efficiency and safety.

---

## Cypher Skills

### 1) Create nodes and relationships

Create labeled nodes and connect them with properties.

Example:

```bash
redis-cli GRAPH.QUERY social "CREATE (alice:User {id: 1, name: 'Alice', email: 'alice@example.com'})
CREATE (bob:User {id: 2, name: 'Bob', email: 'bob@example.com'})
CREATE (alice)-[:FRIENDS_WITH {since: 1640995200}]->(bob)"
```

### 2) Match patterns and return projections

Match by label/property and return fields.

Example:

```bash
redis-cli GRAPH.QUERY social "MATCH (alice:User {name: 'Alice'})-[:FRIENDS_WITH]->(friend)
RETURN friend.name"
```

### 3) Use MERGE to avoid duplicate nodes

Use `MERGE` when you want idempotent upserts. **Index MERGE lookup properties** — without an index, MERGE performs a full label scan to check existence (11.6× measured speedup).

Example:

```bash
redis-cli GRAPH.QUERY social "MERGE (u:User {id: 42})
ON CREATE SET u.name = 'Dana'
ON MATCH SET u.last_seen = timestamp()"
```

### 4) Update and remove properties safely

Use `SET` for updates and set properties to `NULL` to remove them (no `REMOVE` support).

Example:

```bash
redis-cli GRAPH.QUERY social "MATCH (u:User {id: 42})
SET u.email = 'dana@example.com', u.temp = NULL"
```

### 5) Use parameterized queries for cache reuse

Use parameters so the query plan is cached and reused. The cache key is `query_no_params` — parameterized queries share cached plans; inline literals create unique cache entries with repeated parse overhead.

Example:

```bash
redis-cli GRAPH.QUERY social "CYPHER name='Alice' MATCH (u:User {name: $name}) RETURN u.id"
```

### 6) Run safe read-only queries

Use `GRAPH.RO_QUERY` for read-only paths; it rejects writes.

Example:

```bash
redis-cli GRAPH.RO_QUERY social "MATCH (u:User) RETURN count(u)"
```

### 7) Inspect query plans before execution

Use `GRAPH.EXPLAIN` to validate plan shape and index usage without executing. Red flags: `Cartesian Product` (26× speedup when fixed), `Node By Label Scan` where Index Scan expected, late `Filter`, eager `Sort`.

Example:

```bash
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person {age: 30}) RETURN p"
```

### 8) Profile query runtime behavior

Use `GRAPH.PROFILE` to see per-operator runtime and records. Spot fan-out explosions where `Records produced` jumps 10×+ — the operator with the most `Execution time` is your optimization target.

Example:

```bash
redis-cli GRAPH.PROFILE social "MATCH (u:User)-[:FRIENDS_WITH]->(f)
RETURN f.name ORDER BY f.name LIMIT 10"
```

### 9) Create range indexes for exact/range lookups

Use indexes to speed up equality (13.5× measured) and range predicates (2.9× measured). `<>` cannot use indexes. No composite indexes — index the most selective single property.

Example:

```bash
redis-cli GRAPH.QUERY social "CREATE INDEX FOR (p:Person) ON (p.age)"
```

### 10) Verify index usage

Confirm plan uses index scans. If you see `Node By Label Scan` + `Filter` instead of `Node By Index Scan`, the index is not being used. Common reasons: `<>` predicates, `STARTS WITH`/`ENDS WITH`/`CONTAINS` (use fulltext instead), `OR` across labels.

Example:

```bash
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person) WHERE p.age = 30 RETURN p"
```

### 11) Create and query full-text indexes

Use RediSearch-backed full-text indexes for text search. Range indexes do **not** work for `STARTS WITH`, `ENDS WITH`, or `CONTAINS` — use fulltext instead (6.8× measured speedup).

Example:

```bash
redis-cli GRAPH.QUERY social "CALL db.idx.fulltext.createNodeIndex('Movie', 'title')"
redis-cli GRAPH.QUERY social "CALL db.idx.fulltext.queryNodes('Movie', 'Jun*') YIELD node RETURN node.title"
```

### 12) Create and query vector indexes

Use HNSW vector indexes for ANN search.

Example:

```bash
redis-cli GRAPH.QUERY social "CREATE VECTOR INDEX FOR (p:Product) ON (p.embedding)
OPTIONS {dimension: 768, similarityFunction: 'cosine', M: 32, efConstruction: 200}"

redis-cli GRAPH.QUERY social "CALL db.idx.vector.queryNodes('Product', 'embedding', 5, vecf32([0.1, 0.2, 0.3]))
YIELD node, score RETURN node.name, score"
```

### 13) Manage constraints with awareness of async creation

Create constraints and check status with `db.constraints()`.

Example:

```bash
redis-cli GRAPH.CONSTRAINT CREATE social UNIQUE NODE Person PROPERTIES 1 id
redis-cli GRAPH.QUERY social "CALL db.constraints()"
```

Note: Confirm the exact `GRAPH.CONSTRAINT CREATE` syntax against current docs before use.

### 14) Inspect graphs and memory usage

Use introspection commands for operational visibility.

Example:

```bash
redis-cli GRAPH.LIST
redis-cli GRAPH.INFO social
redis-cli GRAPH.MEMORY USAGE social
```

### 15) Track slow queries

Use slowlog to identify and reset slow queries. After finding slow queries: run `GRAPH.EXPLAIN` to check the plan, look for missing indexes and query anti-patterns, then apply optimizations from skills 17–19.

Example:

```bash
redis-cli GRAPH.SLOWLOG social
redis-cli GRAPH.SLOWLOG social RESET
```

### 16) Apply FalkorDB Cypher limitations correctly

Account for known limitations in query design.

- `<>` / `!=` is **never** index-accelerated — always full scan
- `STARTS WITH`, `ENDS WITH`, `CONTAINS` do **not** use range indexes — use fulltext instead (12.6× speedup)
- Regex `=~` is **not supported**; disjunctive labels `(n:A|B)` not supported (only conjunctive `(n:A:B)`)
- **LIMIT after eager ops**: `LIMIT` does not stop CREATE/DELETE/SET/MERGE/Sort/Aggregate from processing all rows first
- **Relationship uniqueness**: enforced per MATCH clause — separate MATCH clauses can traverse the same relationship, affecting counts

Example:

```bash
# Not-equal filters are not index-accelerated
redis-cli GRAPH.QUERY social "MATCH (p:Person) WHERE p.age <> 30 RETURN p"
```

### 17) Optimize queries (performance triage)

Systematic approach to diagnosing slow queries:

1. **Gather inputs**: query text, FalkorDB version, current indexes (`CALL db.indexes()`), `GRAPH.EXPLAIN` output.
2. **Check EXPLAIN for missing indexes**: `Node By Label Scan` where `Node By Index Scan` expected → create index.
3. **Check query shape**: Cartesian products, late filters, optional branch bloat → rewrite query (see skill 18).
4. **Check PROFILE for bottlenecks**: operators producing 10×+ more rows → supernode or missing filter.

The planner auto-handles some patterns — do not recommend: label reordering (`costBaseLabelScan`), DISTINCT after aggregation (`reduceDistinct`), Cartesian → Hash Join when equality predicates connect streams (`applyJoin`).

Example:

```bash
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person) WHERE p.email = 'alice@example.com' RETURN p"
# If "Node By Label Scan" appears, create an index:
redis-cli GRAPH.QUERY social "CREATE INDEX FOR (p:Person) ON (p.email)"
```

### 18) Query rewrites for performance

Structural rewrites that reduce intermediate result sets (measured speedups depend on data shape and scale):

- **Cartesian product → relationship traversal (26× speedup)**: Replace `MATCH (a:Person), (b:Company) WHERE a.company_id = b.id` with `MATCH (a:Person)-[:WORKS_AT]->(b:Company)`.
- **Late filter → index-backed filter (2.4×)**: Move filtered labels to separate early MATCH clauses so the planner applies indexes first.
- **Optional branch bloat → direct MATCH (1.7×)**: Replace `OPTIONAL MATCH` with `MATCH` when NULLs are not needed.
- **Planner-neutral**: label anchoring and DISTINCT after aggregation are auto-handled — no rewrite needed.
- **Caution**: pattern comprehension for 1-hop counts can regress; use `CALL {}` subqueries for multi-hop (≥ 4.14.5).

Example:

```bash
# Before: Cartesian product (slow)
redis-cli GRAPH.QUERY social "MATCH (a:Person), (b:Company) WHERE a.company_id = b.id RETURN a.name, b.name"
# After: relationship traversal (26x faster)
redis-cli GRAPH.QUERY social "MATCH (a:Person)-[:WORKS_AT]->(b:Company) RETURN a.name, b.name"
```

### 19) Index strategy

Choose the right index type and diagnose when indexes are not used:

- **Equality/range predicates** → range index (`CREATE INDEX FOR (p:Person) ON (p.email)`) — 13.5× measured speedup
- **Text search** → fulltext index — 6.8× speedup vs filter-based matching
- **Similarity/ANN** → vector index
- **MERGE lookup keys** → index for existence check — 11.6× speedup
- **Predicates that bypass indexes**: `<>`, `STARTS WITH`, `ENDS WITH`, `CONTAINS`, `OR` across labels — use fulltext for string predicates (12.6× speedup)
- **No composite indexes** — FalkorDB creates single-property indexes only; index the most selective property
- **Low-selectivity caution** — indexing boolean/status fields may not help or can regress

Example:

```bash
redis-cli GRAPH.QUERY social "CREATE INDEX FOR (p:Person) ON (p.email)"
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person {email: 'alice@example.com'}) RETURN p"
```

### 20) Schema modeling for performance

When rewrites and indexes are not enough, consider structural graph model changes (apply only with strong evidence from `GRAPH.PROFILE`):

- **Supernode mitigation**: split high-degree nodes (10,000+ edges) into temporal/category buckets via intermediate nodes
- **Relationship type specificity**: use specific types (`:AUTHORED`, `:REVIEWED`) instead of generic (`:RELATED_TO`) for planner selectivity
- **Denormalize hot-path properties**: copy frequently-accessed properties onto relationships to avoid extra traversals

Example:

```bash
# Check for supernodes in PROFILE output
redis-cli GRAPH.PROFILE social "MATCH (c:Celebrity)-[:FOLLOWED_BY]->(f) RETURN count(f)"
# If Conditional Traverse shows Records produced: 100000+, consider fan-out partitioning
```

---

## UDF Skills

### 1) Load a JavaScript UDF library

Register UDFs with `falkor.register` in JS.

Example:

```python
from falkordb import FalkorDB

db = FalkorDB(host='localhost', port=6379)
lib = "StringUtils"
script = """
function UpperCaseOdd(s) {
  return s.split('')
    .map((c, i) => i % 2 !== 0 ? c.toUpperCase() : c)
    .join('');
};

falkor.register('UpperCaseOdd', UpperCaseOdd);
"""

db.udf_load(lib, script)
```

### 2) Call a UDF from Cypher

UDFs behave like built-in functions.

Example:

```python
from falkordb import FalkorDB

db = FalkorDB(host='localhost', port=6379)
g = db.select_graph("social")
result = g.query("RETURN StringUtils.UpperCaseOdd('abcdef')").result_set
print(result)
```

### 3) List UDF libraries (with code)

Use `GRAPH.UDF LIST WITHCODE` to audit loaded libraries.

Example:

```bash
redis-cli GRAPH.UDF LIST WITHCODE
```

### 4) Delete or flush UDF libraries

Remove a specific library or flush all.

Example:

```bash
redis-cli GRAPH.UDF DELETE StringUtils
redis-cli GRAPH.UDF FLUSH
```

### 5) Respect UDF limitations

UDFs cannot mutate the graph; they must be pure functions.

Example:

```text
# Use UDFs for transformations only; do not attempt CREATE/SET/DELETE inside JS.
```

---

## Operations Skills (Docker)

### 1) Run FalkorDB with browser for local development

Expose both database and UI ports.

Example:

```bash
docker run -p 6379:6379 -p 3000:3000 -it --rm falkordb/falkordb:latest
```

### 2) Run server-only for production-style usage

Use the server-only image for lean deployments.

Example:

```bash
docker run -p 6379:6379 -it --rm falkordb/falkordb-server:latest
```

### 3) Set authentication using REDIS_ARGS

Pass Redis server flags via environment variables.

Example:

```bash
docker run -p 6379:6379 -p 3000:3000 -it \
  -e REDIS_ARGS="--requirepass yourpassword" \
  --rm falkordb/falkordb:latest
```

### 4) Set module config using FALKORDB_ARGS

Tune module-level settings (threads, timeout, cache size).

Example:

```bash
docker run -p 6379:6379 -p 3000:3000 -it \
  -e FALKORDB_ARGS="THREAD_COUNT 4 TIMEOUT 5000" \
  --rm falkordb/falkordb:latest
```

### 5) Use Docker Compose for repeatable local stacks

Define ports and env vars in a compose file.

Example:

```yaml
services:
  falkordb:
    image: falkordb/falkordb:latest
    ports:
      - "6379:6379"
      - "3000:3000"
    environment:
      - REDIS_ARGS=--requirepass falkordb
      - FALKORDB_ARGS=THREAD_COUNT 4
```

### 6) Run the browser separately against a server

Use `FALKORDB_URL` to point the browser container to the server.

Example:

```yaml
services:
  falkordb-server:
    image: falkordb/falkordb-server:latest
    ports:
      - "6379:6379"
  falkordb-browser:
    image: falkordb/falkordb-browser:latest
    ports:
      - "3000:3000"
    environment:
      - FALKORDB_URL=redis://falkordb-server:6379
      - FALKORDB_PASSWORD=falkordb
```
