---
name: Use Bulk Loader from CSV
description: Build FalkorDB databases from CSV inputs using the falkordb-bulk-loader utility
---

# Use Bulk Loader from CSV

Build FalkorDB databases from CSV inputs using the `falkordb-bulk-loader` Python utility.

## Usage

Use `falkordb-bulk-insert` to load nodes and relationships from CSV files into FalkorDB.

## Example

```bash
falkordb-bulk-insert social \
  -n Users.csv \
  -N Company Companies.csv \
  -r FRIENDS_WITH friends.csv \
  -u redis://127.0.0.1:6379
```

## Notes

- Required arguments are the graph name and at least one node CSV file.
- Use `-n` for node CSV where the filename is the Node Label.
- Use `-N <Label> <file.csv>` for node CSV where you specify the Node Label explicitly.
- Use `-r` for relationship CSV where the filename is the Relationship Type.
- Use `-R <Type> <file.csv>` for relationship CSV where you specify the Relationship Type explicitly.
- Server URL is specified with `-u` (default is `redis://127.0.0.1:6379`).
