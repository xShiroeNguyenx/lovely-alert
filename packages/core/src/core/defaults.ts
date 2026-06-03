import type { LovelyAlertOptions } from '../types'

/** Default button / aria labels (English). Localized in Phase 7 (i18n). */
export const DEFAULT_TEXT = {
  confirm: 'OK',
  deny: 'No',
  cancel: 'Cancel',
  closeAriaLabel: 'Close this dialog',
} as const

/** Library defaults, layered under mixin presets and call-time options. */
export const defaultOptions: LovelyAlertOptions = {
  position: 'center',
  grow: false,
  theme: 'auto',
  animation: true,
  styledButtons: true,
  reverseButtons: false,
  backdrop: true,
  heightAuto: true,
  allowOutsideClick: true,
  allowEscapeKey: true,
  allowEnterKey: true,
  stopKeydownPropagation: true,
  keydownListenerCapture: false,
  autoFocus: 'confirm',
  returnFocus: true,
  scrollbarPadding: true,
  toast: false,
  closeButton: false,
  buttons: { confirm: true },
}
