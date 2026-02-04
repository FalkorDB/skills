---
name: Use Docker Compose for repeatable local stacks
description: Define FalkorDB configuration with ports and environment variables in docker-compose.yml
---

# Use Docker Compose for repeatable local stacks

Define ports and environment variables in a compose file for reproducible development environments.

## Usage

Create a `docker-compose.yml` file to define your FalkorDB service configuration.

## Example

```yaml
services:
  falkordb:
    image: falkordb/falkordb:latest
    ports:
      - "6379:6379"
      - "3000:3000"
    environment:
      - REDIS_ARGS=--requirepass falkordb
      - FALKORDB_ARGS=THREAD_COUNT 4
```

## Notes

- Docker Compose allows version-controlled infrastructure configuration
- All team members can use the same configuration
- Easy to start with `docker-compose up` and stop with `docker-compose down`
- Environment variables persist in the compose file
- Can add volumes for data persistence
- Supports multiple services in the same stack
