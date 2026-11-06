import { vosChangelog } from './scripts/vos-changelog/vos-changelog-vite.mjs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { pathToFileURL } from 'url'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const FITNESS_DEV = resolve(__dirname, '../..')
const FITNESS_SRC = resolve(FITNESS_DEV, 'src')
const BACKEND     = 'http://localhost:9150'
// fitness-app-Quellen importieren views/SixPack|Plan|Skills, die nur als Submodule existieren —
// derselbe Resolver wie in fitness/habits/Shell, sonst bricht der Build (workoutDoc.js nicht auflösbar).
const { miniAppSubmodulePlugin } = await import(pathToFileURL(resolve(FITNESS_DEV, 'vite-miniapp-submodules.mjs')).href)

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'
  return {
    root: __dirname,
    base: './',
    plugins: [vosChangelog({ appId: 'learn', appName: 'Learn', accent: '#fb923c' }),
      miniAppSubmodulePlugin(FITNESS_DEV),
      react(),
      // Ersetzt den hartkodierten public/sw.js (learn-vos-v1, nie gebumpt) —
      // workbox precached mit Content-Hashes, Versionierung passiert von selbst.
      // Manifest bleibt public/manifest.json (bereits verlinkt in index.html).
      VitePWA({
        base: './',
        scope: '/',
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/fitness/, /^\/exercise/, /^\/session/, /^\/coverage/, /^\/health/],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
      }),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        '@learn': resolve(FITNESS_SRC),
        '@src':                resolve(__dirname, './src'),
        '@db':                 resolve(FITNESS_SRC, isFirebase ? 'lib/db/index.firestore.js' : 'lib/db/index.js'),
        '@utils':              resolve(FITNESS_SRC, 'lib/utils.js'),
        '@components':         resolve(FITNESS_SRC, 'components'),
        '@fitness/components': resolve(FITNESS_SRC, 'components'),
        '@constants':          resolve(FITNESS_SRC, 'constants'),
        '@fitness/constants':  resolve(FITNESS_SRC, 'constants'),
        '@fitness/lib':        resolve(FITNESS_SRC, 'lib'),
        '@fitness/styles':     resolve(FITNESS_SRC, 'styles'),
      },
    },
    server: {
      port: 9181,
      proxy: {
        '/fitness':  BACKEND,
        '/exercise': BACKEND,
        '/session':  BACKEND,
        '/coverage': BACKEND,
        '/health':   BACKEND,
      },
    },
    build: {
      outDir:      resolve(__dirname, isFirebase ? 'dist-firebase' : 'dist'),
      emptyOutDir: true,
    },
  }
})
