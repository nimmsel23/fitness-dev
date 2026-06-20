/**
 * fitness-dev Subpath-Build für /opt/vitals/
 * base: /fitness/  →  alle Assets unter /fitness/assets/
 *
 * Aus fitness-dev/ ausführen (via build.sh):
 *   VITE_BASE=/fitness/ npx vite build --config cloud_chamber/federation/backend/vite.fitness.config.mjs --outDir dist-vitals
 */

import { defineConfig, mergeConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FITNESS_ROOT = resolve(__dirname, "../../..");

// Basis-Config aus bestehendem vite.config.js importieren
const { default: baseConfig } = await import(resolve(FITNESS_ROOT, "vite.config.js"));

// Basis-Config ist eine Funktion (defineConfig(({ mode }) => ...))
// mergeConfig kann mit beiden Formen umgehen
export default mergeConfig(
  typeof baseConfig === "function" ? baseConfig({ mode: "production", command: "build" }) : baseConfig,
  defineConfig({
    base: process.env.VITE_BASE || "/fitness/",
    build: {
      outDir: resolve(FITNESS_ROOT, "dist-vitals"),
      emptyOutDir: true,
    },
  })
);
