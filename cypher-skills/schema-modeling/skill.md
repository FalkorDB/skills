---
name: Schema modeling for performance
description: Graph model changes to improve FalkorDB query performance when rewrites and indexes are not enough
---

# Schema modeling for performance

Structural changes to the graph model that improve performance. These are higher-cost than query rewrites or indexes — apply only with strong evidence (PROFILE output, confirmed high-degree nodes).

## Usage

Consider schema changes when:
- `GRAPH.PROFILE` shows `Conditional Traverse` producing 10,000+ records from a single node (supernode)
- Index and query rewrites have been applied but queries are still slow
- Multiple query patterns hit the same structural bottleneck

### Supernode mitigation

Split high-degree nodes using intermediate bucket nodes:

```cypher
-- Instead of: (celebrity)-[:FOLLOWED_BY]->(follower) with 1M edges
-- Use temporal buckets:
CREATE (celebrity)-[:HAS_BUCKET]->(b:FollowerBucket {month: '2024-01'})-[:CONTAINS]->(follower)
```

### Relationship type specificity

Use specific relationship types instead of generic ones:

```cypher
-- BAD: generic type forces scanning all relationships
MATCH (u:User)-[:RELATED_TO {type: 'authored'}]->(p:Post) RETURN p

-- GOOD: specific type lets the planner filter at traversal time
MATCH (u:User)-[:AUTHORED]->(p:Post) RETURN p
```

### Denormalize hot-path properties

Copy frequently-accessed properties onto relationships to avoid extra traversals:

```cypher
-- Instead of traversing to get the author name every time:
-- Store it on the relationship during write
CREATE (u)-[:AUTHORED {author_name: u.name}]->(post)
-- Then read without extra hop:
MATCH (post:Post)<-[a:AUTHORED]-(u) RETURN post.title, a.author_name
```

## Example

```bash
# Check for supernodes: look for high record counts in Conditional Traverse
redis-cli GRAPH.PROFILE social "MATCH (c:Celebrity)-[:FOLLOWED_BY]->(f) RETURN count(f)"
# If Conditional Traverse shows Records produced: 100000+, consider fan-out partitioning
```

## Notes

- Schema changes are high-cost — only apply with evidence from `GRAPH.PROFILE`
- Supernode threshold varies by use case; 10,000+ edges from one node is a common warning sign
- Relationship type specificity helps the planner filter early during traversal
- Denormalization trades write complexity for read performance — use for read-heavy hot paths
- Always benchmark before and after schema changes with representative workloads
