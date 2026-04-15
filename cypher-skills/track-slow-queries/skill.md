---
name: Track slow queries
description: Use GRAPH.SLOWLOG to identify and monitor slow queries and performance bottlenecks
---

# Track slow queries

Use the slowlog to identify and monitor queries that take longer than expected.

## Usage

Use `GRAPH.SLOWLOG` to view slow queries and `GRAPH.SLOWLOG RESET` to clear the log.

## Example

```bash
redis-cli GRAPH.SLOWLOG social
redis-cli GRAPH.SLOWLOG social RESET
```

## Notes

- The slowlog captures queries that exceed a configured time threshold
- Helps identify performance bottlenecks and optimization opportunities
- Use the slowlog during development and in production monitoring
- Reset the slowlog after addressing performance issues to track new ones
- Essential tool for maintaining query performance over time

## Next steps after finding slow queries

1. Run `GRAPH.EXPLAIN` on the slow query to inspect the execution plan
2. Look for missing indexes — `Node By Label Scan` where `Node By Index Scan` is expected
3. Check for query anti-patterns — Cartesian products, late filters, optional branch bloat
4. See `optimize-queries`, `query-rewrites`, and `index-strategy` skills for detailed optimization guidance
