#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
/**
 * Post-build hardening gate for the published core bundle:
 *  1. Bundle-size budget — fail if the gzipped ESM/UMD grows past the ceiling.
 *  2. UMD smoke — require the CJS/UMD build in Node and assert the public API
 *     is wired up (catches a broken build before it ships to npm/CDN).
 *
 * Run AFTER `pnpm --filter lovely-alert build`. Exits non-zero on any failure.
 */
import { gzipSync } from 'node:zlib'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'packages', 'core', 'dist')
const esm = join(distDir, 'lovely-alert.js')
const umd = join(distDir, 'lovely-alert.umd.cjs')

// Gzipped-size ceilings (bytes). Generous headroom over the current ~14.5 kB ESM;
// tighten over time. Bumping these should be a deliberate, reviewed change.
const BUDGET = {
  [esm]: 22 * 1024,
  [umd]: 20 * 1024,
}

const kb = (n) => `${(n / 1024).toFixed(2)} kB`
let failed = false

for (const file of [esm, umd]) {
  if (!existsSync(file)) {
    console.error(`✗ missing ${file} — run \`pnpm --filter lovely-alert build\` first`)
    failed = true
    continue
  }
  const size = gzipSync(readFileSync(file)).length
  const budget = BUDGET[file]
  const ok = size <= budget
  console.log(
    `${ok ? '✓' : '✗'} ${file.split(/[\\/]/).pop()} gzip ${kb(size)} (budget ${kb(budget)})`,
  )
  if (!ok) failed = true
}

// UMD smoke: the .umd.cjs is CommonJS, so Node can require it directly (no DOM
// needed — style injection is guarded behind hasDOM()).
if (existsSync(umd)) {
  try {
    const require = createRequire(import.meta.url)
    const mod = require(umd)
    const la = mod?.la ?? mod?.default?.la
    if (typeof la?.success !== 'function' || typeof la?.open !== 'function') {
      console.error('✗ UMD smoke: la.success / la.open not callable on the UMD export')
      failed = true
    } else if (typeof mod.VERSION !== 'string') {
      console.error('✗ UMD smoke: VERSION export missing')
      failed = true
    } else {
      console.log(`✓ UMD smoke: la API present, VERSION ${mod.VERSION}`)
    }
  } catch (error) {
    console.error(`✗ UMD smoke threw: ${error?.message ?? error}`)
    failed = true
  }
}

if (failed) {
  console.error('\ndist check FAILED')
  process.exit(1)
}
console.log('\ndist check passed')
