/** Small object utilities for merging defaults / mixin presets / call-time options. */

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const proto = Object.getPrototypeOf(value) as unknown
  return proto === Object.prototype || proto === null
}

/**
 * Deep-merge plain objects; everything else (arrays, functions, DOM nodes,
 * class instances) is replaced wholesale. `override` wins. Used to layer
 * call-time options over mixin presets over library defaults.
 */
export function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (value === undefined) continue
    const existing = out[key]
    if (isPlainObject(existing) && isPlainObject(value)) {
      out[key] = deepMerge(existing, value)
    } else {
      out[key] = value
    }
  }
  return out as T
}

/** Merge a list of partials left-to-right (later entries win). */
export function mergeAll<T extends object>(...layers: Array<Partial<T>>): T {
  return layers.reduce<Record<string, unknown>>(
    (acc, layer) => deepMerge(acc, (layer ?? {}) as Record<string, unknown>),
    {},
  ) as T
}
