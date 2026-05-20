---
name: falkordb-ingest
description: >
  Bulk-load data into FalkorDB or migrate from another database. Decision
  tree by source: CSV (foundational), Neo4j, AWS Neptune, and SQL systems
  (PostgreSQL, MySQL, BigQuery, etc.). TRIGGER when: loading a CSV into a
  FalkorDB graph, migrating from Neo4j / Neptune / SQL into FalkorDB, or
  setting up ongoing SQL → FalkorDB sync. SKIP when: writing small inline
  `CREATE` queries — those go through falkordb-cypher, not bulk loading.
license: MIT
metadata:
  author: FalkorDB
  version: "2.0"
---

# falkordb-ingest

For meaningful volumes of data, don't loop `GRAPH.QUERY CREATE`. Use the
bulk loader (for CSV) or a source-specific migration tool. Pick by source
below.

## Procedure (pick by source)

### Source: CSV

`falkordb-bulk-insert` is the foundational loader — most migrations
eventually end with it.

```bash
falkordb-bulk-insert social \
  -n Users.csv \
  -N Company Companies.csv \
  -r FRIENDS_WITH friends.csv \
  -u redis://127.0.0.1:6379
```

Flag reference:

| Flag | Meaning |
|---|---|
| `<graph>` (positional) | Target graph name |
| `-n <file.csv>` | Node CSV; **filename is the node Label** |
| `-N <Label> <file.csv>` | Node CSV with explicit Label |
| `-r <file.csv>` | Relationship CSV; **filename is the Relationship Type** |
| `-R <Type> <file.csv>` | Relationship CSV with explicit Type |
| `-u <url>` | Redis URL (default `redis://127.0.0.1:6379`) |

### Source: Neo4j

Two-step: extract to CSV, then load. **No APOC plugin required** in Neo4j.

```bash
# 1. Extract from Neo4j
python3 neo4j_to_csv_extractor.py \
  --uri neo4j://localhost:7687 \
  --username neo4j \
  --password secret \
  --database movies

# 2. Load into FalkorDB
python3 falkordb_csv_loader.py \
  --config migrate_config.json \
  --dir csv_output
```

Migrates nodes, edges, constraints, and indexes. Generate a config
template with `--generate-template` if you need to customize label /
property mapping.

### Source: AWS Neptune

Two-step: convert Neptune export CSVs to FalkorDB-shaped CSVs, then
bulk-load.

```bash
# 1. Convert Neptune CSVs to FalkorDB format
python3 neptune_to_falkordb_converter.py \
  --input-dir /path/to/neptune/export \
  --output-dir /path/to/falkordb/csvs

# 2. Bulk-load (uses falkordb-bulk-loader under the hood)
python3 bulk_load_to_falkordb.py \
  --input-dir /path/to/falkordb/csvs \
  --graph my_graph \
  --host 127.0.0.1 \
  --port 6379
```

The converter auto-detects Neptune export files and preserves labels,
properties, and JSON-typed values.

### Source: SQL (PostgreSQL, MySQL, BigQuery, Snowflake, ...)

A Rust tool maps relational tables to graph structures via a declarative
config. Supports one-shot migration or continuous sync.

```bash
cd PostgreSQL-to-FalkorDB/postgres-to-falkordb
cargo build --release

# Single run
cargo run --release -- --config config.yaml

# Continuous sync (daemon mode)
cargo run --release -- --config config.yaml --daemon --interval-secs 60
```

Supported systems: BigQuery, ClickHouse, Databricks, MariaDB, MySQL,
PostgreSQL, Snowflake, Spark, SQL Server. A web control plane is
available for configuring and tracking ETL/CDC runs.

## Reference

| Source | Tool | Mode |
|---|---|---|
| CSV | `falkordb-bulk-insert` | One-shot |
| Neo4j | `neo4j_to_csv_extractor.py` → `falkordb_csv_loader.py` | One-shot, schema-aware |
| Neptune | `neptune_to_falkordb_converter.py` → `bulk_load_to_falkordb.py` | One-shot |
| SQL (9 engines) | `postgres-to-falkordb` (Rust) | One-shot or `--daemon` continuous |

## Gotchas

- **Bulk-loader filename convention is load-bearing.** With `-n` / `-r`,
  the filename *is* the label / relationship-type. Use `-N` / `-R` if
  your filenames don't match.
- **The Neptune step-2 script requires `falkordb-bulk-loader` installed.**
  Install the bulk loader before running the converter pipeline.
- **SQL daemon mode is incremental sync**, not full re-migration. The
  initial run should be one-shot; the daemon picks up changes from there.
  Re-running the one-shot after the daemon has been live may duplicate
  data.
- **For tiny / ad-hoc loads, use `GRAPH.QUERY ... CREATE`** instead.
  Bulk loaders have setup overhead that isn't worth it for small data.
- **Bulk loaders connect over Redis protocol** — auth, if enabled,
  belongs in the connection URL (`redis://:password@host:port`).
