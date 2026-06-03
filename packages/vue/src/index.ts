import { la } from 'lovely-alert'
import type { App } from 'vue'

/**
 * Vue plugin: `app.use(LovelyAlertPlugin)` exposes `$la` in templates and
 * provides `la` for injection.
 */
export const LovelyAlertPlugin = {
  install(app: App): void {
    app.config.globalProperties.$la = la
    app.provide('la', la)
  },
}

/** Composable returning the `la` API. */
export function useAlert(): typeof la {
  return la
}

export { la } from 'lovely-alert'
export type * from 'lovely-alert'
