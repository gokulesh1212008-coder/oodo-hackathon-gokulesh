import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import os from 'node:os'

export default defineConfig({
  plugins: [react()],
  cacheDir: path.resolve(os.tmpdir(), 'brightloop-vite-cache'),
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8000'
    }
  }
})
