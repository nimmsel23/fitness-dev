/**
 * relax-dev Subpath-Build für /opt/vitals/
 * base: /relax/  →  alle Assets unter /relax/assets/
 *
 * Aus relax-dev/ ausführen (via build.sh):
 *   VITE_BASE=/relax/ npx vite build --config <path>/vite.relax.config.mjs --outDir dist-vitals
 */

import { defineConfig, mergeConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RELAX_ROOT = resolve(__dirname, "../../../../relax-dev");

const { default: baseConfig } = await import(resolve(RELAX_ROOT, "vite.config.js"));

export default mergeConfig(
  typeof baseConfig === "function" ? baseConfig({ mode: "production", command: "build" }) : baseConfig,
  defineConfig({
    base: process.env.VITE_BASE || "/relax/",
    build: {
      outDir: resolve(RELAX_ROOT, "dist-vitals"),
      emptyOutDir: true,
    },
  })
);
