/**
 * The example catalog — the single source of truth for the docs site, the MCP
 * server, and tests. Each example's `code` uses the public LovelyAlert API and
 * is meant to run as-is (styles auto-inject).
 */

export type ExampleCategory =
  | 'basic'
  | 'icons'
  | 'buttons'
  | 'inputs'
  | 'toast'
  | 'timer'
  | 'theming'
  | 'effects'
  | 'advanced'

export interface CatalogExample {
  /** Stable unique id, e.g. "basic-success". */
  id: string
  category: ExampleCategory
  title: string
  description: string
  /** Source code using the new LovelyAlert API. */
  code: string
  /** Free-form tags for search/filtering. */
  tags: string[]
}

export const categories: ExampleCategory[] = [
  'basic',
  'icons',
  'buttons',
  'inputs',
  'toast',
  'timer',
  'theming',
  'effects',
  'advanced',
]

export const examples: CatalogExample[] = [
  {
    id: 'basic-success',
    category: 'basic',
    title: 'Success message',
    description: 'A simple success alert with a title and body text.',
    code: `await la.success('Saved!', 'Your changes were saved successfully.')`,
    tags: ['success', 'message', 'basic'],
  },
  {
    id: 'basic-error',
    category: 'basic',
    title: 'Error message',
    description: 'Report a failure to the user.',
    code: `await la.error('Oops…', 'Something went wrong. Please try again.')`,
    tags: ['error', 'message'],
  },
  {
    id: 'basic-html',
    category: 'basic',
    title: 'Rich HTML content',
    description: 'Render custom HTML inside the alert body.',
    code: `await la.open({
  title: 'Terms',
  html: 'Read our <a href="#">terms &amp; conditions</a> carefully.',
})`,
    tags: ['html', 'content'],
  },
  {
    id: 'icons-all',
    category: 'icons',
    title: 'All five icons',
    description: 'success, error, warning, info and question — animated SVG.',
    code: `await la.open({ title: 'Heads up', icon: 'warning' })`,
    tags: ['icon', 'warning', 'info', 'question'],
  },
  {
    id: 'buttons-confirm',
    category: 'buttons',
    title: 'Confirm (Yes / Cancel)',
    description: 'Resolves true when confirmed. Use { danger: true } for destructive actions.',
    code: `const ok = await la.confirm('Delete this item?', { confirmText: 'Delete', danger: true })
if (ok) await la.success('Deleted')`,
    tags: ['confirm', 'danger', 'delete'],
  },
  {
    id: 'buttons-three',
    category: 'buttons',
    title: 'Confirm / Deny / Cancel',
    description: 'Three-way choice via the low-level open() and the result object.',
    code: `const r = await la.open({
  title: 'Save changes?',
  buttons: { confirm: 'Save', deny: "Don't save", cancel: true },
})
if (r.confirmed) save()
else if (r.denied) discard()`,
    tags: ['deny', 'cancel', 'buttons'],
  },
  {
    id: 'inputs-prompt',
    category: 'inputs',
    title: 'Text prompt with validation',
    description: 'Ask for input and validate it before resolving.',
    code: `const name = await la.prompt('Your name?', {
  input: 'text',
  placeholder: 'e.g. Jane',
  validate: (v) => (v ? null : 'Name is required'),
})`,
    tags: ['prompt', 'input', 'validate'],
  },
  {
    id: 'inputs-select',
    category: 'inputs',
    title: 'Select input',
    description: 'Choose from a list of options.',
    code: `const r = await la.open({
  title: 'Pick a fruit',
  input: { type: 'select', options: { apple: 'Apple', banana: 'Banana' } },
})`,
    tags: ['select', 'options'],
  },
  {
    id: 'inputs-otp',
    category: 'inputs',
    title: 'OTP / PIN input',
    description: 'A segmented one-time-code input (LovelyAlert extra).',
    code: `const code = await la.prompt('Enter the 6-digit code', { input: 'otp' })`,
    tags: ['otp', 'pin', 'rich-input'],
  },
  {
    id: 'inputs-rating',
    category: 'inputs',
    title: 'Star rating',
    description: 'Collect a 1–5 star rating (LovelyAlert extra).',
    code: `const r = await la.open({ title: 'Rate us', input: 'rating' })`,
    tags: ['rating', 'stars', 'rich-input'],
  },
  {
    id: 'inputs-preconfirm',
    category: 'inputs',
    title: 'Async preConfirm with loader',
    description: 'Run an async action on confirm; throw to show a validation error.',
    code: `await la.open({
  title: 'Sign in',
  input: { type: 'password', placeholder: 'Password' },
  preConfirm: async (pwd) => {
    const res = await fetch('/api/login', { method: 'POST', body: pwd })
    if (!res.ok) throw new Error('Wrong password')
    return res.json()
  },
})`,
    tags: ['preConfirm', 'async', 'loader'],
  },
  {
    id: 'toast-success',
    category: 'toast',
    title: 'Success toast',
    description: 'A compact, auto-dismissing, non-blocking notification.',
    code: `la.toast.success('Copied to clipboard')`,
    tags: ['toast', 'notification'],
  },
  {
    id: 'toast-stack',
    category: 'toast',
    title: 'Stacked toasts',
    description: 'Multiple toasts stack in a shared per-position container.',
    code: `la.toast.info('First')
la.toast.info('Second')
la.toast.info('Third')`,
    tags: ['toast', 'stack', 'queue'],
  },
  {
    id: 'timer-auto',
    category: 'timer',
    title: 'Auto-close with progress bar',
    description: 'Closes automatically after the timer; hovering pauses it.',
    code: `await la.open({
  title: 'Auto-closing',
  icon: 'info',
  timer: 3000,
  timerProgressBar: true,
})`,
    tags: ['timer', 'progress', 'auto-close'],
  },
  {
    id: 'theming-dark',
    category: 'theming',
    title: 'Dark / light / auto',
    description: 'Pick a theme per alert, or set a global default.',
    code: `la.theme.set('auto') // 'light' | 'dark' | 'auto'
await la.open({ title: 'Hello', theme: 'dark' })`,
    tags: ['theme', 'dark', 'light'],
  },
  {
    id: 'theming-builder',
    category: 'theming',
    title: 'Custom theme (theme builder)',
    description: 'Register a custom theme from a token map.',
    code: `la.theme.define('brand', { primary: '#e11d48', bg: '#1a1320', fg: '#fce7f3' })
await la.open({ title: 'On brand', theme: 'brand', icon: 'success' })`,
    tags: ['theme', 'custom', 'tokens'],
  },
  {
    id: 'effects-confetti',
    category: 'effects',
    title: 'Confetti celebration',
    description: 'Fire a confetti burst on success.',
    code: `await la.open({ title: 'You did it! 🎉', icon: 'success', confetti: true })`,
    tags: ['confetti', 'celebrate', 'effects'],
  },
  {
    id: 'effects-draggable',
    category: 'effects',
    title: 'Draggable dialog',
    description: 'Let users drag the dialog by its title.',
    code: `await la.open({ title: 'Drag me', text: 'Grab the title bar.', draggable: true })`,
    tags: ['draggable', 'drag'],
  },
  {
    id: 'advanced-builder',
    category: 'advanced',
    title: 'Fluent builder',
    description: 'Compose an alert step by step for power users.',
    code: `await la
  .build()
  .title('Subscribe')
  .icon('question')
  .input('email', { placeholder: 'you@example.com' })
  .confirmButton('Subscribe')
  .cancelButton()
  .show()`,
    tags: ['builder', 'fluent'],
  },
  {
    id: 'advanced-chain',
    category: 'advanced',
    title: 'Multi-step wizard',
    description: 'Run a sequence of alerts with automatic progress steps.',
    code: `const results = await la.chain([
  { title: 'Step 1', input: 'text', inputLabel: 'Name' },
  { title: 'Step 2', input: 'email', inputLabel: 'Email' },
  { title: 'All done!', icon: 'success' },
])`,
    tags: ['chain', 'wizard', 'steps'],
  },
  {
    id: 'advanced-mixin',
    category: 'advanced',
    title: 'Reusable defaults (mixin)',
    description: 'Create a pre-configured API with shared defaults.',
    code: `const branded = la.mixin({ theme: 'dark', confirmText: 'Got it' })
await branded.success('Reused defaults')`,
    tags: ['mixin', 'defaults'],
  },
  {
    id: 'advanced-i18n',
    category: 'advanced',
    title: 'Localized labels (i18n)',
    description: 'Switch built-in button labels; ships with en and vi.',
    code: `la.locale.set('vi')
await la.open({ title: 'Xin chào', buttons: { confirm: true } })`,
    tags: ['i18n', 'locale', 'vietnamese'],
  },
]

export function getExample(id: string): CatalogExample | undefined {
  return examples.find((example) => example.id === id)
}

export function getExamplesByCategory(category: ExampleCategory): CatalogExample[] {
  return examples.filter((example) => example.category === category)
}

export function searchExamples(query: string): CatalogExample[] {
  const q = query.toLowerCase()
  return examples.filter(
    (example) =>
      example.title.toLowerCase().includes(q) ||
      example.description.toLowerCase().includes(q) ||
      example.tags.some((tag) => tag.toLowerCase().includes(q)),
  )
}
