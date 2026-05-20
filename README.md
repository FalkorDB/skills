# FalkorDB Skills

Five playbook-style [Agent Skills](https://agentskills.io) for [FalkorDB](https://falkordb.com) — the FalkorDB-specific knowledge your AI coding agent doesn't come with out of the box. Each skill is procedural (**trigger → procedure → reference → gotchas**), not a documentation rewrite.

## Why use these skills?

AI assistants know *about* graph databases and Cypher, but they get FalkorDB-specific details wrong: `SET prop = NULL` instead of `REMOVE`, the `CYPHER` parameter prelude, `GRAPH.RO_QUERY` for safe reads, `vecf32()` literals for vectors, which env vars configure auth vs. module tuning, which predicate shapes (`<>`) silently bypass indexes. These five skills encode those gotchas as workflows, not a 30-page lookup table.

| Skill | Use when |
| --- | --- |
| **[`falkordb-cypher`](falkordb-cypher/SKILL.md)** | Authoring or editing Cypher queries against FalkorDB |
| **[`falkordb-analyze`](falkordb-analyze/SKILL.md)** | Diagnosing slow queries, verifying index usage, inspecting graph state |
| **[`falkordb-udf`](falkordb-udf/SKILL.md)** | Managing JavaScript UDF libraries (load / call / list / delete) |
| **[`falkordb-deploy`](falkordb-deploy/SKILL.md)** | Standing up FalkorDB in Docker or Compose |
| **[`falkordb-ingest`](falkordb-ingest/SKILL.md)** | Bulk-loading CSVs or migrating from Neo4j / Neptune / SQL |

## Quick start

Clone into your project:

```bash
git clone https://github.com/FalkorDB/skills.git .falkordb-skills
```

Point your AI assistant at the directory of the skill that matches the task — e.g. `.falkordb-skills/falkordb-cypher/SKILL.md` when writing queries, `.falkordb-skills/falkordb-analyze/SKILL.md` when debugging a slow one.

Each `SKILL.md` follows the [Agent Skills spec](https://agentskills.io): a frontmatter `description` that triggers invocation, followed by a procedure, a reference table, and a gotchas section.

## Design philosophy

These skills intentionally do **not** restate standard Cypher, standard Docker, or standard `docker-compose`. If a competent agent gets it right OOB, it isn't in here — refer to the upstream docs at [docs.falkordb.com](https://docs.falkordb.com) for foundational material.

What *is* in here: the things that diverge from agent priors and bite users in practice.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
