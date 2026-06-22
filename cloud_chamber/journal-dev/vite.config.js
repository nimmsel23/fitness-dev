import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BACKEND   = 'http://localhost:9170'

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@db':    resolve(__dirname, isFirebase ? 'src/db.firestore.js' : 'src/db.js'),
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
      outDir:      isFirebase ? 'dist-firebase' : 'dist',
      emptyOutDir: true,
    },
  }
})
