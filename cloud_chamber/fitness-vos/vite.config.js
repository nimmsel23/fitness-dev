import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname  = dirname(fileURLToPath(import.meta.url))
const FITNESS_DEV = resolve('/home/alpha/fitness-dev')
const FITNESS_SRC = resolve(FITNESS_DEV, 'src')

export default defineConfig({
  root: __dirname,
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@src':   FITNESS_SRC,
      '@db':    resolve(FITNESS_SRC, 'db.firestore.js'),
      '@utils': resolve(FITNESS_SRC, 'lib/utils.js'),
    },
    dedupe: ['react', 'react-dom'],
  },
  css: {
    postcss: {
      plugins: [tailwindcss({ config: resolve(FITNESS_DEV, 'tailwind.config.cjs') })],
    },
  },
  build: {
    outDir:      resolve(__dirname, 'dist-firebase'),
    emptyOutDir: true,
    target:      'esnext',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
})
