# FalkorDB Skills for Claude Code


This document defines practical, FalkorDB-specific skills with explicit examples. It is intended for Claude Code to execute or verify tasks reliably using FalkorDB’s documented commands and behaviors.

## Table of contents

- [Conventions](#conventions)
- [Cypher Skills](#cypher-skills)
  - [1) Create nodes and relationships](#1-create-nodes-and-relationships)
  - [2) Match patterns and return projections](#2-match-patterns-and-return-projections)
  - [3) Use MERGE to avoid duplicate nodes](#3-use-merge-to-avoid-duplicate-nodes)
  - [4) Update and remove properties safely](#4-update-and-remove-properties-safely)
  - [5) Use parameterized queries for cache reuse](#5-use-parameterized-queries-for-cache-reuse)
  - [6) Run safe read-only queries](#6-run-safe-read-only-queries)
  - [7) Inspect query plans before execution](#7-inspect-query-plans-before-execution)
  - [8) Profile query runtime behavior](#8-profile-query-runtime-behavior)
  - [9) Create range indexes for exact/range lookups](#9-create-range-indexes-for-exactrange-lookups)
  - [10) Verify index usage](#10-verify-index-usage)
  - [11) Create and query full-text indexes](#11-create-and-query-full-text-indexes)
  - [12) Create and query vector indexes](#12-create-and-query-vector-indexes)
  - [13) Manage constraints with awareness of async creation](#13-manage-constraints-with-awareness-of-async-creation)
  - [14) Inspect graphs and memory usage](#14-inspect-graphs-and-memory-usage)
  - [15) Track slow queries](#15-track-slow-queries)
  - [16) Apply FalkorDB Cypher limitations correctly](#16-apply-falkordb-cypher-limitations-correctly)
- [UDF Skills](#udf-skills)
  - [1) Load a JavaScript UDF library](#1-load-a-javascript-udf-library)
  - [2) Call a UDF from Cypher](#2-call-a-udf-from-cypher)
  - [3) List UDF libraries (with code)](#3-list-udf-libraries-with-code)
  - [4) Delete or flush UDF libraries](#4-delete-or-flush-udf-libraries)
  - [5) Respect UDF limitations](#5-respect-udf-limitations)
- [Operations Skills (Docker)](#operations-skills-docker)
  - [1) Run FalkorDB with browser for local development](#1-run-falkordb-with-browser-for-local-development)
  - [2) Run server-only for production-style usage](#2-run-server-only-for-production-style-usage)
  - [3) Set authentication using REDIS_ARGS](#3-set-authentication-using-redis_args)
  - [4) Set module config using FALKORDB_ARGS](#4-set-module-config-using-falkordb_args)
  - [5) Use Docker Compose for repeatable local stacks](#5-use-docker-compose-for-repeatable-local-stacks)
  - [6) Run the browser separately against a server](#6-run-the-browser-separately-against-a-server)

## Conventions

- CLI examples use `redis-cli` unless noted.
- Cypher examples are passed as quoted strings to `GRAPH.QUERY`.
- Use parameterized queries for cache efficiency and safety.

---

## Cypher Skills

### 1) Create nodes and relationships

Create labeled nodes and connect them with properties.

![Demo](videos/cypher/01-create-nodes-and-relationships.gif)

Example:

```bash
redis-cli GRAPH.QUERY social "CREATE (alice:User {id: 1, name: 'Alice', email: 'alice@example.com'})
CREATE (bob:User {id: 2, name: 'Bob', email: 'bob@example.com'})
CREATE (alice)-[:FRIENDS_WITH {since: 1640995200}]->(bob)"
```

### 2) Match patterns and return projections

Match by label/property and return fields.

![Demo](videos/cypher/02-match-patterns-and-return-projections.gif)

Example:

```bash
redis-cli GRAPH.QUERY social "MATCH (alice:User {name: 'Alice'})-[:FRIENDS_WITH]->(friend)
RETURN friend.name"
```

### 3) Use MERGE to avoid duplicate nodes

Use `MERGE` when you want idempotent upserts.

![Demo](videos/cypher/03-use-merge-to-avoid-duplicate-nodes.gif)

Example:

```bash
redis-cli GRAPH.QUERY social "MERGE (u:User {id: 42})
ON CREATE SET u.name = 'Dana'
ON MATCH SET u.last_seen = timestamp()"
```

### 4) Update and remove properties safely

Use `SET` for updates and set properties to `NULL` to remove them (no `REMOVE` support).

![Demo](videos/cypher/04-update-and-remove-properties-safely.gif)

Example:

```bash
redis-cli GRAPH.QUERY social "MATCH (u:User {id: 42})
SET u.email = 'dana@example.com', u.temp = NULL"
```

### 5) Use parameterized queries for cache reuse

Use parameters so the query plan is cached and reused.

![Demo](videos/cypher/05-parameterized-queries-for-cache-reuse.gif)

Example:

```bash
redis-cli GRAPH.QUERY social "CYPHER name='Alice' MATCH (u:User {name: $name}) RETURN u.id"
```

### 6) Run safe read-only queries

Use `GRAPH.RO_QUERY` for read-only paths; it rejects writes.

![Demo](videos/cypher/06-run-safe-read-only-queries.gif)

Example:

```bash
redis-cli GRAPH.RO_QUERY social "MATCH (u:User) RETURN count(u)"
```

### 7) Inspect query plans before execution

Use `GRAPH.EXPLAIN` to validate plan shape and index usage without executing.

![Demo](videos/cypher/07-inspect-query-plans-before-execution.gif)

Example:

```bash
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person {age: 30}) RETURN p"
```

### 8) Profile query runtime behavior

Use `GRAPH.PROFILE` to see per-operator runtime and records.

![Demo](videos/cypher/08-profile-query-runtime-behavior.gif)

Example:

```bash
redis-cli GRAPH.PROFILE social "MATCH (u:User)-[:FRIENDS_WITH]->(f)
RETURN f.name ORDER BY f.name LIMIT 10"
```

### 9) Create range indexes for exact/range lookups

Use indexes to speed up equality and range predicates.

![Demo](videos/cypher/09-create-range-indexes.gif)

Example:

```bash
redis-cli GRAPH.QUERY social "CREATE INDEX FOR (p:Person) ON (p.age)"
```

### 10) Verify index usage

Confirm plan uses index scans.

![Demo](videos/cypher/10-verify-index-usage.gif)

Example:

```bash
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person) WHERE p.age = 30 RETURN p"
```

### 11) Create and query full-text indexes

Use RediSearch-backed full-text indexes for text search.

![Demo](videos/cypher/11-full-text-indexes.gif)

Example:

```bash
redis-cli GRAPH.QUERY social "CALL db.idx.fulltext.createNodeIndex('Movie', 'title')"
redis-cli GRAPH.QUERY social "CALL db.idx.fulltext.queryNodes('Movie', 'Jun*') YIELD node RETURN node.title"
```

### 12) Create and query vector indexes

Use HNSW vector indexes for ANN search.

![Demo](videos/cypher/12-vector-indexes.gif)

Example:

```bash
redis-cli GRAPH.QUERY social "CREATE VECTOR INDEX FOR (p:Product) ON (p.embedding)
OPTIONS {dimension: 768, similarityFunction: 'cosine', M: 32, efConstruction: 200}"

redis-cli GRAPH.QUERY social "CALL db.idx.vector.queryNodes('Product', 'embedding', 5, vecf32([0.1, 0.2, 0.3]))
YIELD node, score RETURN node.name, score"
```

### 13) Manage constraints with awareness of async creation

Create constraints and check status with `db.constraints()`.

![Demo](videos/cypher/13-manage-constraints-async-creation.gif)

Example:

```bash
redis-cli GRAPH.CONSTRAINT CREATE social UNIQUE NODE Person PROPERTIES 1 id
redis-cli GRAPH.QUERY social "CALL db.constraints()"
```

Note: Confirm the exact `GRAPH.CONSTRAINT CREATE` syntax against current docs before use.

### 14) Inspect graphs and memory usage

Use introspection commands for operational visibility.

![Demo](videos/cypher/14-inspect-graphs-and-memory-usage.gif)

Example:

```bash
redis-cli GRAPH.LIST
redis-cli GRAPH.INFO social
redis-cli GRAPH.MEMORY USAGE social
```

### 15) Track slow queries

Use slowlog to identify and reset slow queries.

![Demo](videos/cypher/15-track-slow-queries.gif)

Example:

```bash
redis-cli GRAPH.SLOWLOG social
redis-cli GRAPH.SLOWLOG social RESET
```

### 16) Apply FalkorDB Cypher limitations correctly

Account for known limitations in query design.

![Demo](videos/cypher/16-cypher-limitations-correctly.gif)

Example:

```bash
# Not-equal filters are not index-accelerated
redis-cli GRAPH.QUERY social "MATCH (p:Person) WHERE p.age <> 30 RETURN p"
```

---

## UDF Skills

### 1) Load a JavaScript UDF library

Register UDFs with `falkor.register` in JS.

![Demo](videos/udf/01-load-js-udf-library.gif)

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

![Demo](videos/udf/02-call-udf-from-cypher.gif)

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

![Demo](videos/udf/03-list-udf-libraries-with-code.gif)

Example:

```bash
redis-cli GRAPH.UDF LIST WITHCODE
```

### 4) Delete or flush UDF libraries

Remove a specific library or flush all.

![Demo](videos/udf/04-delete-or-flush-udf-libraries.gif)

Example:

```bash
redis-cli GRAPH.UDF DELETE StringUtils
redis-cli GRAPH.UDF FLUSH
```

### 5) Respect UDF limitations

UDFs cannot mutate the graph; they must be pure functions.

![Demo](videos/udf/05-respect-udf-limitations.gif)

Example:

```text
# Use UDFs for transformations only; do not attempt CREATE/SET/DELETE inside JS.
```

---

## Operations Skills (Docker)

### 1) Run FalkorDB with browser for local development

Expose both database and UI ports.

![Demo](videos/ops/01-run-with-browser-local-dev.gif)

Example:

```bash
docker run -p 6379:6379 -p 3000:3000 -it --rm falkordb/falkordb:latest
```

### 2) Run server-only for production-style usage

Use the server-only image for lean deployments.

![Demo](videos/ops/02-run-server-only.gif)

Example:

```bash
docker run -p 6379:6379 -it --rm falkordb/falkordb-server:latest
```

### 3) Set authentication using REDIS_ARGS

Pass Redis server flags via environment variables.

![Demo](videos/ops/03-set-auth-redis-args.gif)

Example:

```bash
docker run -p 6379:6379 -p 3000:3000 -it \
  -e REDIS_ARGS="--requirepass yourpassword" \
  --rm falkordb/falkordb:latest
```

### 4) Set module config using FALKORDB_ARGS

Tune module-level settings (threads, timeout, cache size).

![Demo](videos/ops/04-set-module-config-falkordb-args.gif)

Example:

```bash
docker run -p 6379:6379 -p 3000:3000 -it \
  -e FALKORDB_ARGS="THREAD_COUNT 4 TIMEOUT 5000" \
  --rm falkordb/falkordb:latest
```

### 5) Use Docker Compose for repeatable local stacks

Define ports and env vars in a compose file.

![Demo](videos/ops/05-docker-compose-local-stacks.gif)

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

![Demo](videos/ops/06-browser-separate-server.gif)

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
