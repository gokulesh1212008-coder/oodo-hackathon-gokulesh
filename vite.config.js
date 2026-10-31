import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import os from 'node:os'

const cacheDir = path.resolve(os.tmpdir(), 'brightloop-vite-cache')

export default defineConfig({
  plugins: [react()],
  cacheDir,
  server: {
    host: true,
    port: 5173,
    fs: {
      strict: false
    },
    proxy: {
      '/api': 'http://127.0.0.1:8000'
    }
  }
})
