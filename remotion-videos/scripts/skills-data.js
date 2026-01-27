export const skillsData = [
  {
    id: "cypher-01-create-nodes-and-relationships",
    section: "Cypher Skills",
    title: "Create nodes and relationships",
    description: "Create labeled nodes and connect them with properties.",
    code:
      "redis-cli GRAPH.QUERY social \"CREATE (alice:User {id: 1, name: 'Alice', email: 'alice@example.com'})\n" +
      "CREATE (bob:User {id: 2, name: 'Bob', email: 'bob@example.com'})\n" +
      "CREATE (alice)-[:FRIENDS_WITH {since: 1640995200}]->(bob)\"",
    language: "bash",
    videoPath: "videos/cypher/01-create-nodes-and-relationships.mp4",
  },
  {
    id: "cypher-02-match-patterns-and-return-projections",
    section: "Cypher Skills",
    title: "Match patterns and return projections",
    description: "Match by label/property and return fields.",
    code:
      "redis-cli GRAPH.QUERY social \"MATCH (alice:User {name: 'Alice'})-[:FRIENDS_WITH]->(friend)\n" +
      "RETURN friend.name\"",
    language: "bash",
    videoPath: "videos/cypher/02-match-patterns-and-return-projections.mp4",
  },
  {
    id: "cypher-03-use-merge-to-avoid-duplicate-nodes",
    section: "Cypher Skills",
    title: "Use MERGE to avoid duplicate nodes",
    description: "Use MERGE when you want idempotent upserts.",
    code:
      "redis-cli GRAPH.QUERY social \"MERGE (u:User {id: 42})\n" +
      "ON CREATE SET u.name = 'Dana'\n" +
      "ON MATCH SET u.last_seen = timestamp()\"",
    language: "bash",
    videoPath: "videos/cypher/03-use-merge-to-avoid-duplicate-nodes.mp4",
  },
  {
    id: "cypher-04-update-and-remove-properties-safely",
    section: "Cypher Skills",
    title: "Update and remove properties safely",
    description:
      "Use SET for updates and set properties to NULL to remove them (no REMOVE support).",
    code:
      "redis-cli GRAPH.QUERY social \"MATCH (u:User {id: 42})\n" +
      "SET u.email = 'dana@example.com', u.temp = NULL\"",
    language: "bash",
    videoPath: "videos/cypher/04-update-and-remove-properties-safely.mp4",
  },
  {
    id: "cypher-05-parameterized-queries-for-cache-reuse",
    section: "Cypher Skills",
    title: "Use parameterized queries for cache reuse",
    description: "Use parameters so the query plan is cached and reused.",
    code:
      "redis-cli GRAPH.QUERY social \"CYPHER name='Alice' MATCH (u:User {name: $name}) RETURN u.id\"",
    language: "bash",
    videoPath: "videos/cypher/05-parameterized-queries-for-cache-reuse.mp4",
  },
  {
    id: "cypher-06-run-safe-read-only-queries",
    section: "Cypher Skills",
    title: "Run safe read-only queries",
    description: "Use GRAPH.RO_QUERY for read-only paths; it rejects writes.",
    code: "redis-cli GRAPH.RO_QUERY social \"MATCH (u:User) RETURN count(u)\"",
    language: "bash",
    videoPath: "videos/cypher/06-run-safe-read-only-queries.mp4",
  },
  {
    id: "cypher-07-inspect-query-plans-before-execution",
    section: "Cypher Skills",
    title: "Inspect query plans before execution",
    description:
      "Use GRAPH.EXPLAIN to validate plan shape and index usage without executing.",
    code: "redis-cli GRAPH.EXPLAIN social \"MATCH (p:Person {age: 30}) RETURN p\"",
    language: "bash",
    videoPath: "videos/cypher/07-inspect-query-plans-before-execution.mp4",
  },
  {
    id: "cypher-08-profile-query-runtime-behavior",
    section: "Cypher Skills",
    title: "Profile query runtime behavior",
    description: "Use GRAPH.PROFILE to see per-operator runtime and records.",
    code:
      "redis-cli GRAPH.PROFILE social \"MATCH (u:User)-[:FRIENDS_WITH]->(f)\n" +
      "RETURN f.name ORDER BY f.name LIMIT 10\"",
    language: "bash",
    videoPath: "videos/cypher/08-profile-query-runtime-behavior.mp4",
  },
  {
    id: "cypher-09-create-range-indexes",
    section: "Cypher Skills",
    title: "Create range indexes for exact/range lookups",
    description: "Use indexes to speed up equality and range predicates.",
    code: "redis-cli GRAPH.QUERY social \"CREATE INDEX FOR (p:Person) ON (p.age)\"",
    language: "bash",
    videoPath: "videos/cypher/09-create-range-indexes.mp4",
  },
  {
    id: "cypher-10-verify-index-usage",
    section: "Cypher Skills",
    title: "Verify index usage",
    description: "Confirm plan uses index scans.",
    code:
      "redis-cli GRAPH.EXPLAIN social \"MATCH (p:Person) WHERE p.age = 30 RETURN p\"",
    language: "bash",
    videoPath: "videos/cypher/10-verify-index-usage.mp4",
  },
  {
    id: "cypher-11-full-text-indexes",
    section: "Cypher Skills",
    title: "Create and query full-text indexes",
    description: "Use RediSearch-backed full-text indexes for text search.",
    code:
      "redis-cli GRAPH.QUERY social \"CALL db.idx.fulltext.createNodeIndex('Movie', 'title')\"\n" +
      "redis-cli GRAPH.QUERY social \"CALL db.idx.fulltext.queryNodes('Movie', 'Jun*') YIELD node RETURN node.title\"",
    language: "bash",
    videoPath: "videos/cypher/11-full-text-indexes.mp4",
  },
  {
    id: "cypher-12-vector-indexes",
    section: "Cypher Skills",
    title: "Create and query vector indexes",
    description: "Use HNSW vector indexes for ANN search.",
    code:
      "redis-cli GRAPH.QUERY social \"CREATE VECTOR INDEX FOR (p:Product) ON (p.embedding)\n" +
      "OPTIONS {dimension: 768, similarityFunction: 'cosine', M: 32, efConstruction: 200}\"\n\n" +
      "redis-cli GRAPH.QUERY social \"CALL db.idx.vector.queryNodes('Product', 'embedding', 5, vecf32([0.1, 0.2, 0.3]))\n" +
      "YIELD node, score RETURN node.name, score\"",
    language: "bash",
    videoPath: "videos/cypher/12-vector-indexes.mp4",
  },
  {
    id: "cypher-13-manage-constraints-async-creation",
    section: "Cypher Skills",
    title: "Manage constraints with awareness of async creation",
    description: "Create constraints and check status with db.constraints().",
    code:
      "redis-cli GRAPH.CONSTRAINT CREATE social UNIQUE NODE Person PROPERTIES 1 id\n" +
      "redis-cli GRAPH.QUERY social \"CALL db.constraints()\"",
    language: "bash",
    videoPath: "videos/cypher/13-manage-constraints-async-creation.mp4",
  },
  {
    id: "cypher-14-inspect-graphs-and-memory-usage",
    section: "Cypher Skills",
    title: "Inspect graphs and memory usage",
    description: "Use introspection commands for operational visibility.",
    code:
      "redis-cli GRAPH.LIST\nredis-cli GRAPH.INFO social\nredis-cli GRAPH.MEMORY USAGE social",
    language: "bash",
    videoPath: "videos/cypher/14-inspect-graphs-and-memory-usage.mp4",
  },
  {
    id: "cypher-15-track-slow-queries",
    section: "Cypher Skills",
    title: "Track slow queries",
    description: "Use slowlog to identify and reset slow queries.",
    code:
      "redis-cli GRAPH.SLOWLOG social\nredis-cli GRAPH.SLOWLOG social RESET",
    language: "bash",
    videoPath: "videos/cypher/15-track-slow-queries.mp4",
  },
  {
    id: "cypher-16-cypher-limitations-correctly",
    section: "Cypher Skills",
    title: "Apply FalkorDB Cypher limitations correctly",
    description: "Account for known limitations in query design.",
    code:
      "# Not-equal filters are not index-accelerated\n" +
      "redis-cli GRAPH.QUERY social \"MATCH (p:Person) WHERE p.age <> 30 RETURN p\"",
    language: "bash",
    videoPath: "videos/cypher/16-cypher-limitations-correctly.mp4",
  },
  {
    id: "udf-01-load-js-udf-library",
    section: "UDF Skills",
    title: "Load a JavaScript UDF library",
    description: "Register UDFs with falkor.register in JS.",
    code:
      "from falkordb import FalkorDB\n\n" +
      "db = FalkorDB(host='localhost', port=6379)\n" +
      "lib = \"StringUtils\"\n" +
      "script = \"\"\"\n" +
      "function UpperCaseOdd(s) {\n" +
      "  return s.split('')\n" +
      "    .map((c, i) => i % 2 !== 0 ? c.toUpperCase() : c)\n" +
      "    .join('');\n" +
      "};\n\n" +
      "falkor.register('UpperCaseOdd', UpperCaseOdd);\n" +
      "\"\"\"\n\n" +
      "db.udf_load(lib, script)",
    language: "python",
    videoPath: "videos/udf/01-load-js-udf-library.mp4",
  },
  {
    id: "udf-02-call-udf-from-cypher",
    section: "UDF Skills",
    title: "Call a UDF from Cypher",
    description: "UDFs behave like built-in functions.",
    code:
      "from falkordb import FalkorDB\n\n" +
      "db = FalkorDB(host='localhost', port=6379)\n" +
      "g = db.select_graph(\"social\")\n" +
      "result = g.query(\"RETURN StringUtils.UpperCaseOdd('abcdef')\").result_set\n" +
      "print(result)",
    language: "python",
    videoPath: "videos/udf/02-call-udf-from-cypher.mp4",
  },
  {
    id: "udf-03-list-udf-libraries-with-code",
    section: "UDF Skills",
    title: "List UDF libraries (with code)",
    description: "Use GRAPH.UDF LIST WITHCODE to audit loaded libraries.",
    code: "redis-cli GRAPH.UDF LIST WITHCODE",
    language: "bash",
    videoPath: "videos/udf/03-list-udf-libraries-with-code.mp4",
  },
  {
    id: "udf-04-delete-or-flush-udf-libraries",
    section: "UDF Skills",
    title: "Delete or flush UDF libraries",
    description: "Remove a specific library or flush all.",
    code:
      "redis-cli GRAPH.UDF DELETE StringUtils\nredis-cli GRAPH.UDF FLUSH",
    language: "bash",
    videoPath: "videos/udf/04-delete-or-flush-udf-libraries.mp4",
  },
  {
    id: "udf-05-respect-udf-limitations",
    section: "UDF Skills",
    title: "Respect UDF limitations",
    description: "UDFs cannot mutate the graph; they must be pure functions.",
    code:
      "# Use UDFs for transformations only; do not attempt CREATE/SET/DELETE inside JS.",
    language: "text",
    videoPath: "videos/udf/05-respect-udf-limitations.mp4",
  },
  {
    id: "ops-01-run-with-browser-local-dev",
    section: "Operations Skills (Docker)",
    title: "Run FalkorDB with browser for local development",
    description: "Expose both database and UI ports.",
    code: "docker run -p 6379:6379 -p 3000:3000 -it --rm falkordb/falkordb:latest",
    language: "bash",
    videoPath: "videos/ops/01-run-with-browser-local-dev.mp4",
  },
  {
    id: "ops-02-run-server-only",
    section: "Operations Skills (Docker)",
    title: "Run server-only for production-style usage",
    description: "Use the server-only image for lean deployments.",
    code: "docker run -p 6379:6379 -it --rm falkordb/falkordb-server:latest",
    language: "bash",
    videoPath: "videos/ops/02-run-server-only.mp4",
  },
  {
    id: "ops-03-set-auth-redis-args",
    section: "Operations Skills (Docker)",
    title: "Set authentication using REDIS_ARGS",
    description: "Pass Redis server flags via environment variables.",
    code:
      "docker run -p 6379:6379 -p 3000:3000 -it \\\n" +
      "  -e REDIS_ARGS=\"--requirepass yourpassword\" \\\n" +
      "  --rm falkordb/falkordb:latest",
    language: "bash",
    videoPath: "videos/ops/03-set-auth-redis-args.mp4",
  },
  {
    id: "ops-04-set-module-config-falkordb-args",
    section: "Operations Skills (Docker)",
    title: "Set module config using FALKORDB_ARGS",
    description: "Tune module-level settings (threads, timeout, cache size).",
    code:
      "docker run -p 6379:6379 -p 3000:3000 -it \\\n" +
      "  -e FALKORDB_ARGS=\"THREAD_COUNT 4 TIMEOUT 5000\" \\\n" +
      "  --rm falkordb/falkordb:latest",
    language: "bash",
    videoPath: "videos/ops/04-set-module-config-falkordb-args.mp4",
  },
  {
    id: "ops-05-docker-compose-local-stacks",
    section: "Operations Skills (Docker)",
    title: "Use Docker Compose for repeatable local stacks",
    description: "Define ports and env vars in a compose file.",
    code:
      "services:\n" +
      "  falkordb:\n" +
      "    image: falkordb/falkordb:latest\n" +
      "    ports:\n" +
      "      - \"6379:6379\"\n" +
      "      - \"3000:3000\"\n" +
      "    environment:\n" +
      "      - REDIS_ARGS=--requirepass falkordb\n" +
      "      - FALKORDB_ARGS=THREAD_COUNT 4",
    language: "yaml",
    videoPath: "videos/ops/05-docker-compose-local-stacks.mp4",
  },
  {
    id: "ops-06-browser-separate-server",
    section: "Operations Skills (Docker)",
    title: "Run the browser separately against a server",
    description: "Use FALKORDB_URL to point the browser container to the server.",
    code:
      "services:\n" +
      "  falkordb-server:\n" +
      "    image: falkordb/falkordb-server:latest\n" +
      "    ports:\n" +
      "      - \"6379:6379\"\n" +
      "  falkordb-browser:\n" +
      "    image: falkordb/falkordb-browser:latest\n" +
      "    ports:\n" +
      "      - \"3000:3000\"\n" +
      "    environment:\n" +
      "      - FALKORDB_URL=redis://falkordb-server:6379\n" +
      "      - FALKORDB_PASSWORD=falkordb",
    language: "yaml",
    videoPath: "videos/ops/06-browser-separate-server.mp4",
  },
];
