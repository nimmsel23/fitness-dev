/**
 * fitness als Module Federation Remote
 *
 * Aus fitness-dev/ ausführen:
 *   npx vite build --config cloud_chamber/federation/fitness.remote.vite.config.js
 *
 * Output: cloud_chamber/fitness-dev/dist-federation/
 *
 * Dev (fitness-dev Backend muss auf :9100 laufen):
 *   npx vite --config cloud_chamber/federation/fitness.remote.vite.config.js
 *   → Remote Entry auf :9185
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import tailwindcss from 'tailwindcss'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FITNESS_ROOT  = resolve(__dirname, '../..')
const FITNESS_DIST  = resolve(__dirname, '../fitness-dev/dist-federation')

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  return {
    root: __dirname,
    resolve: {
      alias: {
        '@src':   resolve(FITNESS_ROOT, 'src'),
        '@db':    resolve(FITNESS_ROOT, isFirebase ? 'src/db.firestore.js' : 'src/db.js'),
        '@utils': resolve(FITNESS_ROOT, 'src/lib/utils.js'),
      },
    },
    plugins: [
      react(),
      federation({
        name: 'fitness',
        filename: 'remoteEntry.js',
        exposes: {
          './FitnessApp': resolve(__dirname, 'FitnessApp.jsx'),
        },
        shared: {
          react:          { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom':    { singleton: true, requiredVersion: '^18.0.0' },
          'lucide-react': { singleton: true },
        },
      }),
    ],
    css: {
      postcss: {
        plugins: [tailwindcss({ config: resolve(FITNESS_ROOT, 'tailwind.config.cjs') })],
      },
    },
    build: {
      outDir: FITNESS_DIST,
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
      port: 9185,
      proxy: {
        '/fitness':  'http://127.0.0.1:9100',
        '/exercise': 'http://127.0.0.1:9100',
        '/session':  'http://127.0.0.1:9100',
        '/coverage': 'http://127.0.0.1:9100',
        '/health':   'http://127.0.0.1:9100',
      },
    },
  }
})
