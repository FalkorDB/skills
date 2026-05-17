---
name: Migrate Neptune to FalkorDB
description: Convert AWS Neptune Export CSVs and load them into FalkorDB
---

# Migrate Neptune to FalkorDB

Migrate data from AWS Neptune to FalkorDB in a two-phase workflow.

## Usage

Use `neptune_to_falkordb_converter.py` to convert Neptune CSV exports into FalkorDB-ready CSVs. Then load the artifacts using `bulk_load_to_falkordb.py`.

## Example

```bash
# 1. Convert Neptune CSVs to FalkorDB format
python3 neptune_to_falkordb_converter.py \
  --input-dir /path/to/neptune/export \
  --output-dir /path/to/falkordb/csvs

# 2. Bulk load the converted files into FalkorDB
python3 bulk_load_to_falkordb.py \
  --input-dir /path/to/falkordb/csvs \
  --graph my_graph \
  --host 127.0.0.1 \
  --port 6379
```

## Notes

- Intelligent file detection finds Neptune export files automatically.
- Labels and properties are maintained, organizing files by node label and edge type.
- The `bulk_load_to_falkordb.py` script requires `falkordb-bulk-loader` utility to be installed.
- Complex data types and JSON properties from Neptune are correctly parsed.
