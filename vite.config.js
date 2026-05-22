import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'http://localhost:9100'

export default defineConfig({
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
    }
  },
  build: {
    outDir: 'dist',
  }
})
