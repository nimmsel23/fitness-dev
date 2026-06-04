import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PWA_SRC = path.join(ROOT, "pwa", "src");
const COACH_SRC = path.join(ROOT, "src");

const TARGETS = [
  "views/Habits",
  "views/Journal",
  "lib/db",
  "lib/utils.js"
];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    // create parent dir if needed for single files
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log("🔄 Syncing Single-Source-of-Truth Views to PWA...");

for (const target of TARGETS) {
  const srcPath = path.join(COACH_SRC, target);
  const destPath = path.join(PWA_SRC, target);
  
  if (fs.existsSync(srcPath)) {
    console.log(`  -> Syncing ${target}...`);
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }
    copyRecursiveSync(srcPath, destPath);
  } else {
    console.warn(`  ! Source not found: ${srcPath}`);
  }
}

console.log("✅ Sync complete!");
