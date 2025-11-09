# Metabase MCP Server

Minimal MCP server for Metabase with API key authentication.

## Setup

```bash
export METABASE_BASE_URL=http://localhost:3000
export METABASE_API_KEY=example-api-key
```

## Running

```bash
deno run --allow-net --allow-env main.ts
```

Or make it executable:

```bash
chmod +x main.ts
./main.ts
```

## Tools

- `api` - Raw Metabase API calls
- `list_databases` - List all databases
- `list_tables` - List tables in a database
- `get_table_fields` - Get fields for a table
- `execute_query` - Execute SQL queries
- `list_cards` - List saved questions
- `execute_card` - Execute a saved question
- `create_card` - Create new saved question
- `list_collections` - List collections
- `create_collection` - Create new collection

## Claude Code Configuration

Add to `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "metabase": {
      "command": "deno",
      "args": [
        "run",
        "--allow-net",
        "--allow-env",
        "/home/bridger/git/metabase-mcp/main.ts"
      ],
      "env": {
        "METABASE_BASE_URL": "http://localhost:3000",
        "METABASE_API_KEY": "example-api-key"
      }
    }
  }
}
```
