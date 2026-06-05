import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const BACKEND = 'http://localhost:9100'

export default defineConfig({
  define: {
    __IS_COACH__: 'true',
  },
  plugins: [react()],
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
