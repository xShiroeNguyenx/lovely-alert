import { ATTR, CLASS } from '../constants'
import type {
  ButtonConfig,
  ButtonOption,
  InputConfig,
  InputType,
  LovelyAlertOptions,
} from '../types'
import { addClasses, cssSize, h, setContent } from '../utils/dom'
import { t } from './i18n'
import { iconSvg } from './icons'
import { createInput } from './inputs'

/** References to the rendered elements, handed to the LovelyAlert instance. */
export interface RenderedElements {
  container: HTMLDivElement
  popup: HTMLDivElement
  closeButton?: HTMLButtonElement
  icon?: HTMLDivElement
  image?: HTMLImageElement
  title?: HTMLElement
  htmlContainer?: HTMLElement
  inputLabel?: HTMLLabelElement
  input?: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  inputReader?: () => unknown
  validationMessage?: HTMLDivElement
  actions?: HTMLDivElement
  confirmButton?: HTMLButtonElement
  denyButton?: HTMLButtonElement
  cancelButton?: HTMLButtonElement
  footer?: HTMLElement
  progressSteps?: HTMLDivElement
  timerProgressBar?: HTMLDivElement
}

interface NormalizedButton {
  text: string
  color?: string
  ariaLabel?: string
  loading?: boolean
}

let uid = 0
const nextId = (): string => `la-${++uid}`

function normalizeButton(opt: ButtonOption | undefined, fallback: string): NormalizedButton | null {
  if (opt === undefined || opt === false) return null
  if (opt === true) return { text: fallback }
  if (typeof opt === 'string') return { text: opt }
  const cfg = opt as ButtonConfig
  return {
    text: cfg.text ?? fallback,
    color: cfg.color,
    ariaLabel: cfg.ariaLabel,
    loading: cfg.loading,
  }
}

function createButton(
  baseClass: string,
  btn: NormalizedButton,
  extraClass: string | undefined,
): HTMLButtonElement {
  const el = h('button', baseClass, { type: 'button' })
  el.textContent = btn.text
  if (btn.color) el.style.background = btn.color
  if (btn.ariaLabel) el.setAttribute('aria-label', btn.ariaLabel)
  addClasses(el, extraClass)
  return el
}

function resolveInputConfig(input: InputType | InputConfig): InputConfig {
  return typeof input === 'string' ? { type: input } : input
}

