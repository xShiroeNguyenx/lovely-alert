/**
 * Public type surface for LovelyAlert.
 *
 * This is the contract the whole monorepo keys off (catalog, MCP code-gen,
 * docs, migration table, framework wrappers), so it is designed as if final.
 * Some options are typed here in Phase 1 but only rendered in later phases
 * (inputs → Phase 4, timer/toast/progress → Phase 5); those are marked.
 */

export type IconType = 'success' | 'error' | 'warning' | 'info' | 'question'

export type Position =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'top-left'
  | 'top-right'
  | 'center'
  | 'center-start'
  | 'center-end'
  | 'center-left'
  | 'center-right'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'bottom-left'
  | 'bottom-right'

export type Grow = 'row' | 'column' | 'fullscreen' | false

export type BuiltInTheme = 'light' | 'dark' | 'auto'
/** Built-in themes plus any custom theme name (registered via CSS / theme builder). */
export type Theme = BuiltInTheme | (string & {})

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'search'
  | 'url'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'range'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'week'
  | 'month'
  | 'color'
  // rich inputs (LovelyAlert extras)
  | 'otp'
  | 'rating'
  | 'tags'

export const DISMISS_REASONS = [
  'backdrop',
  'cancel',
  'close',
  'esc',
  'timer',
  /** A newer alert opened while this one was active (own-API semantics). */
  'superseded',
] as const

export type DismissReason = (typeof DISMISS_REASONS)[number]

/** Outcome of an alert. `open()` resolves with this; convenience methods narrow it. */
export interface LovelyAlertResult<TValue = unknown> {
  confirmed: boolean
  denied: boolean
  dismissed: boolean
  /** The input value (when an input is used) or the value returned by preConfirm. */
  value?: TValue
  /** Why the alert was dismissed (only set when `dismissed` is true). */
  dismissReason?: DismissReason
}

/** Return an error message string to fail validation, or a falsy value to pass. */
export type InputValidator<T = string> = (
  value: T,
) => string | null | undefined | Promise<string | null | undefined>

export interface InputConfig {
  type: InputType
  label?: string
  placeholder?: string
  value?: string | number | boolean
  /** Options for `select` / `radio` inputs. */
  options?: Record<string, string> | Array<[string, string]>
  /** Extra HTML attributes applied to the input element. */
  attributes?: Record<string, string>
  autoFocus?: boolean
  /** Trim whitespace from text-like values before resolving. Default true. */
  autoTrim?: boolean
  validate?: InputValidator
}

export interface ButtonConfig {
  text?: string
  /** Background color (when styledButtons is on). */
  color?: string
  ariaLabel?: string
  /** Show a loader on this button while preConfirm/preDeny runs. */
  loading?: boolean
}

/** A button can be hidden (false), shown with default text (true), labeled (string) or configured. */
export type ButtonOption = boolean | string | ButtonConfig

export interface ButtonsConfig {
  confirm?: ButtonOption
  deny?: ButtonOption
  cancel?: ButtonOption
}

export interface ImageConfig {
  url: string
  width?: number | string
  height?: number | string
  alt?: string
}

export type CustomClassKey =
  | 'container'
  | 'popup'
  | 'title'
  | 'htmlContainer'
  | 'icon'
  | 'image'
  | 'actions'
  | 'confirmButton'
  | 'denyButton'
  | 'cancelButton'
  | 'closeButton'
  | 'footer'
  | 'input'
  | 'inputLabel'
  | 'validationMessage'
  | 'loader'
  | 'timerProgressBar'

export type CustomClass = Partial<Record<CustomClassKey, string>>

export interface AnimationClasses {
  popup?: string
  backdrop?: string
  icon?: string
}

export type AutoFocusTarget = 'confirm' | 'deny' | 'cancel' | 'input' | false

/** Lifecycle hook receiving the popup element. */
export type Hook = (popup: HTMLElement) => void
/** Lifecycle hook with no arguments (fired after the popup is gone). */
export type VoidHook = () => void

