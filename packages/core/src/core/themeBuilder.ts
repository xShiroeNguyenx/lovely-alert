import { ATTR } from '../constants'
import { hasDOM } from '../utils/dom'

const STYLE_ID = 'lovely-alert-themes'

function tokensToCss(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([key, value]) => {
      const name = key.startsWith('--') ? key : `--la-${key}`
      return `${name}: ${value};`
    })
    .join(' ')
}

/** Build the CSS for a custom theme (no DOM needed) — handy for the theme builder export. */
export function exportThemeCss(name: string, tokens: Record<string, string>): string {
  return `.la-container[${ATTR.theme}="${name}"] { ${tokensToCss(tokens)} }`
}

/** Register a custom theme at runtime so `{ theme: name }` picks up these tokens. */
export function defineTheme(name: string, tokens: Record<string, string>): void {
  if (!hasDOM()) return
  let style = document.getElementById(STYLE_ID)
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ID
    document.head.appendChild(style)
  }
  style.appendChild(document.createTextNode(`${exportThemeCss(name, tokens)}\n`))
}
