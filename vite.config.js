import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const BACKEND = 'http://localhost:9100'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@src': resolve(__dirname, './src'),
      '@db': resolve(__dirname, './src/db.js'),
      '@utils': resolve(__dirname, './src/lib/utils.js'),
      '@aliase': resolve(__dirname, './catalog/kb/maps/aliases.yml'),
    },
  },
  server: {
    port: 5902,
    proxy: {
      '/exercises': BACKEND,
      '/session':   BACKEND,
      '/journal':   BACKEND,
      '/coverage':  BACKEND,
      '/plan':      BACKEND,
      '/blocks':    BACKEND,
      '/theme':     BACKEND,
      '/health':    BACKEND,
      '/export':    BACKEND,
      '/fitness':   BACKEND,
      '/firestore': BACKEND,
      '/habitsync': BACKEND,
    }
  },
  build: {
    outDir: 'dist',
  }
})
