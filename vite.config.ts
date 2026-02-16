import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project under /<repo>/
  // For local dev, Vite ignores this base when using the dev server.
  base: '/metadyne/',
  plugins: [react()],
})
