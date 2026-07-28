/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tests cover the pure board logic, so the default node environment is enough —
  // the storage tests stub `localStorage` themselves.
  test: {
    include: ['src/**/*.test.ts'],
  },
})
