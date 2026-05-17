---
name: Migrate SQL to FalkorDB
description: Migrate and continuously sync data from SQL systems into FalkorDB
---

# Migrate SQL to FalkorDB

Migrate and incrementally sync data from SQL supporting systems (PostgreSQL, MySQL, BigQuery, etc.) into FalkorDB using declarative JSON/YAML mappings.

## Usage

Use the corresponding Rust-based loader (e.g., `postgres-to-falkordb`) to migrate data either as a single run or a continuous sync (daemon mode).

## Example

```bash
# Build the tool (e.g., for PostgreSQL)
cd PostgreSQL-to-FalkorDB/postgres-to-falkordb
cargo build --release

# Single run for initial migration
cargo run --release -- --config config.yaml

# Continuous sync (daemon mode)
cargo run --release -- --config config.yaml --daemon --interval-secs 60
```

## Notes

- Supports multiple systems: BigQuery, ClickHouse, Databricks, MariaDB, MySQL, PostgreSQL, Snowflake, Spark, and SQL Server.
- Provides a control plane web tool to configure, initiate, and track ETL/CDC data migration runs.
- Maps tabular relational data to graph structures based on declarative configurations.
