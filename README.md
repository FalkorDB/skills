# FalkorDB Skills

Practical [FalkorDB](https://falkordb.com) guidance packaged as an [Agent Skill](https://agentskills.io). Give your AI coding assistant deep knowledge of FalkorDB -- Cypher queries, user-defined functions, Docker operations, indexing, and more.

## Why use this skill?

AI assistants know *about* graph databases, but they often get FalkorDB-specific details wrong: incorrect command syntax, missing index types, unsupported Cypher clauses. This skill fills those gaps with **27 runnable examples** sourced from the [official docs](https://docs.falkordb.com), covering the three areas you need most:

| Category | Skills | What you get |
| --- | --- | --- |
| **Cypher** | 16 | Node/relationship CRUD, MERGE upserts, parameterized queries, EXPLAIN/PROFILE, range/full-text/vector indexes, constraints, introspection, slow-query tracking, and known limitations |
| **UDFs** | 5 | Load JavaScript UDF libraries, call UDFs from Cypher, list/delete libraries, and understand UDF constraints |
| **Docker Ops** | 6 | Run with browser UI, server-only mode, authentication, module config, Docker Compose, and split browser/server deployments |

## Quick start

### Clone into your project

```bash
git clone https://github.com/FalkorDB/skills.git .falkordb-skills
```

Then point your AI assistant at `.falkordb-skills/SKILL.md` when working with FalkorDB.

### Or copy the file directly

Download [`SKILL.md`](SKILL.md) and load it into any LLM context window -- everything is in that single file.

## What's inside

### Cypher Skills

| # | Skill | Key command |
| --- | --- | --- |
| 1 | Create nodes and relationships | `GRAPH.QUERY ... CREATE` |
| 2 | Match patterns and return projections | `GRAPH.QUERY ... MATCH ... RETURN` |
| 3 | Use MERGE to avoid duplicate nodes | `GRAPH.QUERY ... MERGE` |
| 4 | Update and remove properties safely | `SET prop = NULL` (no REMOVE) |
| 5 | Parameterized queries for cache reuse | `CYPHER key=val ... $key` |
| 6 | Run safe read-only queries | `GRAPH.RO_QUERY` |
| 7 | Inspect query plans before execution | `GRAPH.EXPLAIN` |
| 8 | Profile query runtime behavior | `GRAPH.PROFILE` |
| 9 | Create range indexes | `CREATE INDEX FOR (n:Label) ON (n.prop)` |
| 10 | Verify index usage | `GRAPH.EXPLAIN` then look for Index Scan |
| 11 | Full-text indexes | `db.idx.fulltext.createNodeIndex` |
| 12 | Vector indexes (HNSW / ANN) | `CREATE VECTOR INDEX ... OPTIONS {...}` |
| 13 | Manage constraints (async creation) | `GRAPH.CONSTRAINT CREATE` |
| 14 | Inspect graphs and memory usage | `GRAPH.LIST` / `GRAPH.INFO` / `GRAPH.MEMORY USAGE` |
| 15 | Track slow queries | `GRAPH.SLOWLOG` |
| 16 | Apply FalkorDB Cypher limitations | Not-equal filters are not index-accelerated |

### UDF Skills

| # | Skill | Key command |
| --- | --- | --- |
| 1 | Load a JavaScript UDF library | `db.udf_load(lib, script)` |
| 2 | Call a UDF from Cypher | `RETURN LibName.funcName(...)` |
| 3 | List UDF libraries (with code) | `GRAPH.UDF LIST WITHCODE` |
| 4 | Delete or flush UDF libraries | `GRAPH.UDF DELETE` / `GRAPH.UDF FLUSH` |
| 5 | Respect UDF limitations | Pure functions only -- no graph mutations |

### Operations Skills (Docker)

| # | Skill | Key command |
| --- | --- | --- |
| 1 | Run with browser for local dev | `docker run -p 6379:6379 -p 3000:3000 ...` |
| 2 | Server-only for production | `falkordb/falkordb-server:latest` |
| 3 | Set authentication | `-e REDIS_ARGS="--requirepass ..."` |
| 4 | Set module config | `-e FALKORDB_ARGS="THREAD_COUNT 4 ..."` |
| 5 | Docker Compose local stacks | Full `compose.yaml` example |
| 6 | Browser separate from server | `FALKORDB_URL=redis://server:6379` |

## Example

Skill #1 -- create nodes and relationships:

```bash
redis-cli GRAPH.QUERY social \
  "CREATE (alice:User {id: 1, name: 'Alice', email: 'alice@example.com'})
   CREATE (bob:User {id: 2, name: 'Bob', email: 'bob@example.com'})
   CREATE (alice)-[:FRIENDS_WITH {since: 1640995200}]->(bob)"
```

All 27 skills follow this pattern: a concise explanation followed by a runnable example.

## Scope and sources

Content is derived from the official FalkorDB documentation at [docs.falkordb.com](https://docs.falkordb.com) and distilled into short, actionable snippets.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
