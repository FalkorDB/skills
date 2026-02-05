---
name: Delete or flush UDF libraries
description: Remove specific UDF libraries with GRAPH.UDF DELETE or clear all with GRAPH.UDF FLUSH
---

# Delete or flush UDF libraries

Remove specific UDF libraries or clear all UDFs from FalkorDB.

## Usage

Use `GRAPH.UDF DELETE` to remove a specific library by name, or `GRAPH.UDF FLUSH` to remove all libraries.

## Example

```bash
redis-cli GRAPH.UDF DELETE StringUtils
redis-cli GRAPH.UDF FLUSH
```

## Notes

- `GRAPH.UDF DELETE` removes a single library by name
- `GRAPH.UDF FLUSH` removes all UDF libraries at once
- Be careful with `FLUSH` as it removes all UDFs without confirmation
- After deletion, queries using those UDFs will fail
- Useful for cleanup during development or when replacing UDF implementations
