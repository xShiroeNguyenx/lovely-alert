/** Body scroll lock with scrollbar-width compensation. Ref-counted so overlapping
 *  open/close (e.g. a superseded alert) restores the original styles exactly once. */

let lockCount = 0
let prevOverflow = ''
let prevPaddingRight = ''

export function lockScroll(compensate: boolean): void {
  if (typeof document === 'undefined') return
  if (lockCount === 0) {
    const { body, documentElement } = document
    prevOverflow = body.style.overflow
    prevPaddingRight = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (compensate && scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }
  }
  lockCount++
}

export function unlockScroll(): void {
  if (typeof document === 'undefined' || lockCount === 0) return
  lockCount--
  if (lockCount === 0) {
    document.body.style.overflow = prevOverflow
    document.body.style.paddingRight = prevPaddingRight
  }
}
