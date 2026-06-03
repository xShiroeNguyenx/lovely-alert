import { CLASS } from '../constants'
import type { InputConfig } from '../types'
import { h } from '../utils/dom'

/** A rendered input: the node to mount, the element to focus, and a value reader. */
export interface InputDescriptor {
  node: HTMLElement
  focusEl: HTMLElement
  read: () => unknown
}

let uid = 0
const TEXT_LIKE: ReadonlySet<string> = new Set([
  'text',
  'email',
  'password',
  'search',
  'url',
  'tel',
  'textarea',
])

function optionEntries(options: InputConfig['options']): Array<[string, string]> {
  if (!options) return []
  return Array.isArray(options) ? options : Object.entries(options)
}

function maybeTrim(value: string, cfg: InputConfig): string {
  return cfg.autoTrim !== false && TEXT_LIKE.has(cfg.type) ? value.trim() : value
}

function applyAttributes(el: HTMLElement, cfg: InputConfig): void {
  if (!cfg.attributes) return
  for (const [key, value] of Object.entries(cfg.attributes)) el.setAttribute(key, value)
}

/** Build an input for any of the 18 supported types. */
export function createInput(cfg: InputConfig): InputDescriptor {
  switch (cfg.type) {
    case 'textarea': {
      const el = h('textarea', CLASS.input)
      if (cfg.placeholder) el.placeholder = cfg.placeholder
      if (cfg.value !== undefined) el.value = String(cfg.value)
      applyAttributes(el, cfg)
      return { node: el, focusEl: el, read: () => maybeTrim(el.value, cfg) }
    }

    case 'select': {
      const el = h('select', CLASS.input)
      for (const [value, label] of optionEntries(cfg.options)) {
        const option = h('option')
        option.value = value
        option.textContent = label
        el.appendChild(option)
      }
      if (cfg.value !== undefined) el.value = String(cfg.value)
      applyAttributes(el, cfg)
      return { node: el, focusEl: el, read: () => el.value }
    }

    case 'radio': {
      const group = h('div', CLASS.radioGroup, { role: 'radiogroup' })
      const name = `la-radio-${++uid}`
      let first: HTMLInputElement | undefined
      for (const [value, label] of optionEntries(cfg.options)) {
        const row = h('label', CLASS.radio)
        const input = h('input')
        input.type = 'radio'
        input.name = name
        input.value = value
        if (cfg.value !== undefined && String(cfg.value) === value) input.checked = true
        if (!first) first = input
        const text = h('span')
        text.textContent = label
        row.append(input, text)
        group.appendChild(row)
      }
      return {
        node: group,
        focusEl: first ?? group,
        read: () => group.querySelector<HTMLInputElement>('input:checked')?.value,
      }
    }

    case 'checkbox': {
      const row = h('label', CLASS.checkbox)
      const input = h('input')
      input.type = 'checkbox'
      if (cfg.value === true || cfg.value === 'true') input.checked = true
      applyAttributes(input, cfg)
      const text = h('span')
      text.textContent = cfg.placeholder ?? cfg.label ?? ''
      row.append(input, text)
      return { node: row, focusEl: input, read: () => input.checked }
    }

    case 'otp': {
      const length = Number(cfg.attributes?.length ?? 6) || 6
      const wrap = h('div', CLASS.otp)
      const boxes: HTMLInputElement[] = []
      for (let i = 0; i < length; i++) {
        const box = h('input', CLASS.otpBox)
        box.type = 'text'
        box.maxLength = 1
        box.inputMode = 'numeric'
        box.addEventListener('input', () => {
          const next = box.nextElementSibling
          if (box.value && next instanceof HTMLElement) next.focus()
        })
        box.addEventListener('keydown', (event) => {
          const prev = box.previousElementSibling
          if (event.key === 'Backspace' && !box.value && prev instanceof HTMLElement) prev.focus()
        })
        wrap.appendChild(box)
        boxes.push(box)
      }
      return {
        node: wrap,
        focusEl: boxes[0] ?? wrap,
        read: () => boxes.map((b) => b.value).join(''),
      }
    }

    case 'rating': {
      const max = Number(cfg.attributes?.max ?? 5) || 5
      const wrap = h('div', CLASS.rating, { role: 'radiogroup' })
      const stars: HTMLButtonElement[] = []
      let value = Number(cfg.value ?? 0)
      const paint = (): void => {
        stars.forEach((star, index) => star.classList.toggle(CLASS.starOn, index < value))
      }
      for (let i = 0; i < max; i++) {
        const star = h('button', CLASS.star, { type: 'button', 'aria-label': `${i + 1}` })
        star.textContent = '★'
        star.addEventListener('click', () => {
          value = i + 1
          paint()
        })
        wrap.appendChild(star)
        stars.push(star)
      }
      paint()
      return { node: wrap, focusEl: stars[0] ?? wrap, read: () => value }
    }

    case 'tags': {
      const wrap = h('div', CLASS.tags)
      const tags: string[] =
        typeof cfg.value === 'string' && cfg.value
          ? cfg.value
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : []
      const field = h('input', CLASS.input)
      field.type = 'text'
      if (cfg.placeholder) field.placeholder = cfg.placeholder
      const repaint = (): void => {
        for (const chip of Array.from(wrap.querySelectorAll(`.${CLASS.tag}`))) chip.remove()
        tags.forEach((label, index) => {
          const chip = h('span', CLASS.tag)
          chip.textContent = label
          const remove = h('button', undefined, { type: 'button', 'aria-label': 'remove' })
          remove.textContent = '×'
          remove.addEventListener('click', () => {
            tags.splice(index, 1)
            repaint()
          })
          chip.appendChild(remove)
          wrap.insertBefore(chip, field)
        })
      }
      field.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return
        event.preventDefault()
        event.stopPropagation()
        const value = field.value.trim()
        if (value) {
          tags.push(value)
          field.value = ''
          repaint()
        }
      })
      wrap.appendChild(field)
      repaint()
      return { node: wrap, focusEl: field, read: () => [...tags] }
    }

    default: {
      // Generic <input type="…"> for text/email/number/date/range/file/color/etc.
      const el = h('input', CLASS.input)
      el.type = cfg.type
      if (cfg.placeholder) el.placeholder = cfg.placeholder
      if (cfg.value !== undefined) el.value = String(cfg.value)
      applyAttributes(el, cfg)
      return {
        node: el,
        focusEl: el,
        read: () => (el.type === 'checkbox' ? el.checked : maybeTrim(el.value, cfg)),
      }
    }
  }
}
