// Smoke test: drive the built MCP server with a real client over an in-memory transport.
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createServer } from '../dist/index.js'

const server = createServer()
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
await server.connect(serverTransport)

const client = new Client({ name: 'smoke', version: '0.0.0' })
await client.connect(clientTransport)

const { tools } = await client.listTools()
const { resources } = await client.listResources()
const { prompts } = await client.listPrompts()

const example = await client.callTool({ name: 'get_example', arguments: { id: 'basic-success' } })
const search = await client.callTool({ name: 'search_examples', arguments: { query: 'toast' } })
const theme = await client.callTool({
  name: 'customize_theme',
  arguments: { name: 'brand', tokens: { primary: '#e11d48' } },
})
const validate = await client.callTool({
  name: 'validate_options',
  arguments: { options: { title: 'hi', notARealOption: 1 } },
})
const catalog = await client.readResource({ uri: 'catalog://examples' })

const assert = (cond, msg) => {
  if (!cond) {
    console.error('FAIL:', msg)
    process.exit(1)
  }
}

assert(tools.length >= 8, `expected >=8 tools, got ${tools.length}`)
assert(resources.length >= 4, `expected >=4 resources, got ${resources.length}`)
assert(prompts.length >= 2, `expected >=2 prompts, got ${prompts.length}`)
assert(example.content[0].text.includes('la.success'), 'get_example should return code')
assert(search.content[0].text.toLowerCase().includes('toast'), 'search should find toast examples')
assert(
  theme.content[0].text.includes('--la-primary: #e11d48'),
  'customize_theme should emit CSS var',
)
assert(validate.content[0].text.includes('notARealOption'), 'validate should flag unknown key')
assert(catalog.contents[0].text.includes('basic-success'), 'catalog resource should serve examples')

console.log(`OK — tools: ${tools.map((t) => t.name).join(', ')}`)
console.log(`OK — resources: ${resources.map((r) => r.uri).join(', ')}`)
console.log(`OK — prompts: ${prompts.map((p) => p.name).join(', ')}`)
await client.close()
await server.close()
