import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'

const BACKEND = 'http://localhost:9100'

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  const isFederation = process.env.VITE_FEDERATION === 'true' || isFirebase

  return {
    define: {
      'import.meta.env.VITE_FEDERATION': JSON.stringify(isFederation ? 'true' : 'false'),
    },
    plugins: [
      react(),
      isFederation && federation({
        name: 'fitness_host',
        remotes: {
          journal: isFirebase
            ? 'https://journal-aos.web.app/assets/remoteEntry.js'
            : 'http://localhost:9171/dist-federation/assets/remoteEntry.js',
        },
        shared: {
          react:       { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
          'lucide-react': { singleton: true },
        },
      }),
    ].filter(Boolean),
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
        // Federation: lokale Auflösung für regulären Build (ohne Remote)
        'journal/JournalApp': resolve(__dirname, './cloud_chamber/federation/JournalApp.jsx'),
        'fuel/FuelApp':       resolve(__dirname, './cloud_chamber/federation/FuelApp.jsx'),
        'learn/LearnApp':     resolve(__dirname, './cloud_chamber/federation/LearnApp.jsx'),
        // fuel-dev Internals
        '@fuel': resolve('/home/alpha/fuel-dev/src/client'),
      },
      // Singleton-Dedup: fuel-dev hat eigene node_modules — Vite zwingt eine einzige Instanz
      dedupe: ['react', 'react-dom', '@tanstack/react-query'],
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
      target: isFederation ? 'esnext' : 'modules',
      rollupOptions: {
        output: {
          manualChunks: isFederation ? undefined : {
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
