/**
 * fuel-dev Subpath-Build für /opt/vitals/
 * base: /fuel/  →  alle Assets unter /fuel/assets/
 *
 * Aus fuel-dev/ ausführen (via build.sh):
 *   VITE_BASE=/fuel/ npx vite build --config <path>/vite.fuel.config.mjs --outDir dist-vitals
 */

import { defineConfig, mergeConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FUEL_ROOT = resolve(__dirname, "../../../../fuel-dev");

const { default: baseConfig } = await import(resolve(FUEL_ROOT, "vite.config.js"));

export default mergeConfig(
  typeof baseConfig === "function" ? baseConfig({ mode: "production", command: "build" }) : baseConfig,
  defineConfig({
    base: process.env.VITE_BASE || "/fuel/",
    build: {
      outDir: resolve(FUEL_ROOT, "dist-vitals"),
      emptyOutDir: true,
    },
  })
);
