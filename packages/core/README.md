# lovely-alert

> A beautiful, modern, accessible, themeable alert / modal / toast library with a fresh, ergonomic API.

[![npm](https://img.shields.io/npm/v/lovely-alert?color=%232563eb)](https://www.npmjs.com/package/lovely-alert)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)

🎮 **[Live demo & playground →](https://xshiroenguyenx.github.io/lovely-alert/)**

Vanilla TypeScript, **zero runtime dependencies**. Styles auto-inject on first use, so
CDN/UMD consumers and AI-generated snippets render correctly with no extra CSS import.

## Install

```bash
npm install lovely-alert
```

```html
<!-- or via CDN (UMD) -->
<script src="https://unpkg.com/lovely-alert"></script>
```

## Usage

```ts
import { la } from 'lovely-alert'

await la.success('Saved!', 'Your changes have been stored.')

const ok = await la.confirm('Delete this item?', { confirmText: 'Delete', danger: true })

const email = await la.prompt('Your email?', {
  input: 'email',
  validate: (v) => (v.includes('@') ? null : 'Enter a valid email'),
})

la.toast.success('Copied to clipboard')

const result = await la.open({ title: 'Terms', html: 'Read our <a href="#">terms</a>.' })
// result = { confirmed, denied, dismissed, value, dismissReason }
```

## Features

- **Themes**: `light` / `dark` / `auto` (+ `minimal`, `borderless`) via CSS design tokens; runtime `la.theme.set()` and a token-based theme builder (`la.theme.define` / `la.theme.export`).
- **Accessibility**: `dialog`/`alertdialog` roles, focus trap, `returnFocus`, keyboard ESC/Enter/Tab, scroll lock, screen-reader live announce, RTL.
- **18 input types** with sync/async validation, `preConfirm`/`preDeny` loaders, OTP / rating / tags.
- **Toasts** that stack per position, with timers, `timerProgressBar` and progress steps.
- **Builder** (`la.build()`), **mixin** presets (`la.mixin()`), and lifecycle hooks (`willOpen` → `didOpen` … `didDestroy`).
- **i18n** (`la.locale`, ships `en` + `vi`) and effects (confetti, sounds) that respect `prefers-reduced-motion`.

## API surface

- Convenience: `la.success / error / warning / info / question`, `la.confirm`, `la.prompt`
- Toasts: `la.toast.show / success / error / warning / info / question`
- Low-level: `la.open(options)` → `Promise<Result>`; `la.chain(steps)`
- Control: `la.update`, `la.close`, `la.current`, `la.isVisible`
- Theme/locale: `la.theme.{set,get,define,export}`, `la.locale.{set,get,define}`

See the [docs & live playground](../../apps/docs) for the full option reference.

## License

[MIT](../../LICENSE) © Nguyễn Sơn Khánh
