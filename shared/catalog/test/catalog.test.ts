import { describe, expect, test } from 'vitest'
import { categories, examples } from '../src/index'

describe('catalog integrity', () => {
  test('ids are unique', () => {
    const ids = examples.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('every example has the required fields and a known category', () => {
    for (const example of examples) {
      expect(example.title.length).toBeGreaterThan(0)
      expect(example.description.length).toBeGreaterThan(0)
      expect(example.code.length).toBeGreaterThan(0)
      expect(example.tags.length).toBeGreaterThan(0)
      expect(categories).toContain(example.category)
    }
  })

  test('every example code snippet is syntactically valid', () => {
    for (const example of examples) {
      // Parse as an async function body (so top-level await is allowed). Do not run it.
      expect(() => new Function('la', `return async function(){ ${example.code} }`)).not.toThrow()
    }
  })
})
