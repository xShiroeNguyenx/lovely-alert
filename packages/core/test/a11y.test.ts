import { afterEach, describe, expect, test } from 'vitest'
import type { LovelyAlert } from '../src/core/LovelyAlert'
import { la } from '../src/index'

function active(): LovelyAlert {
  const instance = la.current()
  if (!instance) throw new Error('expected an active alert')
  return instance
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const pressTab = (shiftKey = false): void => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey }))
}

afterEach(() => {
  la.current()?.close({ confirmed: false, denied: false, dismissed: true }, { immediate: true })
  document.body.innerHTML = ''
})

describe('focus trap', () => {
  test('Tab from the last focusable wraps to the first', async () => {
    la.open({ title: 'x', buttons: { confirm: true, cancel: true }, animation: false })
    await flush()
    const confirm = active().getConfirmButton()
    const cancel = active().getCancelButton()
    cancel?.focus()
    expect(document.activeElement).toBe(cancel)
    pressTab()
    expect(document.activeElement).toBe(confirm)
  })

  test('Shift+Tab from the first focusable wraps to the last', async () => {
    la.open({ title: 'x', buttons: { confirm: true, cancel: true }, animation: false })
    await flush()
    const confirm = active().getConfirmButton()
    const cancel = active().getCancelButton()
    confirm?.focus()
    pressTab(true)
    expect(document.activeElement).toBe(cancel)
  })

  test('focus escaping the popup is pulled back in', async () => {
    la.open({ title: 'x', animation: false })
    await flush()
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    outside.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    expect(active().getPopup()?.contains(document.activeElement)).toBe(true)
  })
})

describe('scroll lock', () => {
  test('locks body scroll while open and restores it on close', () => {
    expect(document.body.style.overflow).toBe('')
    la.open({ title: 'x', animation: false })
    expect(document.body.style.overflow).toBe('hidden')
    active().close({ confirmed: true, denied: false, dismissed: false }, { immediate: true })
    expect(document.body.style.overflow).toBe('')
  })

  test('toast does not lock scroll', () => {
    la.open({ title: 'x', toast: true, animation: false })
    expect(document.body.style.overflow).toBe('')
  })
})

describe('rtl', () => {
  test('sets dir="rtl" on the container', () => {
    la.open({ title: 'x', rtl: true, animation: false })
    expect(active().getContainer()?.getAttribute('dir')).toBe('rtl')
  })
})

describe('screen-reader announce', () => {
  test('writes the title/text to a polite live region', async () => {
    la.open({ title: 'Saved', text: 'All good', animation: false })
    await wait(80)
    const region = document.querySelector('.la-sr-only[aria-live="polite"]')
    expect(region?.textContent).toContain('Saved')
    expect(region?.textContent).toContain('All good')
  })
})
