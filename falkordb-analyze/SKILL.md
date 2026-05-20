---
name: falkordb-analyze
description: >
  Diagnose FalkorDB query and database problems. Walks GRAPH.EXPLAIN →
  GRAPH.PROFILE → GRAPH.SLOWLOG → GRAPH.INFO/LIST/MEMORY for plan
  inspection, index-usage verification, slow-query tracking, and graph-state
  sizing. TRIGGER when: a FalkorDB query is slow, an index "isn't working",
  memory or row counts look wrong, or the user wants to inspect / profile /
  explain anything on a FalkorDB graph. SKIP when: authoring a new query
  from scratch (use falkordb-cypher instead).
license: MIT
metadata:
  author: FalkorDB
  version: "2.0"
---

# falkordb-analyze

When something is slow or wrong with FalkorDB, walk the diagnostic
sequence below rather than guessing. Each step has a different cost and
side-effect profile — pick the cheapest one that answers the question.

## Procedure

### 1. Inspect the plan first — no execution

`GRAPH.EXPLAIN` returns the plan without running the query. Safe on prod,
zero data risk.

```bash
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person {age: 30}) RETURN p"
```

Look at the leaf (innermost) operators:

| Operator | Meaning |
|---|---|
| `Node By Index Scan` / `Index Scan` | Index is being used. Good. |
| `Node By Label Scan` / `Label Scan` | Index *not* used — full scan of the label. |
| `All Node Scan` | No label filter — full graph scan. |

If you see `Label Scan` on a property the query filters on, either the
index is missing *or* the predicate is index-incompatible (e.g. `<>` —
see Gotchas).

### 2. Verify the schema actually exists

If EXPLAIN shows a Label Scan where you expected an Index Scan, check
the index actually exists. Cheaper than re-reading the EXPLAIN output.

```cypher
CALL db.indexes()           // every index — label, properties, type, status
CALL db.labels()            // every node label
CALL db.relationshipTypes() // every relationship type
CALL db.propertyKeys()      // every property key in the graph
CALL db.meta.stats()        // node / rel counts, label/type/key counts
CALL dbms.procedures()      // every callable procedure in this instance
```

`db.indexes()` yields `status` per index — a recently-created index may
still be building (`PENDING`) and won't be used yet. `db.meta.stats()` is
the cheapest way to confirm the graph has the data you expect.

### 3. Profile if the plan looks right but it's still slow

`GRAPH.PROFILE` **executes** the query and returns per-operator records
processed and time spent. Use it to find which operator is actually
expensive at runtime.

```bash
redis-cli GRAPH.PROFILE social "MATCH (u:User)-[:FRIENDS_WITH]->(f)
RETURN f.name ORDER BY f.name LIMIT 10"
```

Because PROFILE runs the query, don't point it at destructive writes or
expensive reads on prod.

### 4. Find recurring offenders with SLOWLOG

For systemic issues — "prod feels slow but no single query stands out":

```bash
redis-cli GRAPH.SLOWLOG social        # list slow queries above threshold
redis-cli GRAPH.SLOWLOG social RESET  # clear after addressing
```

Reset after each investigation cycle so you're tracking *new* offenders,
not the ones you already fixed.

### 5. Inspect graph state and memory

When sizing or memory looks off, or you need to know what graphs exist:

```bash
redis-cli GRAPH.LIST                   # list all graphs in the instance
redis-cli GRAPH.INFO social            # node/edge counts and stats
redis-cli GRAPH.MEMORY USAGE social    # bytes consumed by the graph
```

### 6. Inspect (or override) runtime config

When behavior surprises you — "why is everything timing out at 10s?",
"why isn't SLOWLOG capturing anything?" — read the live module config
rather than reasoning from the `FALKORDB_ARGS` you set at boot.

```bash
redis-cli GRAPH.CONFIG GET *                    # every parameter
redis-cli GRAPH.CONFIG GET TIMEOUT_MAX          # one parameter
redis-cli GRAPH.CONFIG SET TIMEOUT_DEFAULT 2000 # change at runtime (not persisted)
```

