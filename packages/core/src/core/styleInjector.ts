import { STYLE_ELEMENT_ID } from '../constants'
import css from '../styles/lovely-alert.css?inline'
import { hasDOM } from '../utils/dom'

let injected = false

/**
 * Inject the core stylesheet exactly once. Idempotent and SSR-safe so that
 * CDN/UMD consumers and AI-generated snippets render styled with no extra import.
 */
export function injectStyles(): void {
  if (injected || !hasDOM()) return
  if (document.getElementById(STYLE_ELEMENT_ID)) {
    injected = true
    return
  }
  const style = document.createElement('style')
  style.id = STYLE_ELEMENT_ID
  style.textContent = css
  document.head.appendChild(style)
  injected = true
}
