---
name: Call a UDF from Cypher
description: Invoke registered UDFs within Cypher queries using LibraryName.FunctionName() syntax
---

# Call a UDF from Cypher

Invoke registered UDFs within Cypher queries as if they were built-in functions.

## Usage

Reference UDFs using the library namespace followed by the function name (e.g., `LibraryName.FunctionName()`).

## Example

```python
from falkordb import FalkorDB

db = FalkorDB(host='localhost', port=6379)
g = db.select_graph("social")
result = g.query("RETURN StringUtils.UpperCaseOdd('abcdef')").result_set
print(result)
```

## Notes

- UDFs are called using `LibraryName.FunctionName()` syntax
- They can be used anywhere built-in functions can be used
- UDFs can be part of `RETURN`, `WHERE`, `SET`, or other Cypher clauses
- Arguments are passed just like built-in functions
- Return values follow JavaScript type conversion rules
