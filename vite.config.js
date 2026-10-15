import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
  for (const parent of ['..', '../..', '../../..']) {
    for (const name of [appName, devName]) {
      const candidate = resolve(__dirname, parent, name)
      if (existsSync(candidate)) return candidate
    }
  }
  return resolve(__dirname, '..', devName)
}

// SSOT für Cross-App-Aliase (@relax, @learn + interne Cross-DB-Exports)
// ist @vos/cross-app-aliases (~/vitalos/packages/cross-app-aliases) —
// nur erreichbar, wenn dieses Repo als vitalos-Submodule genestet ist (npm
// Workspace-Symlink). Standalone-Checkout (~/fitness-dev ohne vitalos-Parent)
// fällt auf die alte siblingDir()-Auflösung zurück.
async function resolveCrossAppAliases() {
  try {
    const { crossAppAliases } = await import('@vos/cross-app-aliases')
    return crossAppAliases()
  } catch {
    return {
      '@relax':      resolve(siblingDir('relax-dev', 'relax-app'), 'src'),
      '@learn':      resolve(siblingDir('learn-dev', 'learn-app'), 'src'),
    }
  }
}

// Solo-Build (mode 'training'): Views, die dort unerreichbar sind, durch einen leeren
// Platzhalter ersetzen, damit sie samt Abhängigkeiten nicht im Bundle landen. Bewusst
// ein Build-Plugin statt lazy()-Imports: so bleibt die normale App unverändert.
const SOLO_STUBS = [
  { importer: /[\\/]src[\\/]App\.jsx$/, source: /^(\.\/views\/(WeeklyReview|Touren|Exercises|Settings|Anamnese|Fokus|Inbox)\/|@learn\/views\/Learn\/)/ },
  { importer: /[\\/]views[\\/]Session[\\/]index\.jsx$/, source: /^\.\.\/Plan\/index\.jsx$/ },
  // ~1,8 MB wger/yuhonas-Rohimport; yuhonas liefert dort der Geräte-Mirror
  { importer: /[\\/]lib[\\/]db[\\/]firestore[\\/]kb\.js$/, source: /^\.\/exerciseBulkData\.generated\.js$/, target: 'src/solo-bulk-stub.js' },
]
function soloStubPlugin() {
  const defaultStub = resolve(__dirname, 'src/solo-stub.jsx')
  return {
    name: 'solo-stub-views',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer) return null
      const hit = SOLO_STUBS.find((r) => r.importer.test(importer) && r.source.test(source))
      return hit ? (hit.target ? resolve(__dirname, hit.target) : defaultStub) : null
    },
  }
}

export default defineConfig(async ({ mode }) => {
  const isFirebase = mode === 'firebase' || mode === 'coach' || mode === 'training'
  const isCoach = mode === 'coach'
  const isTraining = mode === 'training'
  const crossAppAliases = await resolveCrossAppAliases()
  delete crossAppAliases['@fuel']

  return {
    // Relativ statt absolut — sonst lösen Assets unter einem Funnel-Pfad-
    // Präfix (z.B. /fitness-dev/) fälschlich zur Domain-Wurzel auf (404 →
    // Whitescreen). Core4/Door/Game/Fuel haben denselben Fix schon.
    base: './',
    plugins: [react(), ...(isTraining ? [soloStubPlugin()] : [])],
    resolve: {
      preserveSymlinks: true,
      alias: {
        ...crossAppAliases,

        '@src':                resolve(__dirname, './src'),
        '@db':                 resolve(__dirname, isFirebase ? './src/lib/db/index.firestore.app.js' : './src/lib/db/index.js'),
        '@tours-strava':       resolve(__dirname, isFirebase ? './src/lib/tours/adapters/live/strava.firestore.js' : './src/lib/tours/adapters/live/strava.js'),
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
      // Singleton-Dedup: sibling apps bringen eigene node_modules mit — Vite
      // muss React/Firebase trotzdem als Einzelinstanz auflösen.
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
          // Python-/Build-/Nested-App-Bäume — kein Frontend-Code, aber viele
          // Dateien (u.a. .venv: 3300+, katalog-ui: 145M node_modules) die
          // chokidar sonst mitüberwacht und den Vite-Dev-Server irgendwann
          // (OOM/EMFILE) abschmieren lassen (beobachtet 2026-09-02).
          '**/.venv/**',
          '**/.worktrees/**',
          '**/__pycache__/**',
          '**/.pytest_cache/**',
          '**/catalog-ui/**',
          '**/functions/**',
          '**/fitness_agent.egg-info/**',
          '**/.git/**',
        ],
      },
      proxy: {
        '/tours/strava': `http://127.0.0.1:${process.env.FITNESS_NODE_PORT || 9100}`,
        '/sixpack': `http://127.0.0.1:${process.env.FITNESS_NODE_PORT || 9100}`,
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
        '/workouts':  BACKEND,
        '/routines':  BACKEND,
      },
    },
    build: {
      outDir: isCoach ? 'dist-coach' : isTraining ? 'dist-training' : 'dist',
      target: 'modules',
      rollupOptions: {
        input: isCoach ? resolve(__dirname, 'coach.html') : undefined,
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
