---
name: Run FalkorDB with browser for local development
description: Run FalkorDB container with both database and browser UI for local development environments
---

# Run FalkorDB with browser for local development

Expose both database and UI ports for local development with FalkorDB.

## Usage

Use Docker to run FalkorDB with both the database server and browser interface exposed.

## Example

```bash
docker run -p 6379:6379 -p 3000:3000 -it --rm falkordb/falkordb:latest
```

## Notes

- Port 6379 exposes the FalkorDB/Redis database server
- Port 3000 exposes the FalkorDB browser UI
- The `-it` flag allows interactive terminal access
- The `--rm` flag removes the container when stopped
- This is the recommended setup for local development
- Access the browser at http://localhost:3000
