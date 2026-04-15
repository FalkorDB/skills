---
name: Index strategy
description: Choose the right FalkorDB index type, diagnose when indexes are not used, and avoid indexing pitfalls
---

# Index strategy

Practical guide to choosing, creating, and troubleshooting FalkorDB indexes for query performance.

## Usage

### Which index type to use

| Predicate pattern | Index type | Creation example |
|---|---|---|
| Equality (`=`), range (`>`, `<`, `>=`, `<=`), `IN` | Range index | `CREATE INDEX FOR (p:Person) ON (p.email)` |
| Text search, prefix, fuzzy matching | Full-text index | `CREATE FULLTEXT INDEX FOR (p:Person) ON (p.bio)` |
| Similarity / nearest-neighbor | Vector index | `CREATE VECTOR INDEX FOR (p:Product) ON (p.embedding) OPTIONS {dimension: 768, similarityFunction: 'cosine'}` |

### High-impact index patterns (with measured speedups)

- **Equality lookup** — index the property used in `WHERE x = value` (13.5× speedup for email lookup)
- **Range filter** — index the property used in `WHERE x > value` (2.9× speedup)
- **MERGE lookup** — index the MERGE match key or bulk upserts degrade severely (11.6× speedup)
- **Full-text search** — use fulltext index instead of `WHERE x CONTAINS '...'` with filter (6.8× speedup)
- **STARTS WITH** — range indexes do **not** work for `STARTS WITH`; use fulltext index (12.6× measured for prefix matching)

### Predicates that bypass range indexes

These predicates **never** trigger range index usage — queries fall back to label scan + filter:

- `<>` / `!=` (not-equal)
- `STARTS WITH`, `ENDS WITH`, `CONTAINS`
- Regex `=~` (not supported in FalkorDB)
- `OR` across different labels

### Important limitations

- **No composite indexes** — FalkorDB creates single-property indexes only. Index the most selective property.
- **Relationship indexes** — supported but can regress at moderate scale with low selectivity. Use when filtering on high-cardinality relationship properties (e.g., timestamps).

## Example

```bash
# Create an index for equality lookups
redis-cli GRAPH.QUERY social "CREATE INDEX FOR (p:Person) ON (p.email)"

# Verify the index is used
redis-cli GRAPH.EXPLAIN social "MATCH (p:Person {email: 'alice@example.com'}) RETURN p"
# Should show "Node By Index Scan" instead of "Node By Label Scan"
```

## Notes

- Always verify index usage with `GRAPH.EXPLAIN` after creating an index
- Low-selectivity indexes (few distinct values like booleans) may not help or can hurt performance
- For text search patterns, see `create-and-query-fulltext-indexes` skill
- For range index creation details, see `create-range-indexes` skill
- Results depend on data shape and scale — benchmark with representative data
