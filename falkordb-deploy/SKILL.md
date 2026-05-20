---
name: falkordb-deploy
description: >
  Stand up FalkorDB in Docker or Compose: image choice (with or without
  browser UI), authentication via REDIS_ARGS, module tuning via
  FALKORDB_ARGS, single-container vs split server-and-browser. TRIGGER
  when: writing a docker run command for falkordb/*, writing a
  docker-compose / compose.yaml that includes a FalkorDB service, setting
  auth or module flags, or splitting the browser from the server. SKIP
  when: deploying to managed FalkorDB Cloud (image and flags are abstracted).
license: MIT
metadata:
  author: FalkorDB
  version: "2.0"
---

# falkordb-deploy

The agent already knows `docker run` and `compose.yaml`. This skill
covers the FalkorDB-specific knobs: which image, which env vars, and the
split-container pattern.

## Procedure

### 1. Pick the image

| Image | Includes | Use for |
|---|---|---|
| `falkordb/falkordb` | Server + browser UI on `:3000` | Local dev, demos |
| `falkordb/falkordb-server` | Server only (no UI) | Production, automation |
| `falkordb/falkordb-browser` | Browser UI only | Split deployments (step 5) |

The server speaks the Redis protocol on **`:6379`**, so any Redis client
(or the `falkordb` Python/JS SDK) connects normally.

### 2. Set authentication with `REDIS_ARGS`

`REDIS_ARGS` is forwarded verbatim to the Redis server. Use it for any
standard Redis flag.

```bash
docker run -p 6379:6379 -p 3000:3000 -it \
  -e REDIS_ARGS="--requirepass yourpassword" \
  --rm falkordb/falkordb:latest
```

Multiple Redis flags can be space-separated inside the same env var.

### 3. Tune the module with `FALKORDB_ARGS`

`FALKORDB_ARGS` is FalkorDB-specific. Common settings:

- `THREAD_COUNT <n>` — query-execution worker threads (default: hardware threads)
- `CACHE_SIZE <n>` — query-plan cache slots (default: 25)
- `TIMEOUT_DEFAULT <ms>` — default per-query timeout
- `TIMEOUT_MAX <ms>` — upper bound for the per-query `timeout` argument
- `RESULTSET_SIZE <n>` — max records returned per query
- `QUERY_MEM_CAPACITY <bytes>` — memory limit per query

Inspect or change at runtime with `GRAPH.CONFIG GET *` / `SET` — note that
runtime `SET` is **not** persisted across restarts (see `falkordb-analyze`).

Settings are space-separated *key then value* pairs (no `=`):

```bash
docker run -p 6379:6379 -p 3000:3000 -it \
  -e FALKORDB_ARGS="THREAD_COUNT 4 CACHE_SIZE 50 TIMEOUT_MAX 5000" \
  --rm falkordb/falkordb:latest
```

### 4. Put it in Compose for repeatability

```yaml
services:
  falkordb:
    image: falkordb/falkordb:latest
    ports:
      - "6379:6379"
      - "3000:3000"
    environment:
      - REDIS_ARGS=--requirepass falkordb
      - FALKORDB_ARGS=THREAD_COUNT 4 CACHE_SIZE 50 TIMEOUT_MAX 5000
    volumes:
      - falkordb-data:/data
volumes:
  falkordb-data:
```

### 5. Split server and browser (closer to prod architecture)

The browser is a separate image (`falkordb/falkordb-browser`) that points
at a server over `FALKORDB_URL`.

```yaml
services:
  falkordb-server:
    image: falkordb/falkordb-server:latest
    ports:
      - "6379:6379"
    environment:
      - REDIS_ARGS=--requirepass falkordb
  falkordb-browser:
    image: falkordb/falkordb-browser:latest
    ports:
      - "3000:3000"
    environment:
      - FALKORDB_URL=redis://falkordb-server:6379
      - FALKORDB_PASSWORD=falkordb
```

The browser uses the Compose service name (`falkordb-server`) to resolve
the connection inside the Docker network.

## Reference

| Concern | Knob |
|---|---|
| Full image (server + UI) | `falkordb/falkordb` |
| Server-only image | `falkordb/falkordb-server` |
| Standalone browser image | `falkordb/falkordb-browser` |
| DB port | `6379` (Redis protocol) |
| UI port | `3000` |
| Redis flags (incl. auth) | `REDIS_ARGS="--requirepass ..."` |
| Module tuning | `FALKORDB_ARGS="THREAD_COUNT n TIMEOUT ms ..."` |
| Browser → server URL | `FALKORDB_URL=redis://<host>:6379` |
| Browser auth | `FALKORDB_PASSWORD=...` |

## Gotchas

- **Two env vars, two destinations.** `REDIS_ARGS` goes to the Redis
  server; `FALKORDB_ARGS` goes to the FalkorDB module. Mixing them
  silently no-ops — e.g. `REDIS_ARGS="THREAD_COUNT 4"` does nothing.
- **`FALKORDB_ARGS` syntax is positional pairs**, not `KEY=VAL`. Use
  `THREAD_COUNT 4`, not `THREAD_COUNT=4`.
- **`TIMEOUT` (without the suffix) is not a real parameter.** Use
  `TIMEOUT_DEFAULT` and `TIMEOUT_MAX` — older snippets that show plain
  `TIMEOUT` will silently no-op.
- **Split-browser needs both `FALKORDB_URL` and `FALKORDB_PASSWORD`** when
  the server has auth on — without both, the browser silently fails to
  authenticate.
- **No data persistence by default.** `--rm` and the absence of a volume
  mount mean data dies with the container. Mount `/data` to a named
  volume (or a host path) for persistence.
- **Browser image vs server image are NOT interchangeable.** The browser
  image does not run a database; pointing clients at it gets you no graph.
