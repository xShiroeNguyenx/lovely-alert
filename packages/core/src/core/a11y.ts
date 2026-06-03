import { hasDOM } from '../utils/dom'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Focusable elements inside the popup, in DOM order (used by the focus trap). */
export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

let liveRegion: HTMLElement | undefined

/**
 * Announce a message to screen readers via a shared visually-hidden polite
 * live region. Clearing then setting the text (next tick) makes assistive tech
 * reliably re-announce identical messages.
 */
export function announce(message: string): void {
  if (!hasDOM() || !message) return
  if (!liveRegion || !liveRegion.isConnected) {
    liveRegion = document.createElement('div')
    liveRegion.className = 'la-sr-only'
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    document.body.appendChild(liveRegion)
  }
  const region = liveRegion
  region.textContent = ''
  setTimeout(() => {
    region.textContent = message
  }, 50)
}
