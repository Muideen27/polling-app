import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setupTests.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['**/*.d.ts', '**/node_modules/**'],
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
