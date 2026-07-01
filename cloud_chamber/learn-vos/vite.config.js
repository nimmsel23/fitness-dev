/**
 * learn-dev Standalone Vite Config
 *
 * root=FITNESS_ROOT damit relative Imports von Learn's shared components
 * (AnatomyDetailModal, PlanBuilder, etc.) korrekt auflösen.
 *
 * Aus learn-dev/ ausführen:
 *   npm run dev    → Dev-Server auf :9181, Proxy zu fitness-dev :9100
 *   npm run build  → Output: cloud_chamber/learn-dev/dist/
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const LEARN_DEV  = resolve('/home/alpha/learn-dev')
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
      '@utils': resolve(LEARN_DEV, 'src/lib/utils.js'),
    },
  },
  server: {
    port: 9181,
    proxy: {
      '/fitness':  BACKEND,
      '/exercise': BACKEND,
      '/session':  BACKEND,
      '/coverage': BACKEND,
      '/health':   BACKEND,
    },
  },
  build: {
    outDir: resolve(__dirname, isFirebase ? 'dist-firebase' : 'dist'),
    emptyOutDir: true,
  },
  }
})
