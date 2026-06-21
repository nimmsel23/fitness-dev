/**
 * learn-dev als Module Federation Remote
 *
 * Aus fitness-dev/ ausführen:
 *   npx vite build --config cloud_chamber/federation/learn.remote.vite.config.js
 *
 * Output: cloud_chamber/learn-dev/dist-federation/
 *
 * Dev (fitness-dev Backend läuft auf :9100):
 *   npx vite --config cloud_chamber/federation/learn.remote.vite.config.js
 *   → Remote Entry auf :9183
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FITNESS_ROOT = resolve(__dirname, '../..')
const LEARN_ROOT   = resolve(__dirname, '../learn-dev')

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  return {
    root: __dirname,
    resolve: {
      alias: {
        '@db':    resolve(FITNESS_ROOT, isFirebase ? 'src/db.firestore.js' : 'src/db.js'),
        '@utils': resolve(FITNESS_ROOT, 'src/lib/utils.js'),
        '@src':   resolve(FITNESS_ROOT, 'src'),
      },
    },
    plugins: [
      react(),
      federation({
        name: 'learn',
        filename: 'remoteEntry.js',
        exposes: {
          './LearnApp': resolve(__dirname, 'LearnApp.jsx'),
        },
        shared: {
          react:          { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom':    { singleton: true, requiredVersion: '^18.0.0' },
          'lucide-react': { singleton: true },
        },
      }),
    ],
    build: {
      outDir: resolve(LEARN_ROOT, 'dist-federation'),
      emptyOutDir: true,
      target: 'esnext',
      minify: false,
      assetsDir: '',
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        external: ['journal/JournalApp', 'fuel/FuelApp', 'learn/LearnApp'],
      },
    },
    server: {
      port: 9183,
      proxy: {
        '/exercises':  'http://127.0.0.1:9100',
        '/coverage':   'http://127.0.0.1:9100',
        '/fitness':    'http://127.0.0.1:9100',
        '/session':    'http://127.0.0.1:9100',
        '/health':     'http://127.0.0.1:9100',
      },
    },
  }
})
