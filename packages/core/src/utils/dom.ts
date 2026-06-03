/** Tiny DOM helpers used by the renderer. Framework-free, SSR-guarded by callers. */

export type Attrs = Record<string, string | number | boolean | undefined>

/** Create an element with class names and attributes in one call. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attrs?: Attrs,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  if (className) el.className = className
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === false) continue
      if (value === true) {
        el.setAttribute(key, '')
      } else {
        el.setAttribute(key, String(value))
      }
    }
  }
  return el
}

/** Set element content from a string (as HTML) or an existing node. */
export function setContent(el: HTMLElement, content: string | HTMLElement | undefined): void {
  if (content === undefined) return
  if (typeof content === 'string') {
    el.innerHTML = content
  } else {
    el.replaceChildren(content)
  }
}

/** Set plain text content. */
export function setText(el: HTMLElement, text: string | undefined): void {
  if (text === undefined) return
  el.textContent = text
}

export function show(el: HTMLElement): void {
  el.style.removeProperty('display')
}

export function hide(el: HTMLElement): void {
  el.style.display = 'none'
}

export function removeNode(el: Node | null | undefined): void {
  el?.parentNode?.removeChild(el)
}

/** Append `extra` (space-separated class names) to an element if provided. */
export function addClasses(el: HTMLElement, extra: string | undefined): void {
  if (!extra) return
  for (const cls of extra.split(/\s+/)) {
    if (cls) el.classList.add(cls)
  }
}

/** Resolve a CSS size value: numbers become pixels, strings pass through. */
export function cssSize(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

/** True when running in a browser-like environment with a usable document. */
export function hasDOM(): boolean {
  return typeof document !== 'undefined' && typeof document.createElement === 'function'
}
