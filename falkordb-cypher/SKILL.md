---
name: falkordb-cypher
description: >
  Author Cypher queries correctly for FalkorDB. Covers the FalkorDB-specific
  divergences from standard Cypher (NULL-removal, CYPHER parameter prelude,
  GRAPH.RO_QUERY), the three index types (range, full-text, vector), and
  GRAPH.CONSTRAINT. TRIGGER when: writing or editing code that calls
  GRAPH.QUERY/GRAPH.RO_QUERY, uses the falkordb Python/JS client, creates
  indexes or constraints, or any Cypher targeting a FalkorDB graph.
  SKIP when: target is Neo4j/Memgraph/AGE (Cypher dialects differ), or when
  debugging an already-written slow query (use falkordb-analyze instead).
license: MIT
metadata:
  author: FalkorDB
  version: "2.0"
---

# falkordb-cypher

FalkorDB's Cypher dialect diverges from Neo4j's in several places where an
agent's instincts will be wrong. Apply this skill *before* writing the query
to avoid the common footguns. Standard `CREATE` / `MATCH` / `MERGE` /
`WITH` / aggregations work as in standard Cypher and are not restated here.

## Procedure

### 1. Apply FalkorDB Cypher divergences

Three differences from standard Cypher bite immediately:

- **Removing a property:** FalkorDB has no `REMOVE` keyword. Set the
  property to `NULL` instead.
  ```cypher
  MATCH (u:User {id: 42}) SET u.email = 'new@x', u.temp = NULL
  ```
- **Parameters:** Declare parameters in a `CYPHER` prelude with
  `name=value`, reference them with `$name`. This differs from the
  bare `$param` binding used elsewhere.
  ```bash
  redis-cli GRAPH.QUERY social \
    "CYPHER name='Alice' MATCH (u:User {name: $name}) RETURN u.id"
  ```
- **Read-only path:** Use `GRAPH.RO_QUERY` instead of `GRAPH.QUERY` for
  any query that must not write. The server rejects writes at the API
  level — defense in depth against accidental mutation in read code paths.
  ```bash
  redis-cli GRAPH.RO_QUERY social "MATCH (u:User) RETURN count(u)"
  ```

Always parameterize. Parameter-prefixed queries hit the plan cache; literal
queries re-plan on every invocation.

### 2. Pick the right index for the workload

| Predicate shape | Index type | Create syntax |
|---|---|---|
| Equality or range on scalar (`=`, `<`, `>`, `IN`) | **Range** | `CREATE INDEX FOR (n:Label) ON (n.prop)` |
| Text search, wildcards, fuzzy | **Full-text** (RediSearch-backed) | `CALL db.idx.fulltext.createNodeIndex('Label', 'prop')` |
| ANN over embeddings | **Vector** (HNSW) | `CREATE VECTOR INDEX FOR (n:Label) ON (n.embedding) OPTIONS {dimension: 768, similarityFunction: 'cosine', M: 32, efConstruction: 200}` |

Querying the non-range types:

```cypher
// full-text — wildcard / fuzzy
CALL db.idx.fulltext.queryNodes('Movie', 'Jun*')
YIELD node RETURN node.title

// vector — vecf32() literal is required
CALL db.idx.vector.queryNodes('Product', 'embedding', 5, vecf32([0.1, 0.2, 0.3]))
YIELD node, score RETURN node.name, score
```

After creating an index, verify it's being used. Use `falkordb-analyze`
(`GRAPH.EXPLAIN`) — see Gotchas for predicate shapes that defeat indexing.

### 3. Add constraints when uniqueness matters

Constraints are created via a Redis command, not Cypher, and creation is
**asynchronous** on large graphs — check status before relying on the
constraint.

```bash
redis-cli GRAPH.CONSTRAINT CREATE social UNIQUE NODE Person PROPERTIES 1 id
redis-cli GRAPH.QUERY social "CALL db.constraints()"
```

The `PROPERTIES 1 id` means "1 property, named `id`". For a composite
unique constraint on (email, tenant), use `PROPERTIES 2 email tenant`.

## Reference

| Pattern | Syntax |
|---|---|
| Remove property | `SET prop = NULL` (not `REMOVE`) |
| Parameter prelude | `CYPHER k1=v1 k2=v2 <query referencing $k1 $k2>` |
| Safe read | `GRAPH.RO_QUERY <graph> "<query>"` |
| Range index | `CREATE INDEX FOR (n:Label) ON (n.prop)` |
| Full-text index | `CALL db.idx.fulltext.createNodeIndex('Label', 'prop')` |
| Full-text query | `CALL db.idx.fulltext.queryNodes('Label', '<pattern>') YIELD node` |
| Vector index | `CREATE VECTOR INDEX FOR (n:Label) ON (n.embedding) OPTIONS {dimension, similarityFunction, M, efConstruction}` |
| Vector query | `CALL db.idx.vector.queryNodes('Label', 'prop', <k>, vecf32([...])) YIELD node, score` |
| Vector literal | `vecf32([...])` |
| Unique constraint | `GRAPH.CONSTRAINT CREATE <graph> UNIQUE NODE <Label> PROPERTIES <n> <prop...>` |
| Check constraint status | `CALL db.constraints()` |

## Gotchas

- **`<>` / `!=` is never index-accelerated.** A `WHERE p.age <> 30` query
  scans the whole label even with an index on `p.age`. Rewrite as
  `WHERE p.age < 30 OR p.age > 30` to engage the index.
- **No `REMOVE` keyword.** Setting to `NULL` is the only way to drop a
  property.
- **Parameter prelude is part of the query string**, not a separate
  redis-cli argument. It sits between `CYPHER` and the rest of the query.
- **Vector literals require `vecf32(...)`.** Passing a raw array fails.
- **Constraint creation is async** on large graphs — `CALL db.constraints()`
  reports status. Don't write code that assumes a constraint is enforced
  immediately after `GRAPH.CONSTRAINT CREATE` returns.
- **Range index creation is synchronous** (unlike constraints) and blocks
  the client until the index is built on large datasets — schedule
  accordingly.
- **Similarity functions for vector indexes** include `cosine` and
  `euclidean`; choose to match how your embeddings were trained.
