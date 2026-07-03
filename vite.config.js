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
        '@src':                resolve(__dirname, './src'),
        '@db':                 resolve(__dirname, isFirebase ? './src/db.firestore.js' : './src/db.js'),
        '@utils':              resolve(__dirname, './src/lib/utils.js'),
        '@aliase':             resolve(__dirname, './catalog/kb/aliases.yml'),
        '@fitness/components': resolve(__dirname, './src/components'),
        '@fitness/constants':  resolve(__dirname, './src/constants'),
        '@fitness':            resolve(__dirname, './src'),
        '@components':         resolve(__dirname, './src/components'),
        '@fuel':               resolve('/home/alpha/fuel-dev/src/client'),
        '@habits':             resolve('/home/alpha/habits-dev/src'),
        '@journal':            resolve('/home/alpha/journal-dev/src'),
        '@learn':              resolve('/home/alpha/learn-dev/src'),
      },
      // Singleton-Dedup: fuel-dev hat eigene node_modules — Vite zwingt eine einzige Instanz
      dedupe: ['react', 'react-dom', '@tanstack/react-query'],
    },
    server: {
      port: 5902,
      watch: {
        ignored: [
          '**/dist/**',
          '**/dist-*/**',
          '**/.firebase/**',
          '**/node_modules/**',
          '**/cloud_chamber/vitalos/**',
          '**/cloud_chamber/fitness-dev/**',
        ],
      },
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
