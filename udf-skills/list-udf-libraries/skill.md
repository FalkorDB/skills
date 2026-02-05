---
name: List UDF libraries (with code)
description: View all loaded UDF libraries and their source code using GRAPH.UDF LIST WITHCODE
---

# List UDF libraries (with code)

View all loaded UDF libraries and optionally inspect their source code.

## Usage

Use `GRAPH.UDF LIST WITHCODE` to display all registered UDF libraries along with their JavaScript source code.

## Example

```bash
redis-cli GRAPH.UDF LIST WITHCODE
```

## Notes

- `GRAPH.UDF LIST` shows library names without source code
- `GRAPH.UDF LIST WITHCODE` includes the full JavaScript source
- Useful for auditing what UDFs are loaded in the system
- Helps with debugging and understanding available functions
- Important for security audits to verify loaded code