export interface LovelyAlertOptions<TValue = unknown> {
  // ---- Content ----
  title?: string
  text?: string
  html?: string | HTMLElement
  icon?: IconType
  iconColor?: string
  /** Custom icon content (overrides the built-in icon glyph). */
  iconHtml?: string
  image?: ImageConfig
  footer?: string | HTMLElement
  /** Use an existing element/template as popup content (advanced). */
  template?: string | HTMLElement

  // ---- Buttons ----
  buttons?: ButtonsConfig
  reverseButtons?: boolean
  /** Apply built-in button styling. Default true. */
  styledButtons?: boolean
  closeButton?: boolean | { html?: string; ariaLabel?: string }
  /** Custom loader markup shown on a loading button. */
  loaderHtml?: string

  // ---- Layout & looks ----
  position?: Position
  grow?: Grow
  width?: number | string
  padding?: number | string
  background?: string
  /** Text / foreground color. */
  color?: string
  /** `true` for the default scrim, `false` for none, or a CSS value (color/gradient/image). */
  backdrop?: boolean | string
  /** Where to mount the alert. Defaults to `document.body`. */
  target?: string | HTMLElement
  heightAuto?: boolean
  customClass?: CustomClass

  // ---- Theme & animation ----
  theme?: Theme
  /** Master switch for open/close animations. Default true. */
  animation?: boolean
  showClass?: AnimationClasses
  hideClass?: AnimationClasses
  draggable?: boolean
  /** Render in the browser top layer (Popover API) when available. */
  topLayer?: boolean
  /** Fire a confetti burst when the alert opens. */
  confetti?: boolean
  /** Play a cue on open: `true` synthesizes a tone per icon, or pass an audio URL. */
  sound?: boolean | string

  // ---- Toast (rendered in Phase 5) ----
  toast?: boolean

  // ---- Timer (rendered in Phase 5) ----
  timer?: number
  timerProgressBar?: boolean

  // ---- Input (rendered in Phase 4) ----
  input?: InputType | InputConfig

  // ---- Behaviour / interaction ----
  allowOutsideClick?: boolean | (() => boolean)
  allowEscapeKey?: boolean | (() => boolean)
  allowEnterKey?: boolean
  stopKeydownPropagation?: boolean
  keydownListenerCapture?: boolean
  /** Which element receives focus when the alert opens. Default 'confirm'. */
  autoFocus?: AutoFocusTarget
  /** Restore focus to the previously focused element on close. Default true. */
  returnFocus?: boolean
  /** Pad the body to compensate for the hidden scrollbar while open. Default true. */
  scrollbarPadding?: boolean
  /** Render right-to-left (sets `dir="rtl"` on the container). */
  rtl?: boolean

  // ---- Multi-step / progress (rendered in Phase 5) ----
  progressSteps?: string[]
  currentProgressStep?: number
  progressStepsDistance?: string

  // ---- Async confirm/deny (wired in Phase 4) ----
  preConfirm?: (value: TValue) => unknown | Promise<unknown>
  preDeny?: (value: TValue) => unknown | Promise<unknown>
  returnInputValueOnDeny?: boolean

  // ---- Lifecycle hooks (order: didRender → willOpen → didOpen, then willClose → didClose → didDestroy) ----
  didRender?: Hook
  willOpen?: Hook
  didOpen?: Hook
  willClose?: Hook
  didClose?: VoidHook
  didDestroy?: VoidHook
}

/** Options for the `confirm()` convenience method. */
export interface ConfirmOptions extends Omit<LovelyAlertOptions, 'buttons'> {
  confirmText?: string
  cancelText?: string
  /** Style the confirm button as destructive. */
  danger?: boolean
}

/** Options for the `prompt()` convenience method. */
export interface PromptOptions extends Omit<LovelyAlertOptions, 'input'> {
  input?: InputType
  placeholder?: string
  value?: string
  validate?: InputValidator
  confirmText?: string
  cancelText?: string
}
