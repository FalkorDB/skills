---
name: Optimize queries
description: Triage workflow for slow FalkorDB queries — gather inputs, diagnose bottlenecks, and choose the right optimization strategy
---

# Optimize queries

Systematic approach to diagnosing and fixing slow FalkorDB Cypher queries.

## Usage

When a query is slow, follow this triage workflow:

1. **Gather inputs**: get the query text, FalkorDB version, current indexes (`CALL db.indexes()`), and `GRAPH.EXPLAIN` output.
2. **Check EXPLAIN for missing indexes**: look for `Node By Label Scan` where `Node By Index Scan` is expected → see `index-strategy` and `create-range-indexes` skills.
3. **Check query shape for anti-patterns**: Cartesian products, late filters, optional branch bloat → see `query-rewrites` skill.
4. **Check PROFILE for fan-out/sort bottlenecks**: operators producing 10×+ more rows than their children indicate supernodes or missing filters → see `profile-query-runtime` skill.
5. **Consider structural changes**: if rewrites and indexes don't help, the graph model itself may need work → see `schema-modeling` skill.

### What the planner already handles

Do **not** recommend these — FalkorDB's planner optimizes them automatically:

- **Label reordering** — `costBaseLabelScan` picks the label with fewest entities
- **DISTINCT after aggregation** — `reduceDistinct` removes redundant DISTINCT
- **Cartesian → Hash Join** — `applyJoin` converts Cartesian products to Value Hash Joins when equality predicates connect the streams
- **ID seek** — `seekByID` converts Scan + Filter(ID(n)=X) to NodeByIDSeek
- **Count optimization** — `reduceCount` uses precomputed label counts for simple `count(n)` queries

### Version capabilities

| Feature | Min version | Notes |
|---|---|---|
| Range indexes | all | Single-property only, no composite indexes |
| Full-text indexes | all | RediSearch-based, stemming and scoring |
| Vector indexes | all | HNSW, euclidean/cosine similarity |
| CALL {} subquery | 4.14.5 | Buggy before 4.14.5 |
| Temporal types | 4.14.0 | DATE, TIME, DATETIME, DURATION |
| List comprehensions | 4.14.0 | `[x IN list WHERE ... \| expr]` |
| UDFs | 4.16.0 | QuickJS runtime |

## Example

```bash
# Step 1: Check the execution plan for a slow query
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person) WHERE p.email = 'alice@example.com' RETURN p"

# If you see "Node By Label Scan" instead of "Node By Index Scan",
# the fix is to create an index:
redis-cli GRAPH.QUERY social "CREATE INDEX FOR (p:Person) ON (p.email)"
```

## Notes

- Always start with `GRAPH.EXPLAIN` — it reveals the plan without executing the query
- Use `GRAPH.PROFILE` for runtime metrics (records produced, execution time per operator)
- Check current indexes with `CALL db.indexes()` before recommending new ones
- Results depend on data shape and scale — always verify with representative data