For a single long-running diagnostic query, override the timeout
inline with the `timeout` argument on `GRAPH.QUERY` / `GRAPH.RO_QUERY`:

```bash
redis-cli GRAPH.RO_QUERY social "MATCH (n) RETURN count(n)" timeout 60000
```

Key parameters worth knowing:

| Parameter | Meaning |
|---|---|
| `THREAD_COUNT` | Concurrent query workers |
| `CACHE_SIZE` | Query-plan cache slots |
| `TIMEOUT_DEFAULT` | Default per-query timeout (ms) |
| `TIMEOUT_MAX` | Upper bound on the per-query `timeout` arg (ms) |
| `RESULTSET_SIZE` | Max records returned per query |
| `QUERY_MEM_CAPACITY` | Memory limit per query (bytes) |

## Reference

| Command | Executes? | Use for |
|---|---|---|
| `GRAPH.EXPLAIN <g> "<q>"` | No | Plan inspection, index verification |
| `GRAPH.PROFILE <g> "<q>"` | **Yes** | Per-operator runtime cost |
| `GRAPH.SLOWLOG <g>` | No | Recurring slow queries |
| `GRAPH.SLOWLOG <g> RESET` | No (clears log) | Start a fresh tracking window |
| `GRAPH.LIST` | No | List all graphs in the database |
| `GRAPH.INFO <g>` | No | Per-graph stats (node/edge counts, etc.) |
| `GRAPH.MEMORY USAGE <g>` | No | Memory footprint of one graph |
| `GRAPH.CONFIG GET *` / `GET <param>` | No | Live module config |
| `GRAPH.CONFIG SET <param> <value>` | No (not persisted) | Runtime config change |
| `GRAPH.QUERY <g> "<q>" timeout <ms>` | **Yes** | Per-query timeout override |
| `CALL db.indexes()` | No | Every index + status |
| `CALL db.labels()` | No | Every node label |
| `CALL db.relationshipTypes()` | No | Every relationship type |
| `CALL db.propertyKeys()` | No | Every property key |
| `CALL db.meta.stats()` | No | Counts: nodes, rels, labels, types, keys |
| `CALL dbms.procedures()` | No | Every callable procedure |

## Gotchas

- **`GRAPH.PROFILE` runs the query.** Unlike EXPLAIN, it actually
  executes — don't profile destructive writes or known-expensive reads
  on prod without a plan to handle the side effect.
- **Index Scan only appears when both conditions hold:** the index exists,
  AND the predicate is index-compatible. `<>` (`!=`) defeats indexes; so
  do some function-wrapped predicates. If EXPLAIN shows a Label Scan with
  an index in place, suspect the predicate shape first.
- **SLOWLOG threshold is configured at the module level** (`FALKORDB_ARGS`),
  not per-query. If nothing shows up, the threshold may be too high —
  confirm with `GRAPH.CONFIG GET *`.
- **`GRAPH.CONFIG SET` is NOT persisted across restarts.** Runtime changes
  are lost on container/process restart. Persist via `FALKORDB_ARGS` in
  your Docker / Compose config (see `falkordb-deploy`).
- **Per-query `timeout` is bounded by `TIMEOUT_MAX`.** Passing
  `timeout 600000` will be capped silently if `TIMEOUT_MAX` is lower —
  check the config first if a long-running diagnostic query keeps dying.
- **A newly-created index may be `PENDING` in `db.indexes()`.** EXPLAIN
  will still show Label Scan until the build completes for that index.
- **`GRAPH.MEMORY USAGE` reports per-graph memory**, not total Redis
  memory. Cross-check with Redis `INFO memory` for the full picture.
- **`GRAPH.INFO` is graph-scoped**, not database-scoped. For a multi-
  graph instance, sum across `GRAPH.LIST` if you need totals.
