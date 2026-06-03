/**
 * LovelyAlert MCP server — exposes docs, examples and code generation so any AI
 * assistant can reference the library. Distributed primarily via stdio (`npx
 * lovely-alert-mcp`); an optional Streamable HTTP transport is available with
 * `--http --port <n>`. Reads everything from @lovely-alert/catalog.
 */
export { createServer } from './server.js'
export { startHttp } from './http.js'
