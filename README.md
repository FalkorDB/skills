# FalkorDB Claude Code Skills

Curated, task-focused FalkorDB guidance for Claude Code and other agentic IDEs. Use this repository to load practical FalkorDB examples and workflows into your assistant for faster, higher‑quality answers.


## What's inside

This repository contains 27 individual FalkorDB skills organized into three categories:

- **[cypher-skills/](cypher-skills/)**: 16 skills covering graph query operations, indexes, and optimization
- **[udf-skills/](udf-skills/)**: 5 skills for User-Defined Functions in JavaScript
- **[operations-skills/](operations-skills/)**: 6 skills for Docker deployment and configuration

Each skill is in its own folder with a `skill.md` file formatted according to the [Claude skills specification](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills), including YAML frontmatter with name and description, usage instructions, examples, and notes.

For reference, the original consolidated format is still available in [skills.md](skills.md).

## Quick start

### Using Individual Skills

1. Browse the skill categories: [cypher-skills/](cypher-skills/), [udf-skills/](udf-skills/), or [operations-skills/](operations-skills/)
2. Open any skill folder and view its `skill.md` file
3. Load individual skills into Claude Code when you need specific FalkorDB guidance
4. Each skill can be used independently or combined with others

### Skill Format

Each `skill.md` follows this structure:
```yaml
---
name: Skill Name
description: What the skill does and when to use it
---
# Skill Name
## Usage
## Example
## Notes
```

### Cypher Skills

#### 1) Create nodes and relationships

![Demo](videos/cypher/01-create-nodes-and-relationships.gif)

---

#### 2) Match patterns and return projections

![Demo](videos/cypher/02-match-patterns-and-return-projections.gif)

---

#### 3) Use MERGE to avoid duplicate nodes

![Demo](videos/cypher/03-use-merge-to-avoid-duplicate-nodes.gif)

---

#### 4) Update and remove properties safely

![Demo](videos/cypher/04-update-and-remove-properties-safely.gif)

---

#### 5) Use parameterized queries for cache reuse

![Demo](videos/cypher/05-parameterized-queries-for-cache-reuse.gif)

---

#### 6) Run safe read-only queries

![Demo](videos/cypher/06-run-safe-read-only-queries.gif)

---

#### 7) Inspect query plans before execution

![Demo](videos/cypher/07-inspect-query-plans-before-execution.gif)

---

#### 8) Profile query runtime behavior

![Demo](videos/cypher/08-profile-query-runtime-behavior.gif)

---

#### 9) Create range indexes for exact/range lookups

![Demo](videos/cypher/09-create-range-indexes.gif)

---

#### 10) Verify index usage

![Demo](videos/cypher/10-verify-index-usage.gif)

---

#### 11) Create and query full-text indexes

![Demo](videos/cypher/11-full-text-indexes.gif)

---

#### 12) Create and query vector indexes

![Demo](videos/cypher/12-vector-indexes.gif)

---

#### 13) Manage constraints with awareness of async creation

![Demo](videos/cypher/13-manage-constraints-async-creation.gif)

---

#### 14) Inspect graphs and memory usage

![Demo](videos/cypher/14-inspect-graphs-and-memory-usage.gif)

---

#### 15) Track slow queries

![Demo](videos/cypher/15-track-slow-queries.gif)

---

#### 16) Apply FalkorDB Cypher limitations correctly

![Demo](videos/cypher/16-cypher-limitations-correctly.gif)

### UDF Skills

#### 1) Load a JavaScript UDF library

![Demo](videos/udf/01-load-js-udf-library.gif)

---

#### 2) Call a UDF from Cypher

![Demo](videos/udf/02-call-udf-from-cypher.gif)

---

#### 3) List UDF libraries (with code)

![Demo](videos/udf/03-list-udf-libraries-with-code.gif)

---

#### 4) Delete or flush UDF libraries

![Demo](videos/udf/04-delete-or-flush-udf-libraries.gif)

---

#### 5) Respect UDF limitations

![Demo](videos/udf/05-respect-udf-limitations.gif)

### Operations Skills (Docker)

#### 1) Run FalkorDB with browser for local development

![Demo](videos/ops/01-run-with-browser-local-dev.gif)

---

#### 2) Run server-only for production-style usage

![Demo](videos/ops/02-run-server-only.gif)

---

#### 3) Set authentication using REDIS_ARGS

![Demo](videos/ops/03-set-auth-redis-args.gif)

---

#### 4) Set module config using FALKORDB_ARGS

![Demo](videos/ops/04-set-module-config-falkordb-args.gif)

---

#### 5) Use Docker Compose for repeatable local stacks

![Demo](videos/ops/05-docker-compose-local-stacks.gif)

---

#### 6) Run the browser separately against a server

![Demo](videos/ops/06-browser-separate-server.gif)

## Scope and sources

Content is derived from the official FalkorDB documentation at [docs.falkordb.com](https://docs.falkordb.com) and distilled into short, actionable snippets.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting updates.

## License

See [LICENSE](LICENSE).
