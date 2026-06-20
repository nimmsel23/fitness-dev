/**
 * journal-dev als Module Federation Remote
 *
 * Aus fitness-dev/ ausführen:
 *   npx vite build --config cloud_chamber/federation/journal.remote.vite.config.js
 *
 * Output: cloud_chamber/journal-dev/dist-federation/
 *
 * Dev (standalone journal-dev läuft auf :9170):
 *   npx vite --config cloud_chamber/federation/journal.remote.vite.config.js
 *   → Remote Entry auf :9173
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FITNESS_ROOT  = resolve(__dirname, '../..')
const JOURNAL_ROOT  = resolve(__dirname, '../journal-dev')

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  return {
    root: FITNESS_ROOT,
    resolve: {
      alias: {
        '@db':    resolve(JOURNAL_ROOT, isFirebase ? 'src/db.firestore.js' : 'src/db.js'),
        '@utils': resolve(FITNESS_ROOT, 'src/lib/utils.js'),
      },
    },
    plugins: [
      react(),
      federation({
        name: 'journal',
        filename: 'remoteEntry.js',
        exposes: {
          './JournalApp': resolve(__dirname, 'JournalApp.jsx'),
        },
        shared: {
          react:          { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom':    { singleton: true, requiredVersion: '^18.0.0' },
          'lucide-react': { singleton: true },
        },
      }),
    ],
    build: {
      outDir: resolve(JOURNAL_ROOT, 'dist-federation'),
      emptyOutDir: true,
      target: 'esnext',
      minify: false,
    },
    server: {
      port: 9173,
      proxy: {
        '/journal':   'http://127.0.0.1:9170',
        '/habitsync': 'http://127.0.0.1:9170',
        '/health':    'http://127.0.0.1:9170',
      },
    },
  }
})
