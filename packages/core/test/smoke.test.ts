import { expect, test } from 'vitest'
import { VERSION } from '../src/index'

test('package exposes a VERSION string', () => {
  expect(typeof VERSION).toBe('string')
  expect(VERSION.length).toBeGreaterThan(0)
})
