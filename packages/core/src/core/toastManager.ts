import { ATTR, CLASS } from '../constants'

/** Shared, per-position toast containers so multiple toasts stack instead of replacing each other. */
const containers = new Map<string, HTMLElement>()

export function getToastContainer(position: string, theme: string): HTMLElement {
  const existing = containers.get(position)
  if (existing?.isConnected) {
    existing.setAttribute(ATTR.theme, theme)
    return existing
  }
  const container = document.createElement('div')
  container.className = `${CLASS.container} ${CLASS.toastContainer} ${CLASS.shown}`
  container.setAttribute(ATTR.position, position)
  container.setAttribute(ATTR.theme, theme)
  document.body.appendChild(container)
  containers.set(position, container)
  return container
}

/** Remove a position's container once it has no toasts left. */
export function releaseToastContainer(position: string): void {
  const container = containers.get(position)
  if (container && container.childElementCount === 0) {
    container.remove()
    containers.delete(position)
  }
}
