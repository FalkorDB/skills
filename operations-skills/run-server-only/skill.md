---
name: Run server-only for production-style usage
description: Run FalkorDB server-only container without browser UI for lean production deployments
---

# Run server-only for production-style usage

Use the server-only image for lean deployments without the browser interface.

## Usage

Use the `falkordb-server` image when you only need the database server without the UI.

## Example

```bash
docker run -p 6379:6379 -it --rm falkordb/falkordb-server:latest
```

## Notes

- The server-only image is lighter and more suitable for production
- Only port 6379 (database) is exposed
- No browser UI is included in this image
- Reduces container size and attack surface
- Recommended for production and automated deployments
- Can be accessed via any Redis client or FalkorDB SDK
