import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Development config without Cloudflare plugin to avoid worker runtime issues in Docker
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
