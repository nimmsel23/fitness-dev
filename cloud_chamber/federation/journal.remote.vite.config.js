/**
 * journal-dev als Module Federation Remote
 *
 * Aus journal-dev/ ausführen:
 *   npx vite build --config ~/fitness-dev/cloud_chamber/federation/journal.remote.vite.config.js
 *
 * Output: cloud_chamber/journal-dev/dist-federation/
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const JOURNAL_ROOT = resolve(__dirname, '../journal-dev')

export default defineConfig({
  root: JOURNAL_ROOT,
  resolve: {
    alias: {
      '@db':    resolve(JOURNAL_ROOT, 'src/db.js'),
      '@utils': resolve(JOURNAL_ROOT, 'src/utils.js'),
    },
  },
  plugins: [
    react(),
    federation({
      name: 'journal',
      filename: 'remoteEntry.js',
      exposes: {
        './JournalApp': resolve(JOURNAL_ROOT, 'src/App.jsx'),
      },
      shared: {
        react:     { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
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
})
