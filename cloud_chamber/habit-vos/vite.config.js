import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FITNESS_ROOT = resolve(__dirname, '../..')
const BACKEND = 'http://localhost:9100'

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  return {
    root: FITNESS_ROOT,
    base: '/',
    plugins: [react()],

    resolve: {
      alias: {
        '@db':    resolve(FITNESS_ROOT, isFirebase ? 'src/db.firestore.js' : 'src/db.js'),
        '@utils': resolve(FITNESS_ROOT, 'src/lib/utils.js'),
        '@src':   resolve(FITNESS_ROOT, 'src'),
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
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
    },
  }
})
