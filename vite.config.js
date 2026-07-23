import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'
import { existsSync } from 'fs'

const BACKEND = 'http://localhost:9150'

// Sibling-Repos existieren unter zwei Namen, je nach Checkout-Kontext:
// ~/<name>-dev (Home-Root, dev-Branch-Arbeitskopie) oder
// ~/vitalos/<name>-app (vitalos-Submodule, master-Branch, "habit-app" ist Singular).
// Diese Datei ist in beiden Checkouts identisch (gleiches Repo) — ein hartcodierter
// Pfad kann nur in einem der beiden Kontexte stimmen. Deshalb zur Build-Zeit prüfen,
// welches Sibling tatsächlich existiert, statt es fest zu verdrahten.
function siblingDir(devName, appName) {
  const appPath = resolve(__dirname, '..', appName)
  return existsSync(appPath) ? appPath : resolve(__dirname, '..', devName)
}

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
        '@db':                 resolve(__dirname, isFirebase ? './src/lib/db/index.firestore.app.js' : './src/lib/db/index.js'),
        '@utils':              resolve(__dirname, './src/lib/utils.js'),
        '@aliase':             resolve(__dirname, './fitness/catalog/kb/aliases.yml'),
        '@fitness/components': resolve(__dirname, './src/components'),
        '@fitness/constants':  resolve(__dirname, './src/constants'),
        '@fitness':            resolve(__dirname, './src'),
        '@components':         resolve(__dirname, './src/components'),
        '@fuel':               resolve(siblingDir('fuel-dev', 'fuel-app'), 'src/client'),
        '@habits':             resolve(siblingDir('habits-dev', 'habit-app'), 'src'),
        '@journal':            resolve(siblingDir('journal-dev', 'journal-app'), 'src'),
        '@learn':              resolve(__dirname, '../learn-dev/src'),
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
