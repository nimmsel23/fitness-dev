import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        habits: resolve(__dirname, 'standalone/habits/index.html'),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'icon.svg'],
      manifest: {
        name: "AlphaOS Fitness",
        short_name: "Fitness",
        description: "AlphaOS Fitness PWA for Clients",
        theme_color: "#090b10",
        background_color: "#090b10",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com/,
            handler: "NetworkFirst",
            options: { cacheName: "firestore-cache" },
          },
        ],
      },
    }),
  ],
});
