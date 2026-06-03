import react from '@astrojs/react'
import { defineConfig } from 'astro/config'

// `site`/`base` come from env so the CI Pages deploy can serve under a project
// subpath (https://<owner>.github.io/<repo>/) while local dev stays at "/".
const site = process.env.DOCS_SITE
const base = process.env.DOCS_BASE

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  ...(site ? { site } : {}),
  ...(base ? { base } : {}),
})
