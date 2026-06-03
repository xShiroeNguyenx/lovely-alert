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

describe('convenience methods', () => {
  test('success() renders the success icon', () => {
    la.success('Done', 'It worked', { animation: false })
    expect(active().getPopup()?.querySelector('.la-icon')?.getAttribute('data-la-icon')).toBe(
      'success',
    )
  })

  test('confirm() resolves true on confirm and false on cancel', async () => {
    const yes = la.confirm('Sure?', { animation: false })
    active().clickConfirm()
    expect(await yes).toBe(true)

    const no = la.confirm('Sure?', { animation: false })
    active().getCancelButton()?.click()
    expect(await no).toBe(false)
  })

  test('confirm({ danger: true }) marks the confirm button', () => {
    la.confirm('Delete?', { animation: false, danger: true })
    expect(active().getConfirmButton()?.classList.contains('la-danger')).toBe(true)
  })
})

describe('prompt', () => {
  test('resolves the trimmed input value on confirm', async () => {
    const promise = la.prompt('Name?', { animation: false })
    const input = active().getInput()
    if (input) input.value = '  Jane  '
    active().clickConfirm()
    expect(await promise).toBe('Jane')
  })

  test('resolves null when dismissed', async () => {
    const promise = la.prompt('Name?', { animation: false })
    active().getCancelButton()?.click()
    expect(await promise).toBeNull()
  })

  test('validation blocks confirm until valid', async () => {
    const promise = la.prompt('Name?', {
      animation: false,
      validate: (value) => (value ? null : 'Required'),
    })
    active().clickConfirm()
    await flush()
    expect(la.isVisible()).toBe(true)
    const input = active().getInput()
    if (input) input.value = 'Jane'
    active().clickConfirm()
    expect(await promise).toBe('Jane')
  })
})

describe('builder', () => {
  test('accumulates options via toOptions()', () => {
    const builder = la.build().title('Subscribe').icon('question').input('email')
    const options = builder.toOptions()
    expect(options.title).toBe('Subscribe')
    expect(options.icon).toBe('question')
    expect(options.input).toBe('email')
  })

  test('show() opens the alert', async () => {
    const promise = la.build().title('Hi').animation(false).confirmButton('Go').show()
    expect(active().getConfirmButton()?.textContent).toBe('Go')
    active().clickConfirm()
    expect((await promise).confirmed).toBe(true)
  })
})

describe('mixin', () => {
  test('merges preset defaults into every call', () => {
    const branded = la.mixin({ icon: 'info', animation: false })
    branded.open({ title: 'Hi' })
    expect(active().options.icon).toBe('info')
  })
})
