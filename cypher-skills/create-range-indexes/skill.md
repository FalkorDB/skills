---
name: Create range indexes for exact/range lookups
description: Create indexes to accelerate equality and range predicates on node properties in FalkorDB
---

# Create range indexes for exact/range lookups

Create indexes to accelerate equality and range predicates on node properties.

## Usage

Use `CREATE INDEX FOR` to create an index on a node label and property combination.

## Example

```bash
redis-cli GRAPH.QUERY social "CREATE INDEX FOR (p:Person) ON (p.age)"
```

## Notes

- Range indexes speed up both exact matches and range queries
- Indexes improve performance for `WHERE` clauses with equality or range predicates
- Index creation is synchronous and may take time for large datasets
- Multiple indexes can be created on different properties
- Indexes consume additional memory but significantly improve query performance

## Performance

- Equality lookups benefit most — 13.5× measured speedup for indexed email lookup vs label scan
- Range predicates (`>`, `<`, `>=`, `<=`) also use range indexes — 2.9× measured speedup
- `<>` (not-equal) **cannot** use indexes — always results in a full label scan
- Low-selectivity indexes (few distinct values like booleans or status fields) may not help or can regress
- FalkorDB has **no composite indexes** — multi-property syntax creates separate single-property indexes; index the most selective property
- Results depend on data shape and scale
