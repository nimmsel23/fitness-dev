import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, "..", "..", "data");
const targetDir = path.resolve(__dirname, "..", "public", "data");
const files = ["anatomy.json", "exercise-muscle-db.json"];

await fs.mkdir(targetDir, { recursive: true });

for (const file of files) {
  const source = path.join(sourceDir, file);
  const target = path.join(targetDir, file);
  try {
    await fs.copyFile(source, target);
    console.log(`[sync:data] copied ${file}`);
  } catch (error) {
    console.warn(`[sync:data] skipped ${file}: ${String(error.message || error)}`);
  }
}
