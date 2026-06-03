/** Static reference data served by the MCP server (kept in sync with the core API). */

export const API_METHODS = [
  'la.open(options) → Promise<Result>',
  'la.success(title, text?, options?) / error / warning / info / question',
  'la.confirm(title, options?) → Promise<boolean>',
  'la.prompt(title, options?) → Promise<string | null>',
  'la.toast.success/error/warning/info/question(title, options?)',
  'la.chain(steps[]) → Promise<Result[]>  (multi-step wizard with progress)',
  'la.build()… .show()  (fluent builder)',
  'la.mixin(preset) → scoped API with defaults',
  'la.update(options) / la.close(result?) / la.current() / la.isVisible()',
  'la.theme.set/get/define/export · la.locale.set/get/define · la.confetti()',
]

export const INPUT_TYPES = [
  'text',
  'email',
  'password',
  'number',
  'tel',
  'search',
  'url',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'file',
  'range',
  'date',
  'datetime-local',
  'time',
  'week',
  'month',
  'color',
  'otp',
  'rating',
  'tags',
]

export const ICON_TYPES = ['success', 'error', 'warning', 'info', 'question']

export const THEMES = ['light', 'dark', 'auto', 'minimal', 'borderless']

/** Known top-level option names — used by validate_options. */
export const KNOWN_OPTIONS = new Set<string>([
  'title',
  'text',
  'html',
  'icon',
  'iconColor',
  'iconHtml',
  'image',
  'footer',
  'template',
  'buttons',
  'reverseButtons',
  'styledButtons',
  'closeButton',
  'loaderHtml',
  'position',
  'grow',
  'width',
  'padding',
  'background',
  'color',
  'backdrop',
  'target',
  'heightAuto',
  'customClass',
  'theme',
  'animation',
  'showClass',
  'hideClass',
  'draggable',
  'topLayer',
  'confetti',
  'sound',
  'toast',
  'timer',
  'timerProgressBar',
  'input',
  'allowOutsideClick',
  'allowEscapeKey',
  'allowEnterKey',
  'stopKeydownPropagation',
  'keydownListenerCapture',
  'autoFocus',
  'returnFocus',
  'scrollbarPadding',
  'rtl',
  'progressSteps',
  'currentProgressStep',
  'progressStepsDistance',
  'preConfirm',
  'preDeny',
  'returnInputValueOnDeny',
  'didRender',
  'willOpen',
  'didOpen',
  'willClose',
  'didClose',
  'didDestroy',
])

export const OVERVIEW = `# LovelyAlert

A beautiful, modern, accessible, themeable alert / modal / toast library with a fresh,
ergonomic API — zero runtime dependencies and auto-injected styles (so code runs as-is,
including from a CDN).

Install: \`npm install lovely-alert\` then \`import { la } from 'lovely-alert'\`.

Highlights: light/dark/auto themes + theme builder, full WAI-ARIA accessibility, 22 input types
(incl. OTP/rating/tags), stacking toasts, timers, multi-step wizards, confetti, React & Vue
bindings, and i18n (en + vi).`

export const API_REFERENCE = `# LovelyAlert API reference

## Methods
${API_METHODS.map((m) => `- ${m}`).join('\n')}

## Result object (from open/success/…)
{ confirmed: boolean, denied: boolean, dismissed: boolean, value?: unknown, dismissReason?: 'backdrop'|'cancel'|'close'|'esc'|'timer'|'superseded' }

## Icons
${ICON_TYPES.join(', ')}

## Input types
${INPUT_TYPES.join(', ')}

## Themes
${THEMES.join(', ')} (+ custom via la.theme.define)

## Buttons
buttons: { confirm?, deny?, cancel? } — each is boolean | string | { text?, color?, ariaLabel?, loading? }

## Lifecycle hooks (in order)
didRender → willOpen → didOpen, then willClose → didClose → didDestroy`

/** Build CSS custom properties for a custom theme (mirrors core's exportThemeCss). */
export function themeToCss(name: string, tokens: Record<string, string>): string {
  const body = Object.entries(tokens)
    .map(([key, value]) => `  ${key.startsWith('--') ? key : `--la-${key}`}: ${value};`)
    .join('\n')
  return `.la-container[data-la-theme="${name}"] {\n${body}\n}`
}
