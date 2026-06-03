import { ANIMATION_FALLBACK_MS, CLASS } from '../constants'
import type { DismissReason, InputConfig, LovelyAlertOptions, LovelyAlertResult } from '../types'
import { hasDOM, removeNode } from '../utils/dom'
import { announce, getFocusable } from './a11y'
import { confetti, playSound } from './effects'
import { clearActive, getActive, setActive } from './globalState'
import { type RenderedElements, render } from './render'
import { lockScroll, unlockScroll } from './scrollLock'
import { injectStyles } from './styleInjector'
import { Timer } from './timer'
import { getToastContainer, releaseToastContainer } from './toastManager'

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

function resolveTarget(target: string | HTMLElement | undefined): HTMLElement {
  if (target instanceof HTMLElement) return target
  if (typeof target === 'string') {
    const found = document.querySelector(target)
    if (found instanceof HTMLElement) return found
  }
  return document.body
}

/** Call `cb` once the element's open/close animation ends, with a timeout fallback
 *  that also covers the "no animation at all" path so the promise never hangs. */
function whenAnimationSettles(el: HTMLElement, cb: () => void): void {
  let done = false
  const finish = (): void => {
    if (done) return
    done = true
    el.removeEventListener('animationend', onEnd)
    el.removeEventListener('transitionend', onEnd)
    cb()
  }
  const onEnd = (event: Event): void => {
    if (event.target === el) finish()
  }
  el.addEventListener('animationend', onEnd)
  el.addEventListener('transitionend', onEnd)
  // Fallback also covers the "no animation at all" path. finish() is idempotent,
  // so a late timer firing after a real animationend is a harmless no-op.
  setTimeout(finish, ANIMATION_FALLBACK_MS)
}

/**
 * One alert instance: owns its DOM, lifecycle and result promise.
 * Hook order: didRender → willOpen → didOpen, then willClose → didClose → didDestroy.
 * `close()` is guarded so the promise resolves exactly once.
 */
export class LovelyAlert {
  options: LovelyAlertOptions
  readonly promise: Promise<LovelyAlertResult>

  private elements?: RenderedElements
  private resolver?: (result: LovelyAlertResult) => void
  private settled = false
  private previouslyFocused: Element | null = null
  private keydownHandler?: (event: KeyboardEvent) => void
  private downOnContainer = false
  private usedTopLayer = false
  private lockedScroll = false
  private timer?: Timer
  private isToast = false
  private toastHost?: HTMLElement
  private toastPosition = ''

  constructor(options: LovelyAlertOptions) {
    this.options = options
    this.promise = new Promise((resolve) => {
      this.resolver = resolve
    })
  }

  private get animationsEnabled(): boolean {
    if (this.options.animation === false) return false
    return !prefersReducedMotion()
  }

  open(): Promise<LovelyAlertResult> {
    if (!hasDOM()) {
      this.settled = true
      this.resolver?.({ confirmed: false, denied: false, dismissed: true })
      return this.promise
    }

    injectStyles()
    this.isToast = this.options.toast === true

    if (!this.isToast) {
      // Modals are single-active: opening one supersedes the current one.
      const current = getActive()
      if (current && current !== this) current.dismiss('superseded', { immediate: true })
      setActive(this)
      lockScroll(this.options.scrollbarPadding !== false)
      this.lockedScroll = true
    }

    if (this.options.returnFocus !== false) this.previouslyFocused = document.activeElement

    this.elements = render(this.options)
    this.bindEvents()
    this.options.didRender?.(this.elements.popup)

    const { container, popup } = this.elements

    if (this.isToast) {
      // Toasts stack in a shared per-position container and animate via the popup itself.
      this.toastPosition = this.options.position ?? 'top-end'
      this.toastHost = getToastContainer(this.toastPosition, String(this.options.theme ?? 'auto'))
      this.toastHost.appendChild(popup)
      this.options.willOpen?.(popup)
      this.playOpen(popup)
      return this.promise
    }

    this.usedTopLayer =
      this.options.topLayer === true && typeof container.showPopover === 'function'
    if (this.usedTopLayer) container.setAttribute('popover', 'manual')

    resolveTarget(this.options.target).appendChild(container)
    if (this.usedTopLayer) {
      try {
        container.showPopover()
      } catch {
        this.usedTopLayer = false
      }
    }
    this.options.willOpen?.(popup)
    this.playOpen(container)

    return this.promise
  }

