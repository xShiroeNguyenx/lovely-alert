import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'LovelyAlert',
      fileName: 'lovely-alert',
      formats: ['es', 'umd'],
    },
    sourcemap: true,
  },
  plugins: [dts({ include: ['src'], insertTypesEntry: true })],
  test: {
    environment: 'jsdom',
  },
})
