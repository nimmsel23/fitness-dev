import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BACKEND   = 'http://localhost:9170'
const FED_DIR   = resolve(__dirname, '../federation')

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  return {
    plugins: [
      react(),
      ...(isFirebase ? [federation({
        name: 'journal',
        filename: 'remoteEntry.js',
        exposes: {
          './JournalApp': resolve(FED_DIR, 'JournalApp.jsx'),
        },
        shared: {
          react:          { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom':    { singleton: true, requiredVersion: '^18.0.0' },
          'lucide-react': { singleton: true },
        },
      })] : []),
    ],
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
      ...(isFirebase && {
        target:    'esnext',
        assetsDir: '',
      }),
    },
  }
})