  /** Add the shown class on `host` (container for modals, popup for toasts) and run afterOpen. */
  private playOpen(host: HTMLElement): void {
    const popup = this.elements?.popup
    if (!popup) return
    if (this.animationsEnabled) {
      void host.offsetHeight // force reflow so the transition plays
      host.classList.add(CLASS.shown)
      whenAnimationSettles(popup, () => this.afterOpen())
    } else {
      host.classList.add(CLASS.shown)
      queueMicrotask(() => this.afterOpen())
    }
  }

  private afterOpen(): void {
    if (this.settled || !this.elements) return
    if (this.options.draggable && !this.options.toast) this.setupDraggable()
    this.applyAutoFocus()
    this.announceForScreenReaders()
    this.startTimer()
    if (this.options.confetti) confetti()
    if (this.options.sound) playSound(this.options.sound, this.options.icon)
    this.options.didOpen?.(this.elements.popup)
  }

  private startTimer(): void {
    const ms = this.options.timer
    if (!ms || ms <= 0) return
    this.timer = new Timer(ms, () => this.dismiss('timer'))
    const bar = this.elements?.timerProgressBar
    if (bar) bar.style.animationDuration = `${ms}ms`
    this.timer.start()
    const popup = this.elements?.popup
    if (popup && this.options.timerProgressBar) {
      popup.addEventListener('mouseenter', () => this.stopTimer())
      popup.addEventListener('mouseleave', () => this.resumeTimer())
    }
  }

  // ---- timer controls ----
  stopTimer(): number | undefined {
    this.elements?.timerProgressBar?.classList.add(CLASS.paused)
    return this.timer?.stop()
  }
  resumeTimer(): void {
    this.elements?.timerProgressBar?.classList.remove(CLASS.paused)
    this.timer?.resume()
  }
  toggleTimer(): void {
    if (this.timer?.isRunning()) this.stopTimer()
    else this.resumeTimer()
  }
  increaseTimer(ms: number): number | undefined {
    return this.timer?.increase(ms)
  }
  getTimerLeft(): number | undefined {
    return this.timer?.getLeft()
  }
  isTimerRunning(): boolean {
    return this.timer?.isRunning() ?? false
  }

  private announceForScreenReaders(): void {
    const parts = [this.options.title, this.options.text].filter(
      (part): part is string => typeof part === 'string' && part.length > 0,
    )
    if (parts.length > 0) announce(parts.join('. '))
  }

  dismiss(reason: DismissReason, opts?: { immediate?: boolean }): void {
    this.close({ confirmed: false, denied: false, dismissed: true, dismissReason: reason }, opts)
  }

  close(result: LovelyAlertResult, opts?: { immediate?: boolean }): void {
    if (this.settled) return
    this.settled = true
    this.teardownEvents()

    if (!this.elements) {
      this.resolver?.(result)
      return
    }

    const { container, popup } = this.elements
    this.options.willClose?.(popup)

    const finalize = (): void => {
      this.timer?.clear()
      if (this.isToast) {
        removeNode(popup)
        releaseToastContainer(this.toastPosition)
        this.resolver?.(result)
        this.options.didClose?.()
        this.options.didDestroy?.()
        return
      }
      if (this.usedTopLayer && typeof container.hidePopover === 'function') {
        try {
          container.hidePopover()
        } catch {
          /* already hidden / detached */
        }
      }
      removeNode(container)
      if (this.lockedScroll) {
        unlockScroll()
        this.lockedScroll = false
      }
      clearActive(this)
      this.restoreFocus()
      this.resolver?.(result)
      this.options.didClose?.()
      this.options.didDestroy?.()
    }

    const animationHost = this.isToast ? popup : container
    if (opts?.immediate || !this.animationsEnabled) {
      finalize()
    } else {
      animationHost.classList.remove(CLASS.shown)
      animationHost.classList.add(CLASS.hiding)
      whenAnimationSettles(popup, finalize)
    }
  }

  // ---- interaction handlers (bound fields so removeEventListener works) ----

