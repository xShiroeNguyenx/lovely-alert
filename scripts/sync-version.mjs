#!/usr/bin/env node
/**
 * Sync the hardcoded `VERSION` export with the core package.json version.
 * Wired into the `version` script so it runs right after `changeset version`,
 * keeping the value the bundle reports (and `la.VERSION`) correct at release time.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = join(root, 'packages', 'core', 'package.json')
const versionFile = join(root, 'packages', 'core', 'src', 'version.ts')

const { version } = JSON.parse(readFileSync(pkgPath, 'utf8'))
const contents = `/** Library version. Auto-synced from package.json by scripts/sync-version.mjs (runs on \`pnpm version\`). */
export const VERSION = '${version}'
`

const current = readFileSync(versionFile, 'utf8')
if (current === contents) {
  console.log(`version.ts already at ${version}`)
} else {
  writeFileSync(versionFile, contents)
  console.log(`version.ts → ${version}`)
}
