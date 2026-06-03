import {
  type CatalogExample,
  categories,
  examples,
  getExample,
  getExamplesByCategory,
  searchExamples,
} from '@lovely-alert/catalog'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  API_REFERENCE,
  ICON_TYPES,
  INPUT_TYPES,
  KNOWN_OPTIONS,
  OVERVIEW,
  THEMES,
  themeToCss,
} from './data.js'

const VERSION = '0.0.0'

function text(value: string) {
  return { content: [{ type: 'text' as const, text: value }] }
}

function formatExample(example: CatalogExample): string {
  return `### ${example.title}  (id: ${example.id}, category: ${example.category})
${example.description}

\`\`\`js
${example.code}
\`\`\``
}

/** Build the LovelyAlert MCP server (transport-agnostic). */
export function createServer(): McpServer {
  const server = new McpServer({ name: 'lovely-alert-mcp', version: VERSION })

  // ---- tools ----
  server.tool(
    'list_features',
    'List LovelyAlert capabilities, input types, icons and themes.',
    () =>
      text(
        JSON.stringify(
          {
            categories,
            icons: ICON_TYPES,
            inputTypes: INPUT_TYPES,
            themes: THEMES,
            exampleCount: examples.length,
          },
          null,
          2,
        ),
      ),
  )

  server.tool(
    'list_examples',
    'List catalog examples, optionally filtered by category.',
    { category: z.string().optional().describe('Optional category filter') },
    ({ category }) => {
      const list = category
        ? getExamplesByCategory(category as CatalogExample['category'])
        : examples
      return text(
        JSON.stringify(
          list.map((e) => ({ id: e.id, title: e.title, category: e.category, tags: e.tags })),
          null,
          2,
        ),
      )
    },
  )

  server.tool(
    'get_example',
    'Get one example (with runnable code) by its id.',
    { id: z.string().describe('Example id, e.g. "basic-success"') },
    ({ id }) => {
      const example = getExample(id)
      return text(example ? formatExample(example) : `No example with id "${id}".`)
    },
  )

  server.tool(
    'search_examples',
    'Search examples by title, description or tag.',
    { query: z.string().describe('Search terms') },
    ({ query }) => {
      const matches = searchExamples(query)
      return text(
        matches.length
          ? matches.map(formatExample).join('\n\n')
          : `No examples matched "${query}".`,
      )
    },
  )

  server.tool(
    'generate_alert',
    'Generate LovelyAlert code from a natural-language description (retrieval + scaffold).',
    {
      description: z.string().describe('What the alert should do'),
      icon: z.enum(['success', 'error', 'warning', 'info', 'question']).optional(),
    },
    ({ description, icon }) => {
      const matches = searchExamples(description)
      if (matches.length > 0) {
        const best = matches[0] as CatalogExample
        const others = matches
          .slice(1, 4)
          .map((e) => `- ${e.id}: ${e.title}`)
          .join('\n')
        return text(
          `Closest example:\n\n${formatExample(best)}${
            others ? `\n\nOther relevant examples:\n${others}` : ''
          }`,
        )
      }
      const iconLine = icon ? `\n  icon: '${icon}',` : ''
      return text(
        `No close match — here is a scaffold:\n\n\`\`\`js\nawait la.open({\n  title: ${JSON.stringify(
          description,
        )},${iconLine}\n})\n\`\`\``,
      )
    },
  )

  server.tool('get_api_reference', 'Return the full LovelyAlert API reference.', () =>
    text(API_REFERENCE),
  )

  server.tool(
    'customize_theme',
    'Generate CSS for a custom theme from a token map (e.g. { primary, bg, fg }).',
    {
      name: z.string().describe('Theme name used as theme: "<name>"'),
      tokens: z.record(z.string()).describe('Token map, e.g. { "primary": "#e11d48" }'),
    },
    ({ name, tokens }) =>
      text(
        `${themeToCss(name, tokens)}\n\n/* Usage */\nla.theme.define('${name}', ${JSON.stringify(
          tokens,
        )})\nawait la.open({ theme: '${name}', title: 'On brand' })`,
      ),
  )

  server.tool(
    'validate_options',
    'Check an options object and report unknown keys.',
    { options: z.record(z.any()).describe('A LovelyAlert options object') },
    ({ options }) => {
      const unknown = Object.keys(options).filter((key) => !KNOWN_OPTIONS.has(key))
      return text(
        unknown.length === 0
          ? 'All option keys are valid.'
          : `Unknown option keys: ${unknown.join(', ')}`,
      )
    },
  )

  // ---- resources ----
  server.resource('overview', 'docs://overview', (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: OVERVIEW }],
  }))
  server.resource('api-reference', 'api://reference', (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'text/markdown', text: API_REFERENCE }],
  }))
  server.resource('examples-catalog', 'catalog://examples', (uri) => ({
    contents: [
      { uri: uri.href, mimeType: 'application/json', text: JSON.stringify(examples, null, 2) },
    ],
  }))
  server.resource('theme-presets', 'themes://presets', (uri) => ({
    contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(THEMES) }],
  }))

  // ---- prompts ----
  server.prompt(
    'confirm-delete',
    'Draft a destructive-action confirmation alert.',
    { item: z.string().describe('The thing being deleted') },
    ({ item }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Write LovelyAlert code that asks the user to confirm deleting "${item}" using la.confirm with { danger: true }, and shows a success toast when confirmed.`,
          },
        },
      ],
    }),
  )

  server.prompt(
    'toast-notification',
    'Draft a toast notification.',
    { message: z.string().describe('The toast message') },
    ({ message }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Write LovelyAlert code that shows a success toast saying "${message}" at the top-end with a 3s timer.`,
          },
        },
      ],
    }),
  )

  return server
}