  private onConfirm = (): void => {
    void this.handleConfirm()
  }
  private onDeny = (): void => {
    void this.handleDeny()
  }
  private onCancel = (): void => {
    this.dismiss('cancel')
  }
  private onCloseClick = (): void => {
    this.dismiss('close')
  }
  private onContainerDown = (event: MouseEvent): void => {
    this.downOnContainer = event.target === this.elements?.container
  }
  private onContainerClick = (event: MouseEvent): void => {
    if (event.target !== this.elements?.container || !this.downOnContainer) return
    if (this.resolveAllow(this.options.allowOutsideClick)) this.dismiss('backdrop')
  }
  private onFocusIn = (event: FocusEvent): void => {
    const popup = this.elements?.popup
    if (!popup || this.settled) return
    const target = event.target as Node | null
    if (target && !popup.contains(target)) {
      const focusable = getFocusable(popup)
      ;(focusable[0] ?? popup).focus?.()
    }
  }
  private onKeydown = (event: KeyboardEvent): void => {
    if (this.options.stopKeydownPropagation) event.stopPropagation()
    if (event.key === 'Tab') {
      this.trapFocus(event)
      return
    }
    if (event.key === 'Escape') {
      if (this.resolveAllow(this.options.allowEscapeKey)) {
        event.preventDefault()
        this.dismiss('esc')
      }
      return
    }
    if (event.key === 'Enter') {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'TEXTAREA' || tag === 'BUTTON') return
      if (this.options.allowEnterKey !== false && this.elements?.confirmButton) {
        event.preventDefault()
        void this.handleConfirm()
      }
    }
  }

  private bindEvents(): void {
    const els = this.elements
    if (!els) return
    els.confirmButton?.addEventListener('click', this.onConfirm)
    els.denyButton?.addEventListener('click', this.onDeny)
    els.cancelButton?.addEventListener('click', this.onCancel)
    els.closeButton?.addEventListener('click', this.onCloseClick)
    els.container.addEventListener('mousedown', this.onContainerDown)
    els.container.addEventListener('click', this.onContainerClick)
    this.keydownHandler = this.onKeydown
    document.addEventListener(
      'keydown',
      this.keydownHandler,
      this.options.keydownListenerCapture ?? false,
    )
    // Focus trap guard for modals (toasts don't trap focus).
    if (!this.options.toast) document.addEventListener('focusin', this.onFocusIn)
  }

  private teardownEvents(): void {
    document.removeEventListener('focusin', this.onFocusIn)
    if (this.keydownHandler) {
      document.removeEventListener(
        'keydown',
        this.keydownHandler,
        this.options.keydownListenerCapture ?? false,
      )
      this.keydownHandler = undefined
    }
  }

  /** Keep Tab / Shift+Tab cycling within the popup (focus trap). */
  private trapFocus(event: KeyboardEvent): void {
    const popup = this.elements?.popup
    if (!popup || this.options.toast) return
    const focusable = getFocusable(popup)
    if (focusable.length === 0) {
      event.preventDefault()
      popup.focus?.()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const activeEl = document.activeElement
    if (event.shiftKey) {
      if (activeEl === first || !popup.contains(activeEl)) {
        event.preventDefault()
        last.focus()
      }
    } else if (activeEl === last) {
      event.preventDefault()
      first.focus()
    }
  }

  private resolveAllow(value: boolean | (() => boolean) | undefined): boolean {
    if (typeof value === 'function') return value()
    return value !== false
  }

  // ---- confirm / deny flows (preConfirm + full input system land in Phase 4) ----

  private async handleConfirm(): Promise<void> {
    if (this.settled) return
    this.resetValidationMessage()
    const value = this.readInputValue()
    const cfg = this.inputConfig()
    if (cfg?.validate) {
      const message = await cfg.validate(value as string)
      if (message) {
        this.showValidationMessage(message)
        return
      }
    }
    await this.runPreHook('confirm', value)
  }

  private async handleDeny(): Promise<void> {
    if (this.settled) return
    this.resetValidationMessage()
    const value = this.options.returnInputValueOnDeny ? this.readInputValue() : undefined
    await this.runPreHook('deny', value)
  }

  /** Run preConfirm/preDeny with a button loader; an error becomes a validation message. */
  private async runPreHook(kind: 'confirm' | 'deny', value: unknown): Promise<void> {
    const hook = kind === 'confirm' ? this.options.preConfirm : this.options.preDeny
    const result =
      kind === 'confirm'
        ? { confirmed: true, denied: false, dismissed: false }
        : { confirmed: false, denied: true, dismissed: false }
    if (!hook) {
      this.close({ ...result, value })
      return
    }
    this.showLoading(kind)
    try {
      const returned = await hook(value as never)
      if (this.settled) return
      this.hideLoading()
      this.close({ ...result, value: returned === undefined ? value : returned })
    } catch (error) {
      if (this.settled) return
      this.hideLoading()
      this.showValidationMessage(error instanceof Error ? error.message : String(error))
    }
  }

  private inputConfig(): InputConfig | undefined {
    const input = this.options.input
    if (!input) return undefined
    return typeof input === 'string' ? { type: input } : input
  }

  private readInputValue(): unknown {
    return this.elements?.inputReader?.()
  }

  private applyAutoFocus(): void {
    const els = this.elements
    if (!els || this.options.autoFocus === false) return
    const targets: Record<string, HTMLElement | undefined> = {
      confirm: els.confirmButton,
      deny: els.denyButton,
      cancel: els.cancelButton,
      input: els.input,
    }
    const target = this.options.autoFocus ? targets[this.options.autoFocus] : els.confirmButton
    ;(target ?? els.popup).focus?.()
  }

  private restoreFocus(): void {
    if (this.options.returnFocus !== false && this.previouslyFocused instanceof HTMLElement) {
      this.previouslyFocused.focus?.()
    }
  }

  /** Make the popup draggable by its title (or the popup itself). Uses left/top so it
   *  never fights the open animation's transform. Listeners die with the removed DOM. */
  private setupDraggable(): void {
    const popup = this.elements?.popup
    const handle = this.elements?.title ?? popup
    if (!popup || !handle) return
    popup.classList.add('la-draggable')
    handle.style.cursor = 'move'
    let dragging = false
    let startX = 0
    let startY = 0
    let baseX = 0
    let baseY = 0
    handle.addEventListener('pointerdown', (event: PointerEvent) => {
      dragging = true
      startX = event.clientX
      startY = event.clientY
      baseX = Number.parseFloat(popup.style.left || '0')
      baseY = Number.parseFloat(popup.style.top || '0')
      handle.setPointerCapture?.(event.pointerId)
    })
    handle.addEventListener('pointermove', (event: PointerEvent) => {
      if (!dragging) return
      popup.style.left = `${baseX + (event.clientX - startX)}px`
      popup.style.top = `${baseY + (event.clientY - startY)}px`
    })
    handle.addEventListener('pointerup', (event: PointerEvent) => {
      dragging = false
      handle.releasePointerCapture?.(event.pointerId)
    })
  }

  // ---- public surface used by the API layer ----

  showValidationMessage(message: string): void {
    const el = this.elements?.validationMessage
    if (!el) return
    el.textContent = message
    el.classList.add(CLASS.shown)
  }

  resetValidationMessage(): void {
    const el = this.elements?.validationMessage
    if (!el) return
    el.textContent = ''
    el.classList.remove(CLASS.shown)
  }

  showLoading(which: 'confirm' | 'deny' = 'confirm'): void {
    const button = which === 'deny' ? this.elements?.denyButton : this.elements?.confirmButton
    button?.classList.add(CLASS.loading)
    this.setButtonsDisabled(true)
  }

  hideLoading(): void {
    this.elements?.confirmButton?.classList.remove(CLASS.loading)
    this.elements?.denyButton?.classList.remove(CLASS.loading)
    this.setButtonsDisabled(false)
  }

  private setButtonsDisabled(disabled: boolean): void {
    for (const button of [
      this.elements?.confirmButton,
      this.elements?.denyButton,
      this.elements?.cancelButton,
    ]) {
      if (button) button.disabled = disabled
    }
  }

  isVisible(): boolean {
    return !!this.elements && !this.settled
  }

  getContainer(): HTMLElement | undefined {
    return this.elements?.container
  }
  getPopup(): HTMLElement | undefined {
    return this.elements?.popup
  }
  getInput(): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | undefined {
    return this.elements?.input
  }
  getConfirmButton(): HTMLButtonElement | undefined {
    return this.elements?.confirmButton
  }
  getDenyButton(): HTMLButtonElement | undefined {
    return this.elements?.denyButton
  }
  getCancelButton(): HTMLButtonElement | undefined {
    return this.elements?.cancelButton
  }

  /** Programmatically trigger the confirm flow. */
  clickConfirm(): void {
    void this.handleConfirm()
  }

  /** Merge new options and re-render in place (without replaying the open animation). */
  update(patch: Partial<LovelyAlertOptions>): void {
    if (!this.elements || this.settled) return
    this.options = { ...this.options, ...patch }
    this.teardownEvents()
    const fresh = render(this.options)
    fresh.container.classList.add(CLASS.shown)
    this.elements.container.replaceWith(fresh.container)
    this.elements = fresh
    this.bindEvents()
    this.options.didRender?.(fresh.popup)
  }
}
