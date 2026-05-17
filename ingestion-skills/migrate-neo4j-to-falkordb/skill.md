---
name: Migrate Neo4j to FalkorDB
description: Extract data from Neo4j to CSV and load it into FalkorDB
---

# Migrate Neo4j to FalkorDB

Migrate graph database contents from Neo4j to FalkorDB using the extractor and loader scripts.

## Usage

Use `neo4j_to_csv_extractor.py` to extract nodes and edges to CSV format, and then load them into FalkorDB using `falkordb_csv_loader.py` (or FalkorDB-Loader-RS).

## Example

```bash
# 1. Extract from Neo4j
python3 neo4j_to_csv_extractor.py \
  --uri neo4j://localhost:7687 \
  --username neo4j \
  --password secret \
  --database movies

# 2. Load into FalkorDB (Assuming CSV outputs are generated in 'csv_output' directory)
python3 falkordb_csv_loader.py \
  --config migrate_config.json \
  --dir csv_output
```

## Notes

- The process migrates nodes, edges, constraints, and indexes.
- A template config file can be generated with `--generate-template` to modify how labels and properties are represented.
- Works without requiring APOC plugins in Neo4j.
