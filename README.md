# LovelyAlert

> A beautiful, modern, accessible, themeable alert / modal / toast library with a fresh, ergonomic API — plus an MCP server so any AI assistant can reference it and generate code.

[![CI](https://github.com/nguyensonkhanh/lovely-alert/actions/workflows/ci.yml/badge.svg)](https://github.com/nguyensonkhanh/lovely-alert/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

LovelyAlert is its own independent product — a vanilla-TS core with **zero runtime
dependencies**, styles that auto-inject on first use, light / dark / **auto** theming,
full WAI-ARIA accessibility, 18 input types, stacking toasts, and an MCP server that
exposes the whole catalog so AI assistants generate code that actually matches the API.

## Install

```bash
npm install lovely-alert       # or: pnpm add lovely-alert
```

Or drop in the UMD build from a CDN (styles auto-inject, no extra CSS import):

```html
<script src="https://unpkg.com/lovely-alert"></script>
<script>
  LovelyAlert.la.success('Saved!', 'Your changes have been stored.')
</script>
```

## Quick start

```ts
import { la } from 'lovely-alert'

// Convenience methods (success / error / warning / info / question)
await la.success('Saved!', 'Your changes have been stored.')

// Confirm → resolves boolean
const ok = await la.confirm('Delete this item?', { confirmText: 'Delete', danger: true })

// Prompt → resolves the value (or null when dismissed), with async validation
const email = await la.prompt('Your email?', {
  input: 'email',
  validate: (v) => (v.includes('@') ? null : 'Enter a valid email'),
})

// Toasts — compact, auto-dismissing, stackable
la.toast.success('Copied to clipboard')

// Low-level open() → full Result { confirmed, denied, dismissed, value, dismissReason }
const result = await la.open({ title: 'Terms', html: 'Read our <a href="#">terms</a>.' })

// Fluent builder for power users
await la.build().title('Sign up').icon('question').input('email').confirmButton('Go').show()

// Theme & locale at runtime
la.theme.set('auto') // 'light' | 'dark' | 'auto' | <custom>
la.locale.set('vi')
```

## What's inside (monorepo)

| Package | npm | Description |
| --- | --- | --- |
| [`packages/core`](./packages/core) | `lovely-alert` | The core library — vanilla TS, zero runtime deps, themeable, accessible. |
| [`packages/react`](./packages/react) | `@lovely-alert/react` | React wrapper (`useAlert` hook + re-exports). |
| [`packages/vue`](./packages/vue) | `@lovely-alert/vue` | Vue wrapper (composable + plugin). |
| [`packages/mcp`](./packages/mcp) | `lovely-alert-mcp` | MCP server (stdio + HTTP) exposing docs, examples & code-gen. |
| [`shared/catalog`](./shared/catalog) | `@lovely-alert/catalog` | Single source of truth: every example + metadata, shared by docs/MCP/tests. |
| [`apps/docs`](./apps/docs) | — | Docs + live playground (Astro + React islands), dark/light/auto. |

## Highlights

- 🎨 **Modern look** with light / dark / **auto** themes via CSS design tokens.
- ♿ **Accessible** (WAI-ARIA): focus trap, keyboard nav, screen-reader announce, RTL.
- 🧩 **Fresh API**: convenience methods + fluent builder + low-level `open()`.
- 🔤 **18 input types** with sync/async validation, `preConfirm`/`preDeny` + loaders.
- 🔔 Toasts with stacking, timers & progress steps; multi-step `chain()` wizards.
- ✨ Extras: confetti, animated SVG icons, sounds, OTP/rating/tags inputs, runtime theme builder.
- 🌐 **i18n** built in (ships `en` + `vi`) and React/Vue wrappers.
- 🤖 **MCP server** (stdio + HTTP) so AIs can reference the library & generate code.

## MCP server

Let any AI assistant generate LovelyAlert code from the same catalog the docs use:

```bash
npx lovely-alert-mcp            # stdio (default)
npx lovely-alert-mcp --http --port 8787   # Streamable HTTP
```

See [`packages/mcp/README.md`](./packages/mcp/README.md) for Claude Desktop / Claude Code / Cursor config snippets.

## Develop

```bash
# Requires Node >= 18.20 and pnpm (this repo pins pnpm@9.15.4)
pnpm install
pnpm build        # build all packages
pnpm typecheck    # type-check all packages
pnpm test         # run unit tests
pnpm dev          # run the core dev playground
pnpm lint         # Biome lint + format check
```

## License

[MIT](./LICENSE) © Nguyễn Sơn Khánh
