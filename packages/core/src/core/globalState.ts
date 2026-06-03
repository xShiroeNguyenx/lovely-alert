import type { LovelyAlertOptions } from '../types'
import type { LovelyAlert } from './LovelyAlert'

/** Tracks the single active alert (own-API: a new alert supersedes the current one). */
let active: LovelyAlert | undefined

export function getActive(): LovelyAlert | undefined {
  return active
}

export function setActive(instance: LovelyAlert): void {
  active = instance
}

export function clearActive(instance: LovelyAlert): void {
  if (active === instance) active = undefined
}

/** Process-wide default option overrides (e.g. a global theme set via `la.theme.set`). */
let globalDefaults: Partial<LovelyAlertOptions> = {}

export function getGlobalDefaults(): Partial<LovelyAlertOptions> {
  return globalDefaults
}

export function patchGlobalDefaults(patch: Partial<LovelyAlertOptions>): void {
  globalDefaults = { ...globalDefaults, ...patch }
}
