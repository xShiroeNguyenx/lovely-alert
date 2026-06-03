import { la } from 'lovely-alert'

/**
 * Sync the LovelyAlert popup theme with the docs page theme.
 *
 * The docs toggle only sets `data-theme` on <html>; the library tracks its own
 * theme. Call this right before opening any alert so the popup matches the page
 * (otherwise `theme: 'auto'` follows the OS and desyncs from the toggle).
 */
export function syncAlertTheme(): void {
  if (typeof document === 'undefined') return
  // Docs values ('auto' | 'light' | 'dark') map 1:1 to the library Theme type.
  const theme = document.documentElement.dataset.theme || 'auto'
  la.theme.set(theme)
}
