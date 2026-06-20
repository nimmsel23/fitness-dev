/**
 * fitness-dev als Module Federation Host
 *
 * Aus fitness-dev/ ausführen:
 *   npx vite build --config cloud_chamber/federation/fitness.host.vite.config.js
 *
 * Dev-Server (fuel-dev muss auf :9000 laufen + dist-federation gebaut sein):
 *   npx vite --config cloud_chamber/federation/fitness.host.vite.config.js
 *
 * Output: fitness-dev/dist-federation/  (berührt dist/ nicht)
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FITNESS_ROOT = resolve(__dirname, '../..')
const BACKEND = 'http://localhost:9100'

export default defineConfig({
  root: FITNESS_ROOT,
  resolve: {
    alias: {
      '@src':    resolve(FITNESS_ROOT, 'src'),
      '@db':     resolve(FITNESS_ROOT, 'src/db.js'),
      '@utils':  resolve(FITNESS_ROOT, 'src/lib/utils.js'),
      '@aliase': resolve(FITNESS_ROOT, 'catalog/kb/maps/aliases.yml'),
    },
  },
  plugins: [
    react(),
    federation({
      name: 'fitness_host',
      remotes: {
        // dev:  fuel-dev muss gebaut + auf :9000 serviert werden
        // prod: durch Firebase Hosting URL ersetzen
        fuel: 'http://localhost:9000/dist-federation/assets/remoteEntry.js',
      },
      shared: {
        react:       { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        'lucide-react': { singleton: true },
      },
    }),
  ],
  build: {
    outDir: resolve(FITNESS_ROOT, 'dist-federation'),
    emptyOutDir: true,
    target: 'esnext',
    minify: false,
    rollupOptions: {
      input: resolve(FITNESS_ROOT, 'index.html'),
    },
  },
  server: {
    port: 5903,
    proxy: {
      '/exercises': BACKEND,
      '/session':   BACKEND,
      '/journal':   BACKEND,
      '/coverage':  BACKEND,
      '/plan':      BACKEND,
      '/blocks':    BACKEND,
      '/theme':     BACKEND,
      '/health':    BACKEND,
      '/fitness':   BACKEND,
      '/firestore': BACKEND,
      '/habitsync': BACKEND,
    },
  },
})
