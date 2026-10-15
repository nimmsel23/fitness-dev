import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Catalog-UI (Fork) — Backend ist das neue Python-Backend (backend/, :9150).
// Dev:  Vite (:5912) proxied /api auf das Backend.
// Prod: `pnpm build` schreibt nach dist/; das Backend (oder ein Static-Host) liefert es unter /catalog-ui aus.
const API = process.env.FITNESS_BACKEND || 'http://127.0.0.1:9150'
const LEGACY = process.env.FITNESS_LEGACY_BACKEND || API

export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', emptyOutDir: true },
  server: {
    port: Number(process.env.FITNESS_CATALOG_UI_PORT || 5912),
    host: process.env.FITNESS_FRONTEND_HOST || '127.0.0.1',
    strictPort: true,
    proxy: {
      '/api': API,
      // Legacy-Routen ohne Pendant im neuen Backend (siehe ../docs/BACKEND-GAPS.md)
      '/fitness': LEGACY, '/exercises': LEGACY, '/exercise': LEGACY, '/coverage': LEGACY, '/health': LEGACY,
    },
  },
})
