---
name: Set authentication using REDIS_ARGS
description: Configure Redis authentication password using REDIS_ARGS environment variable
---

# Set authentication using REDIS_ARGS

Pass Redis server flags via environment variables to enable authentication.

## Usage

Use the `REDIS_ARGS` environment variable to pass Redis configuration flags like `--requirepass`.

## Example

```bash
docker run -p 6379:6379 -p 3000:3000 -it \
  -e REDIS_ARGS="--requirepass yourpassword" \
  --rm falkordb/falkordb:latest
```

## Notes

- `REDIS_ARGS` accepts any standard Redis server configuration flags
- `--requirepass` sets a password for authentication
- Clients must use AUTH command or provide password in connection string
- Essential for production deployments to prevent unauthorized access
- Can combine multiple flags in REDIS_ARGS (space-separated)
- The browser will prompt for the password when connecting
