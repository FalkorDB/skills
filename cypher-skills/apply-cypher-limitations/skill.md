---
name: Apply FalkorDB Cypher limitations correctly
description: Account for FalkorDB Cypher limitations like non-indexed not-equal filters when designing queries
---

# Apply FalkorDB Cypher limitations correctly

Account for known limitations in FalkorDB's Cypher implementation when designing queries.

## Usage

Be aware of FalkorDB-specific limitations and design queries accordingly to avoid performance issues.

## Example

```bash
# Not-equal filters are not index-accelerated
redis-cli GRAPH.QUERY social "MATCH (p:Person) WHERE p.age <> 30 RETURN p"
```

## Notes

- Not-equal (`<>` or `!=`) filters cannot use indexes and will perform full scans
- Certain Cypher features may have different behavior in FalkorDB compared to other graph databases
- Always test queries with representative data to understand performance characteristics
- Review FalkorDB documentation for the complete list of limitations
- Plan query design around these limitations for optimal performance

## Performance-relevant limitations

- `<>` / `!=` (not-equal) is **never** index-accelerated — always full scan
- `STARTS WITH`, `ENDS WITH`, `CONTAINS` do **not** use range indexes — use fulltext indexes instead (12.6× measured for prefix matching)
- Regex `=~` operator is **not supported** in FalkorDB
- Disjunctive labels `(n:A|B)` are not supported; only conjunctive `(n:A:B)` works
- No composite (multi-property) indexes — each property gets a separate index

## Correctness traps

- **Relationship uniqueness**: FalkorDB enforces relationship uniqueness per MATCH clause — a single pattern cannot traverse the same relationship twice, but separate MATCH clauses can. This affects counting queries that might double-count.
- **LIMIT after eager operations**: `LIMIT` does not stop eager operations (CREATE, DELETE, SET, MERGE, Sort, Aggregate) from processing all rows first. For example, `CREATE (n:Node) ... LIMIT 10` still creates all matching rows, then limits the RETURN output.
