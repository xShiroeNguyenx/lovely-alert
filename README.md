# LovelyAlert

> A beautiful, modern, accessible, themeable alert / modal / toast library with a fresh, ergonomic API — plus an MCP server so any AI assistant can reference it and generate code.

[![npm](https://img.shields.io/npm/v/lovely-alert?color=%232563eb&label=lovely-alert)](https://www.npmjs.com/package/lovely-alert)
[![CI](https://github.com/xShiroeNguyenx/lovely-alert/actions/workflows/ci.yml/badge.svg)](https://github.com/xShiroeNguyenx/lovely-alert/actions/workflows/ci.yml)
[![bundle](https://img.shields.io/badge/core-~14.5kB%20gzip-success)](https://www.npmjs.com/package/lovely-alert)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

### 🔗 Links

| | |
| --- | --- |
| 🎮 **Live demo & playground** | **https://xshiroenguyenx.github.io/lovely-alert/** |
| 📚 Examples gallery | https://xshiroenguyenx.github.io/lovely-alert/examples |
| ⚡ Playground (run code live) | https://xshiroenguyenx.github.io/lovely-alert/playground |
| 📦 npm | [`lovely-alert`](https://www.npmjs.com/package/lovely-alert) |

LovelyAlert is its own independent product — a vanilla-TS core with **zero runtime
dependencies**, styles that auto-inject on first use, light / dark / **auto** theming,
full WAI-ARIA accessibility, 18 input types, stacking toasts, and an MCP server that
exposes the whole catalog so AI assistants generate code that actually matches the API.

---

## Install

```bash
npm install lovely-alert       # or: pnpm add lovely-alert / yarn add lovely-alert
```

Or drop in the UMD build from a CDN — styles auto-inject, no extra CSS import:

```html
<script src="https://unpkg.com/lovely-alert"></script>
<script>
  LovelyAlert.la.success('Saved!', 'Your changes have been stored.')
</script>
```

> 👉 Don't want to install anything? Try everything in the **[live playground](https://xshiroenguyenx.github.io/lovely-alert/playground)** first.

## Quick start

```ts
import { la } from 'lovely-alert'

// Convenience methods (success / error / warning / info / question)
await la.success('Saved!', 'Your changes have been stored.')

// Confirm → resolves a boolean
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

## Packages

| Package | npm | Description |
| --- | --- | --- |
| [`packages/core`](./packages/core) | [![npm](https://img.shields.io/npm/v/lovely-alert?label=)](https://www.npmjs.com/package/lovely-alert) `lovely-alert` | The core library — vanilla TS, zero runtime deps, themeable, accessible. |
| [`packages/react`](./packages/react) | [![npm](https://img.shields.io/npm/v/@lovely-alert/react?label=)](https://www.npmjs.com/package/@lovely-alert/react) `@lovely-alert/react` | React wrapper (`useAlert` hook + re-exports). |
| [`packages/vue`](./packages/vue) | [![npm](https://img.shields.io/npm/v/@lovely-alert/vue?label=)](https://www.npmjs.com/package/@lovely-alert/vue) `@lovely-alert/vue` | Vue wrapper (composable + plugin). |
| [`packages/mcp`](./packages/mcp) | [![npm](https://img.shields.io/npm/v/lovely-alert-mcp?label=)](https://www.npmjs.com/package/lovely-alert-mcp) `lovely-alert-mcp` | MCP server (stdio + HTTP) exposing docs, examples & code-gen. |
| [`shared/catalog`](./shared/catalog) | [![npm](https://img.shields.io/npm/v/@lovely-alert/catalog?label=)](https://www.npmjs.com/package/@lovely-alert/catalog) `@lovely-alert/catalog` | Single source of truth: every example + metadata, shared by docs/MCP/tests. |
| [`apps/docs`](./apps/docs) | — | Docs + live playground (Astro + React islands), dark/light/auto. |

## Features

- 🎨 **Modern look** with light / dark / **auto** themes via CSS design tokens (+ `minimal`, `borderless`, and a runtime theme builder `la.theme.define`/`export`).
- ♿ **Accessible** (WAI-ARIA): `dialog`/`alertdialog` roles, focus trap, `returnFocus`, full keyboard (ESC/Enter/Tab), scroll lock, screen-reader announce, RTL.
- 🧩 **Fresh API**: convenience methods + fluent `build()` + low-level `open()` + `mixin()` presets.
- 🔤 **18 input types** with sync/async validation, `preConfirm`/`preDeny` loaders, plus OTP / rating / tags.
- 🔔 **Toasts** that stack per position, with timers, `timerProgressBar` and progress steps; multi-step `chain()` wizards.
- ✨ **Extras**: confetti, animated SVG icons, sounds — all respecting `prefers-reduced-motion`.
- 🌐 **i18n** built in (ships `en` + `vi`) and React/Vue wrappers.
- 🤖 **MCP server** (stdio + HTTP) so AI assistants reference the library & generate matching code.

## MCP server

Let any AI assistant generate LovelyAlert code from the same catalog the docs use:

```bash
npx lovely-alert-mcp                       # stdio (default)
npx lovely-alert-mcp --http --port 8787    # Streamable HTTP
```

**Claude Desktop / Claude Code / Cursor** — add to your MCP config:

```json
{
  "mcpServers": {
    "lovely-alert": {
      "command": "npx",
      "args": ["-y", "lovely-alert-mcp"]
    }
  }
}
```

Exposes 8 tools (`generate_alert`, `list_features`, `get_example`, `search_examples`,
`get_api_reference`, `customize_theme`, `validate_options`, `list_examples`),
4 resources and 2 prompts. See [`packages/mcp/README.md`](./packages/mcp/README.md) for details.

## API surface (cheat-sheet)

- **Convenience:** `la.success / error / warning / info / question`, `la.confirm`, `la.prompt`
- **Toasts:** `la.toast.show / success / error / warning / info / question`
- **Low-level:** `la.open(options)` → `Promise<Result>`; `la.chain(steps)`
- **Builder / presets:** `la.build()`, `la.mixin(preset)`
- **Control:** `la.update`, `la.close`, `la.current`, `la.isVisible`
- **Theme / locale:** `la.theme.{set,get,define,export}`, `la.locale.{set,get,define}`

Full option reference & runnable snippets: **[the docs site](https://xshiroenguyenx.github.io/lovely-alert/)**.

## Develop

```bash
# Requires Node >= 18.20 and pnpm (this repo pins pnpm@9.15.4)
pnpm install
pnpm build        # build all packages
pnpm typecheck    # type-check all packages
pnpm test         # run unit tests (Vitest)
pnpm e2e          # Playwright + axe e2e (installs a browser on first run)
pnpm dev          # run the core dev playground
pnpm lint         # Biome lint + format check
```

## Release

Publishing is **tag-driven** via GitHub Actions:

```bash
# 1. add a changeset describing the change (pick patch / minor / major)
pnpm changeset
# 2. bump versions + changelogs (NOTE: `run` — `pnpm version` is a built-in, not this script)
pnpm run version-packages
# 3. commit, then tag to publish
git commit -am "Release" && git push
git tag vX.Y.Z && git push origin vX.Y.Z   # → CI runs `pnpm release` → npm
```

Docs auto-deploy to GitHub Pages on every push to `main`.

## License

[MIT](./LICENSE) © Nguyễn Sơn Khánh
