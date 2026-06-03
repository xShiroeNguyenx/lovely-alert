import type {
  ButtonConfig,
  Grow,
  IconType,
  ImageConfig,
  InputConfig,
  InputType,
  LovelyAlertOptions,
  LovelyAlertResult,
  Position,
  Theme,
} from '../types'

type Opener = (options: LovelyAlertOptions) => Promise<LovelyAlertResult>

/** Fluent builder for power users. Accumulates options, then `.show()` opens the alert. */
export class AlertBuilder {
  private readonly options: LovelyAlertOptions = {}

  constructor(private readonly opener: Opener) {}

  title(title: string): this {
    this.options.title = title
    return this
  }
  text(text: string): this {
    this.options.text = text
    return this
  }
  html(html: string | HTMLElement): this {
    this.options.html = html
    return this
  }
  icon(icon: IconType, color?: string): this {
    this.options.icon = icon
    if (color) this.options.iconColor = color
    return this
  }
  image(image: ImageConfig): this {
    this.options.image = image
    return this
  }
  footer(footer: string | HTMLElement): this {
    this.options.footer = footer
    return this
  }
  position(position: Position): this {
    this.options.position = position
    return this
  }
  theme(theme: Theme): this {
    this.options.theme = theme
    return this
  }
  grow(grow: Grow): this {
    this.options.grow = grow
    return this
  }
  width(width: number | string): this {
    this.options.width = width
    return this
  }
  padding(padding: number | string): this {
    this.options.padding = padding
    return this
  }
  background(background: string): this {
    this.options.background = background
    return this
  }
  color(color: string): this {
    this.options.color = color
    return this
  }
  backdrop(backdrop: boolean | string): this {
    this.options.backdrop = backdrop
    return this
  }
  toast(toast = true): this {
    this.options.toast = toast
    return this
  }
  timer(ms: number, progressBar = false): this {
    this.options.timer = ms
    this.options.timerProgressBar = progressBar
    return this
  }
  draggable(draggable = true): this {
    this.options.draggable = draggable
    return this
  }
  animation(enabled: boolean): this {
    this.options.animation = enabled
    return this
  }
  closeButton(closeButton: boolean | { html?: string; ariaLabel?: string } = true): this {
    this.options.closeButton = closeButton
    return this
  }
  reverseButtons(reverse = true): this {
    this.options.reverseButtons = reverse
    return this
  }
  input(type: InputType, config?: Omit<InputConfig, 'type'>): this {
    this.options.input = config ? { type, ...config } : type
    return this
  }
  confirmButton(text?: string, config?: Omit<ButtonConfig, 'text'>): this {
    this.options.buttons = {
      ...this.options.buttons,
      confirm: config ? { text, ...config } : (text ?? true),
    }
    return this
  }
  denyButton(text?: string, config?: Omit<ButtonConfig, 'text'>): this {
    this.options.buttons = {
      ...this.options.buttons,
      deny: config ? { text, ...config } : (text ?? true),
    }
    return this
  }
  cancelButton(text?: string, config?: Omit<ButtonConfig, 'text'>): this {
    this.options.buttons = {
      ...this.options.buttons,
      cancel: config ? { text, ...config } : (text ?? true),
    }
    return this
  }
  customClass(customClass: LovelyAlertOptions['customClass']): this {
    this.options.customClass = { ...this.options.customClass, ...customClass }
    return this
  }
  /** Escape hatch: set any option directly. */
  set<K extends keyof LovelyAlertOptions>(key: K, value: LovelyAlertOptions[K]): this {
    this.options[key] = value
    return this
  }
  /** Snapshot of the accumulated options (handy for tests / serialization). */
  toOptions(): LovelyAlertOptions {
    return { ...this.options }
  }
  /** Open the alert and resolve with the result. */
  show(): Promise<LovelyAlertResult> {
    return this.opener(this.options)
  }
}
