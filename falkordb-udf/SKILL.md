---
name: falkordb-udf
description: >
  Manage FalkorDB JavaScript UDF libraries — load, call from Cypher, list,
  delete, flush. Includes the pure-function constraint that decides whether
  something belongs as a UDF at all. TRIGGER when: writing custom JS UDFs
  for FalkorDB, calling db.udf_load, using LibName.func() in Cypher, or
  running GRAPH.UDF LIST/DELETE/FLUSH. SKIP when: the computation needs to
  mutate the graph (UDFs cannot — use Cypher instead) or make network /
  filesystem calls.
license: MIT
metadata:
  author: FalkorDB
  version: "2.0"
---

# falkordb-udf

FalkorDB UDFs are pure JavaScript functions callable from Cypher. They
extend the function set with custom transformations; they do **not**
extend Cypher's write capabilities.

## Procedure

### 1. Confirm it's actually a UDF candidate

Before writing any code, check the constraints. A UDF must be:

- **Pure** — same inputs always produce the same output.
- **Read-only** — no `CREATE`, `SET`, `DELETE`, `MERGE`, no graph mutation
  of any kind.
- **Self-contained** — no network calls, no filesystem, no clocks, no
  randomness, no I/O.

If your function needs to mutate the graph or talk to the outside world,
it is not a UDF. Use a Cypher query (possibly calling a UDF for the
computed value) instead.

### 2. Write JS and register with `falkor.register`

Functions become available under the library name as a namespace.

```javascript
function UpperCaseOdd(s) {
  return s.split('')
    .map((c, i) => i % 2 !== 0 ? c.toUpperCase() : c)
    .join('');
}

falkor.register('UpperCaseOdd', UpperCaseOdd);
```

A single library can register many functions — call `falkor.register`
multiple times in the same script.

### 3. Load with the FalkorDB client

```python
from falkordb import FalkorDB

db = FalkorDB(host='localhost', port=6379)
db.udf_load("StringUtils", script)   # library name, JS source as string
```

The library name is the Cypher-side namespace. Loaded libraries persist
across restarts.

### 4. Call from Cypher as `LibName.FuncName`

UDFs behave like built-in functions — usable anywhere a function is.

```python
g = db.select_graph("social")
g.query("RETURN StringUtils.UpperCaseOdd('abcdef')").result_set
```

Valid in `RETURN`, `WHERE`, `SET`, projections, ORDER BY — anywhere a
scalar expression is allowed.

### 5. Audit and remove

```bash
redis-cli GRAPH.UDF LIST                # just library names
redis-cli GRAPH.UDF LIST WITHCODE       # names + full JS source (audit)
redis-cli GRAPH.UDF DELETE StringUtils  # remove one
redis-cli GRAPH.UDF FLUSH               # remove ALL libraries — destructive
```

After deletion, queries that reference the UDF fail at parse / runtime.

## Reference

| Operation | Command / API |
|---|---|
| Register inside JS | `falkor.register('Name', fn)` |
| Load library | `db.udf_load(libName, jsString)` (Python client) |
| Call from Cypher | `LibName.FuncName(args)` |
| List libraries | `GRAPH.UDF LIST` |
| List with source | `GRAPH.UDF LIST WITHCODE` |
| Delete one | `GRAPH.UDF DELETE <lib>` |
| Delete all | `GRAPH.UDF FLUSH` |

## Gotchas

- **`GRAPH.UDF FLUSH` removes everything with no confirmation.** Treat it
  like `FLUSHDB`. Prefer `DELETE <lib>` in any non-trivial environment.
- **Pure-function rule is enforced by the sandbox**, not the docs — code
  that tries to mutate the graph or call out fails at runtime, often
  cryptically. Decide whether the function belongs as a UDF *before*
  writing it.
- **The library name is the namespace.** Functions in the same library
  share the prefix; two libraries can each have a `Foo` without conflict
  because they're addressed as `LibA.Foo` vs `LibB.Foo`.
- **Loading replaces the whole library.** Re-uploading `StringUtils`
  swaps the entire prior set of functions in that namespace; you cannot
  patch-load a single function.
- **JS type conversion rules apply on the boundary.** Numbers become
  doubles, JS objects become Cypher maps, `null` round-trips — but BigInt
  and Date semantics differ from what JS code typically expects.
