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

describe('timer', () => {
  test('auto-dismisses with reason "timer"', async () => {
    const result = await la.open({ title: 'x', timer: 50, animation: false })
    expect(result.dismissed).toBe(true)
    expect(result.dismissReason).toBe('timer')
  })

  test('stop / resume control the running state', async () => {
    la.open({ title: 'x', timer: 10_000, animation: false })
    await flush()
    const instance = active()
    expect(instance.isTimerRunning()).toBe(true)
    instance.stopTimer()
    expect(instance.isTimerRunning()).toBe(false)
    expect(instance.getTimerLeft()).toBeLessThanOrEqual(10_000)
    instance.resumeTimer()
    expect(instance.isTimerRunning()).toBe(true)
  })

  test('renders a timer progress bar when requested', async () => {
    la.open({ title: 'x', timer: 10_000, timerProgressBar: true, animation: false })
    await flush()
    expect(active().getPopup()?.querySelector('.la-timer-bar')).not.toBeNull()
  })
})

describe('toast', () => {
  test('renders a non-blocking toast without a confirm button', async () => {
    const promise = la.toast.success('Saved', { timer: 60, animation: false })
    const toast = document.querySelector('.la-toast')
    expect(toast).not.toBeNull()
    expect(toast?.querySelector('.la-confirm')).toBeNull()
    expect(document.querySelector('.la-toast-container')).not.toBeNull()
    await promise
  })

  test('multiple toasts stack in a single shared container', async () => {
    const first = la.toast.info('One', { timer: 60, animation: false })
    const second = la.toast.info('Two', { timer: 60, animation: false })
    expect(document.querySelectorAll('.la-toast-container')).toHaveLength(1)
    expect(document.querySelectorAll('.la-toast')).toHaveLength(2)
    await Promise.all([first, second])
  })
})

describe('progress steps', () => {
  test('renders steps and marks the current one active', () => {
    la.open({
      title: 'x',
      progressSteps: ['A', 'B', 'C'],
      currentProgressStep: 1,
      animation: false,
    })
    const steps = active().getPopup()?.querySelectorAll('.la-step')
    expect(steps?.length).toBe(3)
    expect(steps?.[1]?.classList.contains('la-step-active')).toBe(true)
  })
})

describe('chain', () => {
  test('runs steps sequentially and collects results', async () => {
    const chainPromise = la.chain([
      { title: 'Step 1', animation: false },
      { title: 'Step 2', animation: false },
    ])
    for (let i = 0; i < 2; i++) {
      await flush()
      la.current()?.clickConfirm()
    }
    const results = await chainPromise
    expect(results).toHaveLength(2)
    expect(results.every((r) => r.confirmed)).toBe(true)
  })
})
