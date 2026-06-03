import { afterEach, describe, expect, test } from 'vitest'
import type { LovelyAlert } from '../src/core/LovelyAlert'
import type { IconType } from '../src/index'
import { la } from '../src/index'

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

describe('animated SVG icons', () => {
  test('success renders an inline SVG with a draw path', () => {
    la.success('Done', undefined, { animation: false })
    const icon = active().getPopup()?.querySelector('.la-icon')
    expect(icon?.querySelector('svg.la-icon-svg')).not.toBeNull()
    expect(icon?.querySelector('.la-icon-draw')).not.toBeNull()
  })

  test('every icon type renders an SVG', () => {
    const types: IconType[] = ['success', 'error', 'warning', 'info', 'question']
    for (const icon of types) {
      la.open({ title: 'x', icon, animation: false })
      expect(active().getPopup()?.querySelector('svg.la-icon-svg')).not.toBeNull()
      la.current()?.close({ confirmed: false, denied: false, dismissed: true }, { immediate: true })
    }
  })

  test('iconHtml overrides the built-in glyph', () => {
    la.open({ title: 'x', icon: 'info', iconHtml: '<b id="custom">!</b>', animation: false })
    expect(active().getPopup()?.querySelector('#custom')).not.toBeNull()
    expect(active().getPopup()?.querySelector('svg.la-icon-svg')).toBeNull()
  })
})

describe('grow', () => {
  test('fullscreen adds the grow class to the popup', () => {
    la.open({ title: 'x', grow: 'fullscreen', animation: false })
    expect(active().getPopup()?.classList.contains('la-grow-fullscreen')).toBe(true)
  })
})

describe('theme', () => {
  test('sets the data-la-theme attribute on the container', () => {
    la.open({ title: 'x', theme: 'minimal', animation: false })
    expect(active().getContainer()?.getAttribute('data-la-theme')).toBe('minimal')
  })

  test('defaults to the auto theme', () => {
    la.open({ title: 'x', animation: false })
    expect(active().getContainer()?.getAttribute('data-la-theme')).toBe('auto')
  })
})

describe('draggable', () => {
  test('adds the draggable affordance to the popup and title handle', async () => {
    la.open({ title: 'Drag me', draggable: true, animation: false })
    await flush()
    const popup = active().getPopup()
    expect(popup?.classList.contains('la-draggable')).toBe(true)
    const title = popup?.querySelector<HTMLElement>('.la-title')
    expect(title?.style.cursor).toBe('move')
  })
})

describe('topLayer', () => {
  test('falls back gracefully where the Popover API is unavailable', async () => {
    const promise = la.open({ title: 'x', topLayer: true, animation: false })
    expect(la.isVisible()).toBe(true)
    active().clickConfirm()
    expect((await promise).confirmed).toBe(true)
  })
})
