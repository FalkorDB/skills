---
name: Profile query runtime behavior
description: Use GRAPH.PROFILE to see per-operator runtime statistics and record counts for queries
---

# Profile query runtime behavior

Use `GRAPH.PROFILE` to see per-operator runtime statistics and record counts.

## Usage

Use `GRAPH.PROFILE` to execute a query and receive detailed runtime metrics for each operation.

## Example

```bash
redis-cli GRAPH.PROFILE social "MATCH (u:User)-[:FRIENDS_WITH]->(f)
RETURN f.name ORDER BY f.name LIMIT 10"
```

## Notes

- `GRAPH.PROFILE` executes the query and returns detailed runtime information
- Shows actual records processed and time taken per operator
- More detailed than `GRAPH.EXPLAIN` as it includes actual execution metrics
- Useful for identifying performance bottlenecks in complex queries
- Helps understand which operations are most expensive

## Performance analysis tips

- **Spot fan-out explosions**: look for operators where `Records produced` jumps 10×+ compared to the child operator — this indicates high-degree nodes (supernodes)
- **Find the bottleneck**: the operator consuming the most `Execution time` is your optimization target
- **`Conditional Traverse` producing far more rows than the scan feeding it** suggests a supernode problem — consider schema modeling changes
- **Compare before/after**: run PROFILE on both the original and rewritten query to verify improvements
