# lovely-alert-mcp

An MCP server that lets any AI assistant reference **LovelyAlert** and generate code for it.
It reads from the shared example catalog, so its answers never drift from the docs.

## Run it (stdio — the primary, zero-cost way)

No server to host — clients launch it on demand with `npx`.

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "lovely-alert": { "command": "npx", "args": ["-y", "lovely-alert-mcp"] }
  }
}
```

**Claude Code:**

```bash
claude mcp add lovely-alert -- npx -y lovely-alert-mcp
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "lovely-alert": { "command": "npx", "args": ["-y", "lovely-alert-mcp"] }
  }
}
```

## Run it (Streamable HTTP — optional)

```bash
npx lovely-alert-mcp --http --port 8787
# endpoint: http://localhost:8787/mcp
```

Host the HTTP variant for free on **Cloudflare Workers** if you want a public URL.

## What it exposes

**Tools:** `list_features`, `list_examples`, `get_example`, `search_examples`,
`generate_alert`, `get_api_reference`, `customize_theme`, `validate_options`.

**Resources:** `docs://overview`, `api://reference`, `catalog://examples`, `themes://presets`.

**Prompts:** `confirm-delete`, `toast-notification`.

## Inspect / test

```bash
# Interactive inspector
npx @modelcontextprotocol/inspector npx lovely-alert-mcp

# Headless smoke test (after `pnpm --filter lovely-alert-mcp build`)
node packages/mcp/scripts/smoke.mjs
```
