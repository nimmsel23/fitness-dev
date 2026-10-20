import process from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { proxy: { '/sixpack': `http://127.0.0.1:${process.env.FITNESS_NODE_PORT || 9100}` } },
});
