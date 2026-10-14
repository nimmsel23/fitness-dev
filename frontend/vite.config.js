import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { existsSync } from 'fs'

// ── Backend-Ziele ────────────────────────────────────────────────────────────
// Neues Python-Backend (backend/, FastAPI): alle /api/*-Routen.
const BACKEND = process.env.FITNESS_BACKEND || 'http://127.0.0.1:9150'
// Alte Routen (/session, /fitness/..., /routines, ...) haben im neuen Backend noch
// KEIN Pendant (siehe docs/BACKEND-GAPS.md). Standard: dasselbe Backend (liefert 404 →
// klarer Fehler statt stiller Fehlfunktion). Wer das alte fitness-api weiter laufen lässt,
// setzt FITNESS_LEGACY_BACKEND=http://127.0.0.1:<port>.
const LEGACY = process.env.FITNESS_LEGACY_BACKEND || BACKEND
// Node-only-Features (Strava-Touren, 6pack-Fotos) laufen weiter über server.mjs.
const NODE = `http://127.0.0.1:${process.env.FITNESS_NODE_PORT || 9100}`

// KB (Quelle der Wahrheit bleibt das Original-Repo; hier nur gelesen).
const KB_DIR = resolve(process.env.FITNESS_KB_DIR || resolve(__dirname, '../fitness/catalog/kb'))

// Sibling-Repos (relax/learn) existieren unter zwei Namen, je nach Checkout-Kontext:
// ~/<name>-dev oder ~/vitalos/<name>-app. Zur Build-Zeit prüfen, welches existiert.
// Suchtiefe um eine Ebene erweitert: frontend/ liegt eine Ebene tiefer als das Original-Root.
function siblingDir(devName, appName) {
  for (const parent of ['..', '../..', '../../..', '../../../..']) {
    for (const name of [appName, devName]) {
      const candidate = resolve(__dirname, parent, name)
      if (existsSync(resolve(candidate, 'src'))) return candidate
    }
  }
  return resolve(__dirname, '..', '..', devName)
}

async function resolveCrossAppAliases() {
  try {
    const { crossAppAliases } = await import('@vos/cross-app-aliases')
    return crossAppAliases()
  } catch {
    return {
      '@relax': resolve(siblingDir('relax-dev', 'relax-app'), 'src'),
      '@learn': resolve(siblingDir('learn-dev', 'learn-app'), 'src'),
    }
  }
}

export default defineConfig(async ({ mode }) => {
  const isFirebase = mode === 'firebase' || mode === 'coach'
  const isCoach = mode === 'coach'
  const crossAppAliases = await resolveCrossAppAliases()
  delete crossAppAliases['@fuel']

  return {
    base: './',
    plugins: [react()],
    resolve: {
      // Bewusst NICHT preserveSymlinks (Original: true): das Original braucht dafür 41 explizite
      // Phantom-Deps (Commit d4bc095), weil pnpm-Symlinks sonst keine transitiven Pakete finden.
      // Hier gibt es keine gelinkten Pakete (kein @vos/cross-app-aliases) → normale Auflösung genügt.
      preserveSymlinks: false,
      alias: {
        ...crossAppAliases,

        '@src':                resolve(__dirname, './src'),
        '@db':                 resolve(__dirname, isFirebase ? './src/lib/db/index.firestore.app.js' : './src/lib/db/index.js'),
        '@tours-strava':       resolve(__dirname, isFirebase ? './src/lib/tours/adapters/live/strava.firestore.js' : './src/lib/tours/adapters/live/strava.js'),
        '@fitness-db':         resolve(__dirname, './src/lib/db'),
        '@utils':              resolve(__dirname, './src/lib/utils.js'),
        '@cloud/firebase.js':  resolve(__dirname, './src/firebase.js'),
        '@firebase-config':    resolve(__dirname, './firebase.config.js'),
        '@kb':                 KB_DIR,
        '@aliase':             resolve(KB_DIR, 'aliases.yml'),
        '@fitness/components': resolve(__dirname, './src/components'),
        '@fitness/constants':  resolve(__dirname, './src/constants'),
        '@fitness':            resolve(__dirname, './src'),
        '@components':         resolve(__dirname, './src/components'),
      },
      dedupe: ['react', 'react-dom', '@tanstack/react-query', 'firebase', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
    },
    server: {
      port: Number(process.env.FITNESS_FRONTEND_PORT || 5911),
      host: process.env.FITNESS_FRONTEND_HOST || '127.0.0.1',   // nur lokal (kein Auth im Backend dahinter)
      strictPort: true,
      fs: {
        // Dev-Server darf Dateien außerhalb von frontend/ ausliefern: KB-YAML (?raw) und Sibling-Repos.
        // Freigabe aus den TATSÄCHLICH aufgelösten Alias-Pfaden ableiten (kann ~/vitalos/<name>-app statt
        // ~/<name>-dev sein) — sonst liefert der Dev-Server z.B. @relax/... mit 403 aus.
        allow: [
          __dirname,
          KB_DIR,
          siblingDir('relax-dev', 'relax-app'),
          siblingDir('learn-dev', 'learn-app'),
          ...Object.values(crossAppAliases),
        ],
      },
      watch: {
        ignored: [
          '**/dist/**', '**/dist-*/**', '**/.firebase/**', '**/node_modules/**',
          '**/catalog-ui/**', '**/.git/**', '**/__pycache__/**',
        ],
      },
      proxy: {
        '/api': BACKEND,
        '/tours/strava': NODE,
        '/sixpack': NODE,
        // Legacy-Routen (kein Pendant im neuen Backend, s. docs/BACKEND-GAPS.md)
        '/exercises': LEGACY, '/exercise': LEGACY, '/session': LEGACY, '/sessions': LEGACY,
        '/journal': LEGACY, '/coverage': LEGACY, '/plan': LEGACY, '/blocks': LEGACY,
        '/theme': LEGACY, '/health': LEGACY, '/export': LEGACY, '/fitness': LEGACY,
        '/firestore': LEGACY, '/workouts': LEGACY, '/routines': LEGACY,
      },
    },
    build: {
      outDir: isCoach ? 'dist-coach' : 'dist',
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
