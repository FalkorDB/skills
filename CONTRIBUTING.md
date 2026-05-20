# Contributing

Thank you for contributing to the FalkorDB skills.

## Guidelines

- Keep changes practical and specific to FalkorDB.
- Skills should encode what an AI agent gets wrong OOB — FalkorDB-specific divergences from standard Cypher / Docker / Redis. Don't re-paste content that's already in the upstream docs.
- Provide explicit, runnable examples and cite exact commands.
- Each `SKILL.md` follows the [Agent Skills specification](https://agentskills.io): YAML frontmatter (with a strong `description` trigger), then **Procedure → Reference → Gotchas** sections.
- Avoid marketing language; concise and authoritative.

## Repo layout

Each skill lives in its own directory at the repo root:

- `falkordb-cypher/SKILL.md`
- `falkordb-analyze/SKILL.md`
- `falkordb-udf/SKILL.md`
- `falkordb-deploy/SKILL.md`
- `falkordb-ingest/SKILL.md`

## Submitting changes

1. Edit the relevant `<skill-name>/SKILL.md`, or add a new `falkordb-<area>/SKILL.md` directory if your change doesn't fit an existing skill.
2. Update [README.md](README.md) if you add or rename a skill.
3. Validate examples against current FalkorDB behavior (or [docs.falkordb.com](https://docs.falkordb.com)).
4. Open a pull request with a clear summary of changes.
