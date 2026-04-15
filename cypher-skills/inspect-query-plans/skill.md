---
name: Inspect query plans before execution
description: Use GRAPH.EXPLAIN to view query execution plans and validate index usage without running
---

# Inspect query plans before execution

Use `GRAPH.EXPLAIN` to view the query execution plan without running the query.

## Usage

Use `GRAPH.EXPLAIN` to validate query plan structure and index usage before executing potentially expensive queries.

## Example

```bash
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person {age: 30}) RETURN p"
```

## Notes

- `GRAPH.EXPLAIN` shows the execution plan without actually running the query
- Helps identify if indexes are being used effectively
- Useful for query optimization and debugging performance issues
- Shows the logical operators that will be used to execute the query
- Does not return actual data, only the execution plan

## Performance red flags

Look for these patterns in EXPLAIN output:

- **`Cartesian Product`** — usually means a missing relationship pattern; fixing this can yield 26× speedup
- **`Node By Label Scan`** or **`All Node Scan`** where `Node By Index Scan` is expected — missing index
- **`Filter`** appearing late (high in the tree) after large intermediate results — predicate pushdown needed
- **`Sort`** — always eager, buffers all rows before producing output

### Key operators

| Operator | Meaning |
|---|---|
| All Node Scan | Scans every node in the graph (no label filter) |
| Node By Label Scan | Scans all nodes with a given label |
| Node By Index Scan | Uses a range index for lookup (fast) |
| Edge By Index Scan | Uses a relationship index |
| Conditional Traverse | Follows relationships from source nodes |
| Expand Into | Checks if a relationship exists between two known nodes |
| Cartesian Product | Cross-product of two independent streams (expensive) |
| Value Hash Join | Hash join on equality predicate (planner upgrade from Cartesian) |
| Filter | Applies a WHERE predicate to filter rows |
| Sort | Sorts rows (eager — buffers everything) |
| Aggregate | Groups and aggregates (eager) |
| Distinct | Removes duplicates |
| Apply | Executes a subquery per input row |
| Eager | Forces materialization of all input rows |
