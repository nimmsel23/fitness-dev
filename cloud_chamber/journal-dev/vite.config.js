import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const BACKEND = 'http://localhost:9170'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@db':    resolve(__dirname, 'src/db.js'),
      '@utils': resolve(__dirname, 'src/utils.js'),
    },
  },
  server: {
    port: 9171,
    proxy: {
      '/journal':   BACKEND,
      '/habitsync': BACKEND,
      '/health':    BACKEND,
    },
  },
  build: {
    outDir: 'dist',
  },
})
