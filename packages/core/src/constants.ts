/** Shared constants: CSS class names, attributes and timing. */

/** Class-name registry for every rendered element (also used by customClass merging). */
export const CLASS = {
  container: 'la-container',
  popup: 'la-popup',
  toast: 'la-toast',
  toastContainer: 'la-toast-container',
  steps: 'la-steps',
  step: 'la-step',
  stepActive: 'la-step-active',
  icon: 'la-icon',
  image: 'la-image',
  title: 'la-title',
  closeButton: 'la-close',
  htmlContainer: 'la-html',
  input: 'la-input',
  inputLabel: 'la-input-label',
  radioGroup: 'la-radio-group',
  radio: 'la-radio',
  checkbox: 'la-checkbox',
  otp: 'la-otp',
  otpBox: 'la-otp-box',
  rating: 'la-rating',
  star: 'la-star',
  starOn: 'la-star-on',
  tags: 'la-tags',
  tag: 'la-tag',
  validationMessage: 'la-validation',
  actions: 'la-actions',
  confirmButton: 'la-confirm',
  denyButton: 'la-deny',
  cancelButton: 'la-cancel',
  loader: 'la-loader',
  footer: 'la-footer',
  timerProgressBar: 'la-timer-bar',
  // state classes
  shown: 'la-shown',
  hiding: 'la-hiding',
  paused: 'la-paused',
  noBackdrop: 'la-no-backdrop',
  styled: 'la-styled',
  loading: 'la-loading',
  iconContent: 'la-icon-content',
} as const

export const ATTR = {
  theme: 'data-la-theme',
  position: 'data-la-position',
  icon: 'data-la-icon',
} as const

/** id of the injected <style> element (used to inject styles exactly once). */
export const STYLE_ELEMENT_ID = 'lovely-alert-styles'

/**
 * Fallback used when waiting for an open/close animation to finish.
 * Covers the "no animation at all" path (reduced motion, animation: false),
 * where no animationend/transitionend event ever fires.
 */
export const ANIMATION_FALLBACK_MS = 400
