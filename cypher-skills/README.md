# Cypher Skills

This directory contains 20 individual skills related to FalkorDB Cypher query language operations.

## Skills

1. **create-nodes-and-relationships** - Create labeled nodes and connect them with properties
2. **match-patterns-and-return-projections** - Match nodes and return specific fields
3. **use-merge-to-avoid-duplicates** - Use MERGE for idempotent upserts
4. **update-and-remove-properties** - Update properties with SET and remove with NULL
5. **use-parameterized-queries** - Use parameters for cache reuse and performance
6. **run-read-only-queries** - Use GRAPH.RO_QUERY for safe read-only operations
7. **inspect-query-plans** - Use GRAPH.EXPLAIN to view execution plans
8. **profile-query-runtime** - Use GRAPH.PROFILE to see runtime statistics
9. **create-range-indexes** - Create indexes for exact and range lookups
10. **verify-index-usage** - Confirm queries are using indexes
11. **create-and-query-fulltext-indexes** - Use RediSearch for text search
12. **create-and-query-vector-indexes** - Use HNSW for ANN search
13. **manage-constraints** - Create and manage node constraints
14. **inspect-graphs-and-memory** - Monitor graph info and resource usage
15. **track-slow-queries** - Identify performance bottlenecks
16. **apply-cypher-limitations** - Work within FalkorDB Cypher limitations

### Performance Tuning

17. **optimize-queries** - Triage workflow for diagnosing and fixing slow queries
18. **query-rewrites** - High-impact structural rewrites with measured speedups
19. **index-strategy** - Choose the right index type, diagnose index bypass, avoid pitfalls
20. **schema-modeling** - Graph model changes for performance (supernodes, relationship types)

## Usage

Each skill is in its own directory with a `skill.md` file that includes:
- YAML frontmatter with name and description
- Usage instructions
- Example code
- Important notes
