---
name: Run the browser separately against a server
description: Run FalkorDB browser and server as separate containers connected via FALKORDB_URL
---

# Run the browser separately against a server

Use `FALKORDB_URL` to point the browser container to a separate server instance.

## Usage

Run the server and browser as separate services, using environment variables to configure the connection.

## Example

```yaml
services:
  falkordb-server:
    image: falkordb/falkordb-server:latest
    ports:
      - "6379:6379"
  falkordb-browser:
    image: falkordb/falkordb-browser:latest
    ports:
      - "3000:3000"
    environment:
      - FALKORDB_URL=redis://falkordb-server:6379
      - FALKORDB_PASSWORD=falkordb
```

## Notes

- Separating server and browser allows independent scaling and management
- `FALKORDB_URL` specifies the Redis connection URL for the browser
- `FALKORDB_PASSWORD` provides the authentication password if set
- The browser can connect to any FalkorDB server, local or remote
- Use service names (e.g., `falkordb-server`) for inter-container communication
- This setup is closer to production architecture patterns
