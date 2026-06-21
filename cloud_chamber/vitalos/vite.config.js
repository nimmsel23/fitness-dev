import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import tailwindcss from 'tailwindcss'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const CC_ROOT      = resolve(__dirname, '..')       // cloud_chamber/
const VITALOS_SRC  = resolve(__dirname, 'src')
const FED_DIR      = resolve(__dirname, '../federation')
const BACKEND      = 'http://localhost:9100'

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'

  const devAliases = isFirebase ? {} : {
    'fitness/FitnessApp': resolve(FED_DIR, 'FitnessApp.jsx'),
    'fuel/FuelApp':       resolve(FED_DIR, 'FuelApp.jsx'),
    'journal/JournalApp': resolve(FED_DIR, 'JournalApp.jsx'),
    'learn/LearnApp':     resolve(FED_DIR, 'LearnApp.jsx'),
    '@fuel':              resolve('/home/alpha/fuel-dev/src/client'),
  }

  const federationPlugin = isFirebase ? [federation({
    name: 'vitalos_host',
    remotes: {
      fitness: 'https://fitness-vos.web.app/remoteEntry.js',
      fuel:    'https://fuel-vos.web.app/remoteEntry.js',
      journal: 'https://journal-aos.web.app/remoteEntry.js',
      learn:   'https://learn-vos.web.app/remoteEntry.js',
    },
    shared: {
      react:       { singleton: true, requiredVersion: '^18.0.0' },
      'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
    },
  })] : []

  return {
    root: CC_ROOT,
    base: '/',
    plugins: [react(), ...federationPlugin],
    resolve: {
      alias: {
        '@src':   VITALOS_SRC,
        '@db':    resolve(VITALOS_SRC, isFirebase ? 'db.firestore.js' : 'db.js'),
        '@utils': resolve(VITALOS_SRC, 'lib/utils.js'),
        ...devAliases,
      },
      dedupe: ['react', 'react-dom'],
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
      outDir:     resolve(__dirname, isFirebase ? 'dist-firebase' : 'dist'),
      emptyOutDir: true,
      target:     'esnext',
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
