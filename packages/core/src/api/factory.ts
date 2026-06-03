import { ATTR } from '../constants'
import { LovelyAlert } from '../core/LovelyAlert'
import { defaultOptions } from '../core/defaults'
import { type ConfettiOptions, confetti as fireConfetti } from '../core/effects'
import { getActive, getGlobalDefaults, patchGlobalDefaults } from '../core/globalState'
import { type Locale, defineLocale, getLocaleName, setLocale } from '../core/i18n'
import { defineTheme, exportThemeCss } from '../core/themeBuilder'
import type {
  ConfirmOptions,
  IconType,
  LovelyAlertOptions,
  LovelyAlertResult,
  PromptOptions,
  Theme,
} from '../types'
import { mergeAll } from '../utils/object'
import { VERSION } from '../version'
import { AlertBuilder } from './builder'

/** The public LovelyAlert API surface (the `la` object, and what `mixin()` returns). */
export interface LovelyAlertApi {
  /** Low-level: open an alert with full options; resolves with the full result. */
  open(options: LovelyAlertOptions): Promise<LovelyAlertResult>
  success(title: string, text?: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
  error(title: string, text?: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
  warning(title: string, text?: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
  info(title: string, text?: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
  question(title: string, text?: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
  /** Yes/Cancel confirmation; resolves `true` when confirmed. */
  confirm(title: string, options?: ConfirmOptions): Promise<boolean>
  /** Ask for input; resolves the value, or `null` when dismissed. */
  prompt(title: string, options?: PromptOptions): Promise<string | null>
  /** Toasts (compact, auto-dismissing, non-blocking; default top-end + 3s timer). */
  toast: {
    show(title: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
    success(title: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
    error(title: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
    warning(title: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
    info(title: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
    question(title: string, options?: LovelyAlertOptions): Promise<LovelyAlertResult>
  }
  /** Run a sequence of alerts (auto progress steps); stops if a step is dismissed. */
  chain(steps: LovelyAlertOptions[]): Promise<LovelyAlertResult[]>
  /** Fluent builder for power users. */
  build(): AlertBuilder
  /** Create a new API with preset defaults merged in. */
  mixin(preset: LovelyAlertOptions): LovelyAlertApi
  /** Update the currently open alert in place. */
  update(options: Partial<LovelyAlertOptions>): void
  /** Close the currently open alert (defaults to a dismissal). */
  close(result?: LovelyAlertResult): void
  /** The currently open alert instance, if any. */
  current(): LovelyAlert | undefined
  isVisible(): boolean
  theme: {
    set(theme: Theme): void
    get(): Theme | undefined
    /** Register a custom theme at runtime (token map, e.g. `{ primary: '#e11', bg: '#111' }`). */
    define(name: string, tokens: Record<string, string>): void
    /** Return the CSS for a custom theme without injecting it (theme-builder export). */
    export(name: string, tokens: Record<string, string>): string
  }
  /** Fire a standalone confetti burst. */
  confetti(options?: ConfettiOptions): void
  /** Locale control for built-in labels (ships with `en` and `vi`). */
  locale: {
    set(name: string): void
    get(): string
    define(name: string, strings: Locale): void
  }
  readonly VERSION: string
}

export function createApi(preset: LovelyAlertOptions = {}): LovelyAlertApi {
  const open = (options: LovelyAlertOptions): Promise<LovelyAlertResult> => {
    const merged = mergeAll<LovelyAlertOptions>(
      defaultOptions,
      getGlobalDefaults(),
      preset,
      options,
    )
    return new LovelyAlert(merged).open()
  }

  const withIcon =
    (icon: IconType) =>
    (title: string, text?: string, options: LovelyAlertOptions = {}): Promise<LovelyAlertResult> =>
      open({ icon, title, ...(text !== undefined ? { text } : {}), ...options })

  const openToast = (
    icon: IconType | undefined,
    title: string,
    options: LovelyAlertOptions = {},
  ): Promise<LovelyAlertResult> =>
    open({
      toast: true,
      position: 'top-end',
      timer: 3000,
      timerProgressBar: true,
      buttons: { confirm: false },
      ...(icon ? { icon } : {}),
      title,
      ...options,
    })

  const api: LovelyAlertApi = {
    open,
    success: withIcon('success'),
    error: withIcon('error'),
    warning: withIcon('warning'),
    info: withIcon('info'),
    question: withIcon('question'),

    confirm(title, options = {}) {
      const { confirmText, cancelText, danger, customClass, ...rest } = options
      const cc = { ...(customClass ?? {}) }
      if (danger) cc.confirmButton = [cc.confirmButton, 'la-danger'].filter(Boolean).join(' ')
      return open({
        title,
        icon: 'question',
        ...rest,
        buttons: { confirm: confirmText ?? 'Yes', cancel: cancelText ?? 'Cancel' },
        customClass: cc,
      }).then((result) => result.confirmed)
    },

    prompt(title, options = {}) {
      const {
        input = 'text',
        placeholder,
        value,
        validate,
        confirmText,
        cancelText,
        ...rest
      } = options
      return open({
        title,
        ...rest,
        input: { type: input, placeholder, value, validate },
        buttons: { confirm: confirmText ?? 'OK', cancel: cancelText ?? 'Cancel' },
      }).then((result) => (result.confirmed ? (result.value as string) : null))
    },

    toast: {
      show: (title, options) => openToast(undefined, title, options),
      success: (title, options) => openToast('success', title, options),
      error: (title, options) => openToast('error', title, options),
      warning: (title, options) => openToast('warning', title, options),
      info: (title, options) => openToast('info', title, options),
      question: (title, options) => openToast('question', title, options),
    },

    async chain(steps) {
      const results: LovelyAlertResult[] = []
      const labels = steps.map((_, index) => String(index + 1))
      for (const [index, step] of steps.entries()) {
        const result = await open({ progressSteps: labels, currentProgressStep: index, ...step })
        results.push(result)
        if (result.dismissed) break
      }
      return results
    },

    build() {
      return new AlertBuilder(open)
    },

    mixin(nextPreset) {
      return createApi(mergeAll<LovelyAlertOptions>(preset, nextPreset))
    },

    update(options) {
      getActive()?.update(options)
    },

    close(result) {
      getActive()?.close(result ?? { confirmed: false, denied: false, dismissed: true })
    },

    current() {
      return getActive()
    },

    isVisible() {
      return getActive()?.isVisible() ?? false
    },

    theme: {
      set(theme) {
        patchGlobalDefaults({ theme })
        getActive()?.getContainer()?.setAttribute(ATTR.theme, String(theme))
      },
      get() {
        return getGlobalDefaults().theme
      },
      define(name, tokens) {
        defineTheme(name, tokens)
      },
      export(name, tokens) {
        return exportThemeCss(name, tokens)
      },
    },

    confetti(options) {
      fireConfetti(options)
    },

    locale: {
      set(name) {
        setLocale(name)
      },
      get() {
        return getLocaleName()
      },
      define(name, strings) {
        defineLocale(name, strings)
      },
    },

    VERSION,
  }

  return api
}
