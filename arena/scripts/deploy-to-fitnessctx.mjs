import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, "..", "dist");
const targetDir = path.resolve(__dirname, "..", "..", "vitalctx", "public", "fitness", "arena");

async function ensureDir(pathname) {
  await fs.mkdir(pathname, { recursive: true });
}

async function exists(pathname) {
  try {
    await fs.stat(pathname);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(distDir))) {
  console.error(`[deploy:fitnessctx] missing build output: ${distDir}`);
  console.error("[deploy:fitnessctx] run: npm run build");
  process.exit(1);
}

await ensureDir(path.dirname(targetDir));
await fs.rm(targetDir, { recursive: true, force: true });
await fs.cp(distDir, targetDir, { recursive: true });

console.log(`[deploy:fitnessctx] published ${distDir} -> ${targetDir}`);
