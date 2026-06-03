import { defineConfig, devices } from '@playwright/test'

/**
 * E2E + a11y (axe) smoke for the docs site / live library.
 * Browsers are NOT bundled — CI installs them (`playwright install chromium`).
 * Locally: `pnpm e2e` (reuses a running docs dev server if one is up).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // `astro preview` serves the static build, so build the docs before `pnpm e2e` in CI.
    command: 'pnpm --filter @lovely-alert/docs preview --port 4321 --host',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
