---
name: Verify index usage
description: Confirm queries are using indexes through execution plan analysis with GRAPH.EXPLAIN
---

# Verify index usage

Confirm that your queries are using indexes through execution plan analysis.

## Usage

Use `GRAPH.EXPLAIN` to verify that the query execution plan includes index scan operations.

## Example

```bash
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person) WHERE p.age = 30 RETURN p"
```

## Notes

- Look for "Node By Index Scan" operations in the execution plan
- If you see "Node By Label Scan" + "Filter" instead of "Node By Index Scan", the index is not being used
- Indexes are only used when predicates match the indexed properties
- Ensure indexes exist before expecting them to be used

## Why the planner skips an index

Common reasons a range index is not used even when it exists:

- **Predicate uses `<>`** — not-equal is never index-accelerated
- **Predicate uses `STARTS WITH`, `ENDS WITH`, or `CONTAINS`** — these string predicates do not trigger range index usage; use a full-text index instead (12.6× speedup measured)
- **`OR` across different labels** — prevents the planner from choosing a single index
- **Predicate type mismatch** — e.g., range index exists but query uses text search patterns
- **No index on the filtered property** — check with `CALL db.indexes()`
