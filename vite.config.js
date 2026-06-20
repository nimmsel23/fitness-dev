import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const BACKEND = 'http://localhost:9100'

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  return {
    plugins: [react()],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@src':    resolve(__dirname, './src'),
        '@db':     resolve(__dirname, isFirebase ? './src/db.firestore.js' : './src/db.js'),
        '@utils':  resolve(__dirname, './src/lib/utils.js'),
        '@aliase': resolve(__dirname, './catalog/kb/aliases.yml'),
        // Explizite Auflösung für symlinkte Views → cloud_chamber
        './views/Journal': resolve(__dirname, './cloud_chamber/journal-dev/src/views/Journal'),
        './views/Habits':  resolve(__dirname, './cloud_chamber/journal-dev/src/views/Habits'),
      },
    },
    server: {
      port: 5902,
      proxy: {
        '/exercises': BACKEND,
        '/session':   BACKEND,
        '/journal':   BACKEND,
        '/coverage':  BACKEND,
        '/plan':      BACKEND,
        '/blocks':    BACKEND,
        '/theme':     BACKEND,
        '/health':    BACKEND,
        '/export':    BACKEND,
        '/fitness':   BACKEND,
        '/firestore': BACKEND,
        '/habitsync': BACKEND,
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            charts: ['recharts'],
            icons: ['lucide-react'],
            bodymap: ['react-body-highlighter'],
          },
        },
      },
    },
  }
})
