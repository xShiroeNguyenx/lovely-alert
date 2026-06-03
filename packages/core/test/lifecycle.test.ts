import { afterEach, describe, expect, test } from 'vitest'
import type { LovelyAlert } from '../src/core/LovelyAlert'
import { la } from '../src/index'

/** Tests run with `animation: false` so close() finalizes synchronously and deterministically. */

function active(): LovelyAlert {
  const instance = la.current()
  if (!instance) throw new Error('expected an active alert')
  return instance
}

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

afterEach(() => {
  la.current()?.close({ confirmed: false, denied: false, dismissed: true }, { immediate: true })
  document.body.innerHTML = ''
})

describe('result resolution', () => {
  test('confirm resolves with confirmed=true', async () => {
    const promise = la.open({ title: 'x', animation: false })
    active().clickConfirm()
    const result = await promise
    expect(result.confirmed).toBe(true)
    expect(result.dismissed).toBe(false)
  })

  test('cancel button resolves dismissed with reason "cancel"', async () => {
    const promise = la.open({
      title: 'x',
      animation: false,
      buttons: { confirm: true, cancel: true },
    })
    active().getCancelButton()?.click()
    const result = await promise
    expect(result.dismissed).toBe(true)
    expect(result.dismissReason).toBe('cancel')
  })

  test('Escape key dismisses with reason "esc"', async () => {
    const promise = la.open({ title: 'x', animation: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    const result = await promise
    expect(result.dismissReason).toBe('esc')
  })

  test('backdrop click dismisses with reason "backdrop"', async () => {
    const promise = la.open({ title: 'x', animation: false })
    const container = active().getContainer()
    container?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    container?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const result = await promise
    expect(result.dismissReason).toBe('backdrop')
  })

  test('allowOutsideClick=false keeps the alert open on backdrop click', async () => {
    la.open({ title: 'x', animation: false, allowOutsideClick: false })
    const container = active().getContainer()
    container?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    container?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flush()
    expect(la.isVisible()).toBe(true)
  })
})

describe('hook order', () => {
  test('fires didRender → willOpen → didOpen, then willClose → didClose → didDestroy', async () => {
    const order: string[] = []
    const promise = la.open({
      title: 'x',
      animation: false,
      didRender: () => order.push('didRender'),
      willOpen: () => order.push('willOpen'),
      didOpen: () => order.push('didOpen'),
      willClose: () => order.push('willClose'),
      didClose: () => order.push('didClose'),
      didDestroy: () => order.push('didDestroy'),
    })
    await flush()
    expect(order).toEqual(['didRender', 'willOpen', 'didOpen'])
    active().clickConfirm()
    await promise
    expect(order).toEqual([
      'didRender',
      'willOpen',
      'didOpen',
      'willClose',
      'didClose',
      'didDestroy',
    ])
  })
})

describe('own-API multi-open semantics', () => {
  test('opening a new alert supersedes the active one', async () => {
    const first = la.open({ title: 'A', animation: false })
    la.open({ title: 'B', animation: false })
    const firstResult = await first
    expect(firstResult.dismissed).toBe(true)
    expect(firstResult.dismissReason).toBe('superseded')
    expect(active().getPopup()?.querySelector('.la-title')?.textContent).toBe('B')
  })
})

describe('resolve-once guarantee', () => {
  test('calling close twice resolves the promise exactly once (first wins)', async () => {
    const promise = la.open({ title: 'x', animation: false })
    const instance = active()
    instance.close({ confirmed: true, denied: false, dismissed: false })
    instance.close({ confirmed: false, denied: false, dismissed: true, dismissReason: 'cancel' })
    const result = await promise
    expect(result.confirmed).toBe(true)
  })
})

describe('style injection', () => {
  // Guards the regression where injectStyles() was never called, so no CSS reached the page.
  // (The CSS string is empty under vitest's ?inline handling, so we only assert the <style> exists.)
  test('injects the stylesheet element into <head> on open', () => {
    la.open({ title: 'x', animation: false })
    const style = document.getElementById('lovely-alert-styles')
    expect(style).not.toBeNull()
    expect(style?.tagName).toBe('STYLE')
  })
})
