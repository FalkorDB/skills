---
name: Set module config using FALKORDB_ARGS
description: Configure FalkorDB module settings like thread count and timeout with FALKORDB_ARGS
---

# Set module config using FALKORDB_ARGS

Tune module-level settings for FalkorDB performance and behavior.

## Usage

Use the `FALKORDB_ARGS` environment variable to configure FalkorDB-specific settings like thread count, timeout, and cache size.

## Example

```bash
docker run -p 6379:6379 -p 3000:3000 -it \
  -e FALKORDB_ARGS="THREAD_COUNT 4 TIMEOUT 5000" \
  --rm falkordb/falkordb:latest
```

## Notes

- `FALKORDB_ARGS` configures the FalkorDB graph module specifically
- `THREAD_COUNT` sets the number of worker threads for query execution
- `TIMEOUT` sets maximum query execution time in milliseconds
- Other options may include cache size and other performance tuning parameters
- Settings are space-separated: `SETTING1 value1 SETTING2 value2`
- Tune these based on your workload and hardware capabilities
