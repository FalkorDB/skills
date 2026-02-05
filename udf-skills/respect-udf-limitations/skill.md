---
name: Respect UDF limitations
description: Design UDFs as pure functions that transform data without mutating the graph in FalkorDB
---

# Respect UDF limitations

Understand and work within the constraints of FalkorDB's UDF system.

## Usage

Design UDFs as pure functions that perform transformations without attempting to modify the graph.

## Example

```text
# Use UDFs for transformations only; do not attempt CREATE/SET/DELETE inside JS.
```

## Notes

- UDFs cannot mutate the graph - they are read-only
- UDFs cannot execute CREATE, SET, DELETE, or MERGE operations
- UDFs should be pure functions with no side effects
- UDFs cannot make network calls or access external resources
- Use UDFs for data transformation, computation, and formatting only
- For graph mutations, use Cypher queries that call UDFs for computed values
