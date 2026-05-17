# Ingestion Skills

This directory contains individual skills related to ingesting and migrating data from various sources into FalkorDB.

## Skills

1. **use-bulk-loader-from-csv** - Build FalkorDB databases from CSV inputs using `falkordb-bulk-loader`.
2. **migrate-neo4j-to-falkordb** - Extract data from Neo4j to CSV and load it into FalkorDB without APOC.
3. **migrate-neptune-to-falkordb** - Convert AWS Neptune Export CSVs into FalkorDB-ready artifacts and load them.
4. **migrate-sql-to-falkordb** - Migrate and continuously sync data from SQL systems (PostgreSQL, MySQL, BigQuery, etc.) into FalkorDB.

## Usage

Each skill is in its own directory with a `skill.md` file that includes:
- YAML frontmatter with name and description
- Usage instructions
- Example code
- Important notes
