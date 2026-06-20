import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FITNESS_ROOT = resolve(__dirname, '../..')
const VITALOS_SRC  = resolve(__dirname, 'src')
const BACKEND = 'http://localhost:9100'

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  return {
    root: FITNESS_ROOT,
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@src':   VITALOS_SRC,
        '@db':    resolve(VITALOS_SRC, isFirebase ? 'db.firestore.js' : 'db.js'),
        '@utils': resolve(VITALOS_SRC, 'lib/utils.js'),
        'journal/JournalApp': resolve(FITNESS_ROOT, 'cloud_chamber/federation/JournalApp.jsx'),
        'fuel/FuelApp':       resolve(FITNESS_ROOT, 'cloud_chamber/federation/FuelApp.jsx'),
        'learn/LearnApp':     resolve(FITNESS_ROOT, 'cloud_chamber/federation/LearnApp.jsx'),
        '@fuel': resolve('/home/alpha/fuel-dev/src/client'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      port: 9190,
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
    build: {
      outDir: resolve(__dirname, isFirebase ? 'dist-firebase' : 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: {
          manualChunks: {
            react:   ['react', 'react-dom'],
            charts:  ['recharts'],
            icons:   ['lucide-react'],
            bodymap: ['react-body-highlighter'],
          },
        },
      },
    },
  }
})
