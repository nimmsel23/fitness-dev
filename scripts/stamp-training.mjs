// Nach `vite build --mode training`: macht aus dist-training/ eine eigene
// installierbare App (eigener Name/Start-URL), getrennt von der Haupt-App.
// public/manifest.json bleibt unberührt — nur der Build-Output wird umgeschrieben.
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, process.argv[2] || "dist-training");
const manifestPath = resolve(outDir, "manifest.json");

if (!existsSync(manifestPath)) {
  console.error(`❌ ${manifestPath} nicht gefunden — erst "vite build --mode training"`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
Object.assign(manifest, {
  name: "VitalOS Training",
  short_name: "Training",
  description: "Krafttraining loggen — Session-Tab als eigene App",
  start_url: "/#session",
  scope: "/",
});
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

const indexPath = resolve(outDir, "index.html");
if (existsSync(indexPath)) {
  const html = readFileSync(indexPath, "utf8").replace(/<title>[^<]*<\/title>/, "<title>VitalOS Training</title>");
  writeFileSync(indexPath, html);
}
console.log(`🏋️  ${outDir}: Manifest + Titel auf "VitalOS Training" gesetzt`);
