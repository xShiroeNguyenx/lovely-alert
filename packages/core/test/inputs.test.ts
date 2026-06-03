import { afterEach, describe, expect, test } from 'vitest'
import type { LovelyAlert } from '../src/core/LovelyAlert'
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

describe('input value reading', () => {
  test('radio resolves the checked value', async () => {
    const promise = la.open({
      title: 'pick',
      input: { type: 'radio', options: { a: 'Apple', b: 'Banana' } },
      animation: false,
    })
    const radios = active().getPopup()?.querySelectorAll<HTMLInputElement>('input[type="radio"]')
    if (radios?.[1]) radios[1].checked = true
    active().clickConfirm()
    expect((await promise).value).toBe('b')
  })

  test('checkbox resolves a boolean', async () => {
    const promise = la.open({
      title: 'accept',
      input: { type: 'checkbox', placeholder: 'I agree' },
      animation: false,
    })
    const input = active().getInput() as HTMLInputElement
    input.checked = true
    active().clickConfirm()
    expect((await promise).value).toBe(true)
  })

  test('select resolves the chosen value', async () => {
    const promise = la.open({
      title: 'choose',
      input: { type: 'select', options: { x: 'X', y: 'Y' }, value: 'y' },
      animation: false,
    })
    active().clickConfirm()
    expect((await promise).value).toBe('y')
  })
})

describe('preConfirm', () => {
  test('transforms the resolved value', async () => {
    const promise = la.open({
      title: 'x',
      input: 'text',
      preConfirm: (value) => String(value).toUpperCase(),
      animation: false,
    })
    const input = active().getInput() as HTMLInputElement
    input.value = 'hi'
    active().clickConfirm()
    expect((await promise).value).toBe('HI')
  })

  test('a thrown error shows a validation message and keeps the alert open', async () => {
    la.open({
      title: 'x',
      preConfirm: () => {
        throw new Error('Server said no')
      },
      animation: false,
    })
    active().clickConfirm()
    await flush()
    expect(la.isVisible()).toBe(true)
    const validation = active().getPopup()?.querySelector('.la-validation')
    expect(validation?.textContent).toContain('Server said no')
  })
})
