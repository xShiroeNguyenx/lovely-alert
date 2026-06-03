import {
  type IncomingMessage,
  type ServerResponse,
  createServer as createHttpServer,
} from 'node:http'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createServer as createMcpServer } from './server.js'

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    if (req.method !== 'POST') {
      resolve(undefined)
      return
    }
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : undefined)
      } catch {
        resolve(undefined)
      }
    })
  })
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!req.url || !req.url.startsWith('/mcp')) {
    res.writeHead(404).end('Not found — use the /mcp endpoint')
    return
  }
  // Stateless: a fresh server + transport per request (simple and serverless-friendly).
  const server = createMcpServer()
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  res.on('close', () => {
    void transport.close()
    void server.close()
  })
  await server.connect(transport)
  await transport.handleRequest(req, res, await readBody(req))
}

/** Start the Streamable HTTP transport on `port` (endpoint: /mcp). */
export function startHttp(port: number): void {
  const httpServer = createHttpServer((req, res) => {
    void handle(req, res)
  })
  httpServer.listen(port, () => {
    // stderr so we never corrupt protocol output
    process.stderr.write(
      `LovelyAlert MCP (Streamable HTTP) listening on http://localhost:${port}/mcp\n`,
    )
  })
}
