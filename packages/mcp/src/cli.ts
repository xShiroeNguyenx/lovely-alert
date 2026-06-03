#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { startHttp } from './http.js'
import { createServer } from './server.js'

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.includes('--http')) {
    const portIndex = args.indexOf('--port')
    const port = portIndex >= 0 ? Number(args[portIndex + 1]) || 8787 : 8787
    startHttp(port)
    return
  }

  // Default: stdio — runnable via `npx lovely-alert-mcp`.
  const server = createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  process.stderr.write(`lovely-alert-mcp failed to start: ${String(error)}\n`)
  process.exit(1)
})
