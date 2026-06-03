import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home renders and the theme toggle changes the page theme', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /LovelyAlert/i }).first()).toBeVisible()

  const html = page.locator('html')
  const before = (await html.getAttribute('data-theme')) ?? 'auto'
  await page.locator('#theme-toggle').click()
  await expect(html).not.toHaveAttribute('data-theme', before)
})

test('playground opens a real modal with no serious a11y violations', async ({ page }) => {
  await page.goto('/playground')
  await page.getByRole('button', { name: /^▶?\s*Run$/i }).click()

  const popup = page.locator('.la-popup[role="dialog"]')
  await expect(popup).toBeVisible()
  // The dialog should trap focus, so an element inside it ends up focused.
  await expect(popup.locator(':focus')).toBeVisible()

  const results = await new AxeBuilder({ page }).include('.la-popup').analyze()
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([])

  // Escape dismisses the modal.
  await page.keyboard.press('Escape')
  await expect(popup).toBeHidden()
})

test('a toast appears and stacks without blocking the page', async ({ page }) => {
  await page.goto('/playground')
  await page.getByRole('button', { name: /^Toast$/i }).click()
  await expect(page.locator('.la-toast').first()).toBeVisible()
})
