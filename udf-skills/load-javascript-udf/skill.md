---
name: Load a JavaScript UDF library
description: Register User-Defined Functions written in JavaScript with FalkorDB using falkor.register()
---

# Load a JavaScript UDF library

Register User-Defined Functions (UDFs) written in JavaScript with FalkorDB.

## Usage

Use the `falkor.register()` function within JavaScript code to register UDFs, then load the library using the FalkorDB client.

## Example

```python
from falkordb import FalkorDB

db = FalkorDB(host='localhost', port=6379)
lib = "StringUtils"
script = """
function UpperCaseOdd(s) {
  return s.split('')
    .map((c, i) => i % 2 !== 0 ? c.toUpperCase() : c)
    .join('');
};

falkor.register('UpperCaseOdd', UpperCaseOdd);
"""

db.udf_load(lib, script)
```

## Notes

- UDFs must be written in JavaScript
- Use `falkor.register()` to make functions available in Cypher queries
- The library name (`lib`) is used as a namespace for the functions
- UDFs are stored in FalkorDB and persist across restarts
- UDFs must be pure functions without side effects
