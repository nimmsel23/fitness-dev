import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const CC_ROOT      = resolve(__dirname, '..')
const VITALOS_SRC  = resolve(__dirname, 'src')
const FED_DIR      = resolve(__dirname, '../federation')
const JOURNAL_ROOT = resolve(__dirname, '../journal-vos')
const LEARN_ROOT   = resolve(__dirname, '../learn-vos')
const FUEL_ROOT    = resolve('/home/alpha/fuel-dev')
const BACKEND      = 'http://localhost:9100'

// Context-aware @db resolver: journal+habits views → journal db, rest → vitalos db
// Die Views kommen via Symlink aus fitness-dev/src/views/ (echter Pfad),
// aber auch direkt aus journal-vos/src/ — beide Pfade abdecken.
function journalDbPlugin(isFirebase) {
  const journalDb = resolve(JOURNAL_ROOT, isFirebase ? 'src/db.firestore.js' : 'src/db.js')
  return {
    name: 'journal-db-resolver',
    resolveId(id, importer) {
      if (id !== '@db' || !importer) return
      if (importer.includes('/journal-vos/')) return journalDb
      // Symlink-aufgelöste Pfade: src/views/Journal/ und src/views/Habits/
      if (importer.includes('/src/views/Journal/') || importer.includes('/src/views/Habits/')) return journalDb
    },
  }
}

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'

  const aliases = {
    '@src':   VITALOS_SRC,
    '@utils': resolve(VITALOS_SRC, 'lib/utils.js'),
    '@db':    resolve(VITALOS_SRC, isFirebase ? 'db.firestore.js' : 'db.js'),
    'journal/JournalApp': resolve(VITALOS_SRC, 'apps/JournalApp.jsx'),
    'learn/LearnApp':     resolve(VITALOS_SRC, 'apps/LearnApp.jsx'),
    'fuel/FuelApp':       resolve(FED_DIR, 'FuelApp.jsx'),
    '@fuel':              resolve(FUEL_ROOT, 'src/client'),
    '@journal-vos':       resolve(JOURNAL_ROOT, 'src'),
    '@learn-vos':         resolve(LEARN_ROOT, 'src'),
  }

  const federationPlugin = []

  return {
    root: CC_ROOT,
    base: '/',
    plugins: [react(), journalDbPlugin(isFirebase), ...federationPlugin],
    resolve: {
      alias: aliases,
      dedupe: ['react', 'react-dom', '@tanstack/react-query'],
    },
    css: {
      postcss: {
        plugins: [tailwindcss({ config: resolve(__dirname, 'tailwind.config.cjs') })],
      },
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
      outDir:      resolve(__dirname, isFirebase ? 'dist-firebase' : 'dist'),
      emptyOutDir: true,
      target:      'esnext',
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        ...(!isFirebase && {
          output: {
            manualChunks: {
              react:   ['react', 'react-dom'],
              charts:  ['recharts'],
              icons:   ['lucide-react'],
              bodymap: ['react-body-highlighter'],
            },
          },
        }),
      },
    },
  }
})
