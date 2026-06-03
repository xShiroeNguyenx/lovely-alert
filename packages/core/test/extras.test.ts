import { afterEach, describe, expect, test } from 'vitest'
import type { LovelyAlert } from '../src/core/LovelyAlert'
import { la } from '../src/index'

function active(): LovelyAlert {
  const instance = la.current()
  if (!instance) throw new Error('expected an active alert')
  return instance
}

afterEach(() => {
  la.current()?.close({ confirmed: false, denied: false, dismissed: true }, { immediate: true })
  la.locale.set('en')
  document.body.innerHTML = ''
})

describe('rich inputs', () => {
  test('otp concatenates the box values', async () => {
    const promise = la.open({
      title: 'code',
      input: { type: 'otp', attributes: { length: '4' } },
      animation: false,
    })
    const boxes = active().getPopup()?.querySelectorAll<HTMLInputElement>('.la-otp-box')
    boxes?.forEach((box, index) => {
      box.value = String(index + 1)
    })
    active().clickConfirm()
    expect((await promise).value).toBe('1234')
  })

  test('rating resolves the chosen number of stars', async () => {
    const promise = la.open({ title: 'rate', input: 'rating', animation: false })
    const stars = active().getPopup()?.querySelectorAll<HTMLButtonElement>('.la-star')
    stars?.[2]?.click()
    active().clickConfirm()
    expect((await promise).value).toBe(3)
  })

  test('tags collects entered values as an array', async () => {
    const promise = la.open({ title: 'tags', input: 'tags', animation: false })
    const field = active().getInput() as HTMLInputElement
    for (const value of ['red', 'green']) {
      field.value = value
      field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    }
    active().clickConfirm()
    expect((await promise).value).toEqual(['red', 'green'])
  })
})

describe('theme builder', () => {
  test('define injects tokens and export returns CSS', () => {
    la.theme.define('brand', { primary: '#abcdef' })
    const style = document.getElementById('lovely-alert-themes')
    expect(style?.textContent).toContain('--la-primary: #abcdef')
    expect(la.theme.export('x', { bg: '#000000' })).toContain('--la-bg: #000000')
  })
})

describe('i18n', () => {
  test('locale switches the default button labels', () => {
    la.locale.set('vi')
    la.open({ title: 'x', buttons: { confirm: true }, animation: false })
    expect(active().getConfirmButton()?.textContent).toBe('Đồng ý')
  })
})

describe('confetti', () => {
  test('is safe to call without a canvas context', () => {
    expect(() => la.confetti()).not.toThrow()
  })
})
