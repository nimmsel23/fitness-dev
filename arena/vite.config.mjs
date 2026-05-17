import { defineConfig } from "vite";

// Use relative base for multi-tenant support
// This allows the same build to work in both:
// - Personal context: /fitness/arena/
// - Client context: /c/{clientId}/fitness/arena/
const FITNESS_BASE = "./";

export default defineConfig({
  base: FITNESS_BASE,
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: "/fitness/arena/",
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
});
