# UDF Skills

This directory contains 5 individual skills related to FalkorDB User-Defined Functions (UDFs).

## Skills

1. **load-javascript-udf** - Register JavaScript UDFs with FalkorDB
2. **call-udf-from-cypher** - Invoke UDFs within Cypher queries
3. **list-udf-libraries** - View loaded UDF libraries and their source
4. **delete-or-flush-udf** - Remove specific or all UDF libraries
5. **respect-udf-limitations** - Understand UDF constraints and best practices

## Usage

Each skill is in its own directory with a `skill.md` file that includes:
- YAML frontmatter with name and description
- Usage instructions
- Example code
- Important notes

## About UDFs

UDFs allow you to extend FalkorDB's functionality with custom JavaScript functions that can be called from Cypher queries. UDFs must be pure functions and cannot modify the graph.
