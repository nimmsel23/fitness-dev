/**
 * fuel-dev als Module Federation Remote
 *
 * Aus fuel-dev/ ausführen:
 *   npx vite build --config ~/fitness-dev/cloud_chamber/federation/fuel.remote.vite.config.js
 *
 * Output: fuel-dev/dist-federation/  (berührt dist/ nicht)
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FUEL_ROOT = resolve(__dirname, '../../../fuel-dev')

export default defineConfig({
  root: FUEL_ROOT,
  resolve: {
    alias: {
      '@fuel': resolve(FUEL_ROOT, 'src/client'),
    },
  },
  plugins: [
    react(),
    federation({
      name: 'fuel',
      filename: 'remoteEntry.js',
      exposes: {
        './FuelApp': resolve(__dirname, 'FuelApp.jsx'),
      },
      shared: {
        react:     { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        'lucide-react': { singleton: true },
      },
    }),
  ],
  build: {
    outDir: resolve(FUEL_ROOT, 'dist-federation'),
    emptyOutDir: true,
    target: 'esnext',
    minify: false,
  },
})
