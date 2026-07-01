import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const HABITS_DEV = resolve('/home/alpha/habits-dev')
const BACKEND    = 'http://localhost:9100'

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  return {
    root: __dirname,
    base: '/',
    publicDir: resolve(__dirname, 'public'),
    plugins: [react()],

    resolve: {
      preserveSymlinks: true,
      alias: {
        '@db':    resolve(__dirname, 'src/db.firestore.js'),
        '@utils': resolve(HABITS_DEV, 'src/lib/core.js'),
      },
    },
    server: {
      port: 9182,
      proxy: {
        '/journal':   BACKEND,
        '/habitsync': BACKEND,
        '/health':    BACKEND,
      },
    },
    build: {
      outDir: resolve(__dirname, isFirebase ? 'dist-firebase' : 'dist'),
      emptyOutDir: true,
    },
  }
})
