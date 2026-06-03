/**
 * lovely-alert — a modern, accessible, themeable alert / modal / toast library.
 *
 * Styles auto-inject on first use, so CDN/UMD consumers and AI-generated
 * snippets render correctly with no extra CSS import.
 */
import { createApi } from './api/factory'

/** The default, ready-to-use API instance. Use `import { la } from 'lovely-alert'`,
 *  or `window.LovelyAlert.la` from the UMD/CDN build. */
export const la = createApi()

export { VERSION } from './version'
export { createApi } from './api/factory'
export type { LovelyAlertApi } from './api/factory'
export { AlertBuilder } from './api/builder'
export { LovelyAlert } from './core/LovelyAlert'
export { confetti } from './core/effects'
export type { ConfettiOptions } from './core/effects'
export { defineTheme, exportThemeCss } from './core/themeBuilder'
export { defineLocale, setLocale } from './core/i18n'
export type { Locale } from './core/i18n'

export type {
  AnimationClasses,
  AutoFocusTarget,
  BuiltInTheme,
  ButtonConfig,
  ButtonOption,
  ButtonsConfig,
  ConfirmOptions,
  CustomClass,
  CustomClassKey,
  DismissReason,
  Grow,
  Hook,
  IconType,
  ImageConfig,
  InputConfig,
  InputType,
  InputValidator,
  LovelyAlertOptions,
  LovelyAlertResult,
  Position,
  PromptOptions,
  Theme,
  VoidHook,
} from './types'
export { DISMISS_REASONS } from './types'