/** Build the full alert DOM tree from already-merged options. */
export function render(options: LovelyAlertOptions): RenderedElements {
  const cc = options.customClass ?? {}

  const container = h('div', CLASS.container)
  addClasses(container, cc.container)
  container.setAttribute(ATTR.position, options.position ?? 'center')
  container.setAttribute(ATTR.theme, String(options.theme ?? 'auto'))
  if (options.backdrop === false) container.classList.add(CLASS.noBackdrop)
  else if (typeof options.backdrop === 'string') container.style.background = options.backdrop
  if (options.rtl) container.setAttribute('dir', 'rtl')

  const popup = h('div', CLASS.popup, {
    role: 'dialog',
    'aria-modal': 'true',
    tabindex: '-1',
  })
  if (options.styledButtons !== false) popup.classList.add(CLASS.styled)
  if (options.toast) {
    container.classList.add(CLASS.toastContainer)
    popup.classList.add(CLASS.toast)
    popup.setAttribute('role', 'alert')
  }
  addClasses(popup, cc.popup)
  if (options.width !== undefined) popup.style.width = cssSize(options.width) ?? ''
  if (options.padding !== undefined) popup.style.padding = cssSize(options.padding) ?? ''
  if (options.background) popup.style.background = options.background
  if (options.color) popup.style.color = options.color
  if (options.grow) popup.classList.add(`la-grow-${options.grow}`)
  if (options.grow === 'fullscreen') container.style.padding = '0'
  container.appendChild(popup)

  const els: RenderedElements = { container, popup }

  // ----- close button -----
  if (options.closeButton) {
    const cfg = typeof options.closeButton === 'object' ? options.closeButton : {}
    const closeButton = h('button', CLASS.closeButton, {
      type: 'button',
      'aria-label': cfg.ariaLabel ?? t().closeAriaLabel,
    })
    closeButton.innerHTML = cfg.html ?? '&times;'
    addClasses(closeButton, cc.closeButton)
    popup.appendChild(closeButton)
    els.closeButton = closeButton
  }

  // ----- progress steps -----
  if (options.progressSteps && options.progressSteps.length > 0) {
    const steps = h('div', CLASS.steps)
    if (options.progressStepsDistance) steps.style.gap = options.progressStepsDistance
    const current = options.currentProgressStep ?? 0
    options.progressSteps.forEach((label, index) => {
      const step = h('span', CLASS.step)
      step.textContent = label
      if (index === current) step.classList.add(CLASS.stepActive)
      steps.appendChild(step)
    })
    popup.appendChild(steps)
    els.progressSteps = steps
  }

  // ----- icon (animated inline SVG; iconHtml overrides) -----
  if (options.icon || options.iconHtml) {
    const icon = h('div', CLASS.icon)
    if (options.icon) icon.setAttribute(ATTR.icon, options.icon)
    if (options.iconColor) icon.style.color = options.iconColor
    icon.innerHTML = options.iconHtml ?? (options.icon ? iconSvg(options.icon) : '')
    addClasses(icon, cc.icon)
    popup.appendChild(icon)
    els.icon = icon
  }

  // ----- image -----
  if (options.image) {
    const image = h('img', CLASS.image, {
      src: options.image.url,
      alt: options.image.alt ?? '',
    })
    if (options.image.width !== undefined) image.style.width = cssSize(options.image.width) ?? ''
    if (options.image.height !== undefined) image.style.height = cssSize(options.image.height) ?? ''
    addClasses(image, cc.image)
    popup.appendChild(image)
    els.image = image
  }

  // ----- title -----
  if (options.title) {
    const title = h('h2', CLASS.title, { id: nextId() })
    title.textContent = options.title
    addClasses(title, cc.title)
    popup.appendChild(title)
    popup.setAttribute('aria-labelledby', title.id)
    els.title = title
  }

  // ----- body (html wins over text) -----
  if (options.html !== undefined || options.text !== undefined) {
    const body = h('div', CLASS.htmlContainer, { id: nextId() })
    if (options.html !== undefined) setContent(body, options.html)
    else body.textContent = options.text ?? ''
    addClasses(body, cc.htmlContainer)
    popup.appendChild(body)
    popup.setAttribute('aria-describedby', body.id)
    els.htmlContainer = body
  }

  // ----- input (all 18 types via createInput) -----
  if (options.input) {
    const cfg = resolveInputConfig(options.input)
    if (cfg.label && cfg.type !== 'checkbox') {
      const label = h('label', CLASS.inputLabel)
      label.textContent = cfg.label
      addClasses(label, cc.inputLabel)
      popup.appendChild(label)
      els.inputLabel = label
    }
    const descriptor = createInput(cfg)
    addClasses(descriptor.focusEl, cc.input)
    popup.appendChild(descriptor.node)
    els.input = descriptor.focusEl as RenderedElements['input']
    els.inputReader = descriptor.read
  }

  // ----- validation message (always present so preConfirm errors can surface) -----
  {
    const validation = h('div', CLASS.validationMessage, { 'aria-live': 'assertive' })
    addClasses(validation, cc.validationMessage)
    popup.appendChild(validation)
    els.validationMessage = validation
  }

  // ----- actions -----
  const confirm = normalizeButton(options.buttons?.confirm, t().confirm)
  const deny = normalizeButton(options.buttons?.deny, t().deny)
  const cancel = normalizeButton(options.buttons?.cancel, t().cancel)

  if (confirm || deny || cancel) {
    const actions = h('div', CLASS.actions)
    addClasses(actions, cc.actions)
    const order: Array<'confirm' | 'deny' | 'cancel'> = options.reverseButtons
      ? ['cancel', 'deny', 'confirm']
      : ['confirm', 'deny', 'cancel']
    for (const kind of order) {
      if (kind === 'confirm' && confirm) {
        els.confirmButton = createButton(CLASS.confirmButton, confirm, cc.confirmButton)
        actions.appendChild(els.confirmButton)
      } else if (kind === 'deny' && deny) {
        els.denyButton = createButton(CLASS.denyButton, deny, cc.denyButton)
        actions.appendChild(els.denyButton)
      } else if (kind === 'cancel' && cancel) {
        els.cancelButton = createButton(CLASS.cancelButton, cancel, cc.cancelButton)
        actions.appendChild(els.cancelButton)
      }
    }
    popup.appendChild(actions)
    els.actions = actions
  }

  // ----- footer -----
  if (options.footer !== undefined) {
    const footer = h('footer', CLASS.footer)
    setContent(footer, options.footer)
    addClasses(footer, cc.footer)
    popup.appendChild(footer)
    els.footer = footer
  }

  // ----- timer progress bar -----
  if (options.timer && options.timerProgressBar) {
    const bar = h('div', CLASS.timerProgressBar)
    addClasses(bar, cc.timerProgressBar)
    popup.appendChild(bar)
    els.timerProgressBar = bar
  }

  return els
}
