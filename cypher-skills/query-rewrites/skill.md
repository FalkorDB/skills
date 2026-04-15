---
name: Query rewrites for performance
description: High-impact structural rewrites for FalkorDB Cypher queries with measured speedups
---

# Query rewrites for performance

Structural changes to Cypher query text that reduce intermediate result sets or enable better execution plans.

## Usage

Analyze a query for these anti-patterns and apply the corresponding rewrite. Each pattern includes a measured speedup from benchmarks (results depend on data shape and scale).

### Cartesian product → relationship traversal (26× speedup)

```cypher
-- BAD: Cartesian product between disjoint patterns
MATCH (a:Person), (b:Company) WHERE a.company_id = b.id RETURN a.name, b.name

-- GOOD: traverse relationship directly
MATCH (a:Person)-[:WORKS_AT]->(b:Company) RETURN a.name, b.name
```

Note: FalkorDB's planner converts Cartesian products to Value Hash Joins when equality predicates exist, but the explicit relationship traversal is still faster because it avoids the join entirely.

### Late filter → index-backed filter (2.4× speedup)

```cypher
-- BAD: filter applied after large traversal
MATCH (a:Person)-[:FRIEND]->(b) WHERE a.age > 30 RETURN b.name

-- GOOD: filter early using index (create index on Person.age first)
MATCH (a:Person) WHERE a.age > 30 MATCH (a)-[:FRIEND]->(b) RETURN b.name
```

### Optional branch bloat → direct MATCH (1.7× speedup)

```cypher
-- BAD: OPTIONAL MATCH when you actually require the relationship
MATCH (u:User) OPTIONAL MATCH (u)-[:POSTED]->(p:Post) RETURN u.name, p.title

-- GOOD: direct MATCH when NULLs are not needed
MATCH (u:User)-[:POSTED]->(p:Post) RETURN u.name, p.title
```

### Patterns the planner already handles

- **Label anchoring** — the planner automatically starts from the label with fewest entities (`costBaseLabelScan`). Manual reordering is unnecessary.
- **DISTINCT after aggregation** — `reduceDistinct` removes redundant DISTINCT after GROUP BY. Adding DISTINCT after count/sum/collect has no effect.
- **Pattern comprehension for 1-hop counts** — can regress compared to standard MATCH + aggregate. Use `CALL {}` subqueries for multi-hop fan-out reduction instead (requires FalkorDB ≥ 4.14.5).

## Example

```bash
# Before: Cartesian product (slow)
redis-cli GRAPH.QUERY social "MATCH (a:Person), (b:Company) WHERE a.company_id = b.id RETURN a.name, b.name"

# After: relationship traversal (26x faster)
redis-cli GRAPH.QUERY social "MATCH (a:Person)-[:WORKS_AT]->(b:Company) RETURN a.name, b.name"
```

## Notes

- Cartesian product avoidance is the single highest-impact rewrite (26× measured speedup)
- Use `GRAPH.EXPLAIN` to verify your rewrite improved the execution plan
- For parameterized queries and plan caching benefits, see skill #5 (Use parameterized queries for cache reuse)
- Some rewrites are planner-neutral — always check with EXPLAIN before and after
- Measured speedups come from benchmarks on moderate datasets; your results may vary
