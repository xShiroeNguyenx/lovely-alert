import { type Theme, la } from '../src/index'

const on = (id: string, handler: () => void): void => {
  document.getElementById(id)?.addEventListener('click', handler)
}

on('btn-success', () => {
  void la.success('Saved!', 'Your changes were saved successfully.')
})

on('btn-error', () => {
  void la.error('Oops…', 'Something went wrong. Please try again.')
})

on('btn-warning', () => {
  void la.warning('Heads up', 'This action needs your attention.')
})

on('btn-info', () => {
  void la.info('Did you know?', 'LovelyAlert ships with light, dark and auto themes.')
})

on('btn-question', () => {
  void la.question('Are you sure?', 'This is the question icon.')
})

on('btn-draggable', () => {
  void la
    .build()
    .title('Drag me by my title')
    .icon('info')
    .text('Press on the title and move the popup around.')
    .draggable()
    .confirmButton('Nice')
    .show()
})

on('btn-fullscreen', () => {
  void la
    .build()
    .title('Fullscreen mode')
    .icon('success')
    .text('grow: "fullscreen" makes the popup fill the viewport.')
    .set('grow', 'fullscreen')
    .closeButton()
    .confirmButton('Close')
    .show()
})

on('btn-confirm', async () => {
  const ok = await la.confirm('Delete this item?', { confirmText: 'Delete', danger: true })
  if (ok) void la.success('Deleted', 'The item has been removed.')
})

on('btn-prompt', async () => {
  const name = await la.prompt('What is your name?', {
    input: 'text',
    placeholder: 'e.g. Jane',
    validate: (value) => (value ? null : 'Please enter your name'),
  })
  if (name !== null) void la.success(`Hello, ${name}!`)
})

on('btn-builder', () => {
  void la
    .build()
    .title('Subscribe to the newsletter')
    .icon('question')
    .input('email', { placeholder: 'you@example.com' })
    .confirmButton('Subscribe')
    .cancelButton()
    .closeButton()
    .show()
})

const cycle: Theme[] = ['auto', 'light', 'dark']
let themeIndex = 0
on('btn-theme', () => {
  themeIndex = (themeIndex + 1) % cycle.length
  const theme = cycle[themeIndex] as Theme
  la.theme.set(theme)
  const label = document.getElementById('theme-label')
  if (label) label.textContent = String(theme)
  // Reflect on the next alert too; show a quick toast-like info.
  void la.info('Theme changed', `Now using the "${String(theme)}" theme.`)
})
