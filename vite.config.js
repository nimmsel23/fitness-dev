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

// SSOT für Cross-App-Aliase (@habits, @journal, @fuel, @relax, @learn + deren
// -db-Varianten) ist @vos/cross-app-aliases (~/vitalos/packages/cross-app-aliases) —
// nur erreichbar, wenn dieses Repo als vitalos-Submodule genestet ist (npm
// Workspace-Symlink). Standalone-Checkout (~/fitness-dev ohne vitalos-Parent)
// fällt auf die alte siblingDir()-Auflösung zurück.
async function resolveCrossAppAliases() {
  try {
    const { crossAppAliases } = await import('@vos/cross-app-aliases')
    return crossAppAliases()
  } catch {
    return {
      '@fuel':       resolve(siblingDir('fuel-dev', 'fuel-app'), 'src/client'),
      '@habits':     resolve(siblingDir('habits-dev', 'habit-app'), 'src'),
      '@habits-db':  resolve(siblingDir('habits-dev', 'habit-app'), 'src/db'),
      '@journal':    resolve(siblingDir('journal-dev', 'journal-app'), 'src'),
      '@journal-db': resolve(siblingDir('journal-dev', 'journal-app'), 'src/db/index.js'),
      '@relax':      resolve(siblingDir('relax-dev', 'relax-app'), 'src'),
      '@learn':      resolve(__dirname, '../learn-dev/src'),
    }
  }
}

export default defineConfig(async ({ mode }) => {
  const isFirebase = mode === 'firebase'
  const isFederation = process.env.VITE_FEDERATION === 'true' || isFirebase
  const crossAppAliases = await resolveCrossAppAliases()

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
        ...crossAppAliases,

        '@src':                resolve(__dirname, './src'),
        '@db':                 resolve(__dirname, isFirebase ? './src/lib/db/index.firestore.app.js' : './src/lib/db/index.js'),
        '@fitness-db':         resolve(__dirname, './src/lib/db'),
        '@utils':              resolve(__dirname, './src/lib/utils.js'),
        '@cloud/firebase.js':  resolve(__dirname, './src/firebase.js'),
        '@firebase-config':    resolve(__dirname, './firebase.config.js'),
        '@aliase':             resolve(__dirname, './fitness/catalog/kb/aliases.yml'),
        '@fitness/components': resolve(__dirname, './src/components'),
        '@fitness/constants':  resolve(__dirname, './src/constants'),
        '@fitness':            resolve(__dirname, './src'),
        '@components':         resolve(__dirname, './src/components'),
      },
      // Singleton-Dedup: fuel-dev hat eigene node_modules — Vite zwingt eine einzige Instanz.
      // firebase: habit-app pinnt intern ^12.15.0 (eigene node_modules), Rest des
      // Workspace inkl. fitness-app selbst ^11.10.0 — ohne dedupe landen zwei
      // Firebase-App-Instanzen im selben Bundle (@habits wird per Alias direkt
      // eingebunden), getAuth() greift dann auf eine Instanz, in der
      // initializeApp() nie lief -> "Component auth has not been registered yet"
      // (Whitescreen auf fitness-aos.web.app).
      dedupe: ['react', 'react-dom', '@tanstack/react-query', 'firebase', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
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
