// Nach `vite build --mode training|atlas`: macht aus dist-<mode>/ eine eigene
// installierbare App (eigener Name/Start-URL), getrennt von der Haupt-App.
// Aufruf: node scripts/stamp-training.mjs <outDir> ["Name" "Kurzname" "/#start" "Beschreibung"]
// public/manifest.json bleibt unberührt — nur der Build-Output wird umgeschrieben.
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { injectSplash } from "./solo-splash.mjs";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, process.argv[2] || "dist-training");
const [, , , NAME = "VitalOS Training", SHORT = "Training", START = "/#session",
  DESC = "Krafttraining loggen — Session-Tab als eigene App"] = process.argv;
const ACCENTS = { training: "#e8a020", atlas: "#35c2c8" };
const manifestPath = resolve(outDir, "manifest.json");

if (!existsSync(manifestPath)) {
  console.error(`❌ ${manifestPath} nicht gefunden — erst "vite build --mode training"`);
  process.exit(1);
}

// Eigenes App-Icon je Solo-Build: solo-icons/<mode>/ (erzeugt von scripts/solo-icons.py),
// <mode> kommt aus dem Ordnernamen dist-<mode>.
const mode = outDir.split("/").pop().replace(/^dist-/, "");
const iconDir = resolve(root, "solo-icons", mode);
const hasIcons = existsSync(resolve(iconDir, "icon-512.png"));
if (hasIcons) {
  for (const f of ["icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]) {
    copyFileSync(resolve(iconDir, f), resolve(outDir, f));
  }
  copyFileSync(resolve(iconDir, "icon.svg"), resolve(outDir, "favicon.svg"));
} else {
  console.warn(`⚠️  solo-icons/${mode}/ fehlt — Icons der Haupt-App bleiben`);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
Object.assign(manifest, {
  name: NAME,
  short_name: SHORT,
  description: DESC,
  start_url: START,
  scope: "/",
});
if (hasIcons) {
  manifest.icons = [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ];
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

const indexPath = resolve(outDir, "index.html");
if (existsSync(indexPath)) {
  let html = readFileSync(indexPath, "utf8").replace(/<title>[^<]*<\/title>/, `<title>${SHORT} - VitalOS</title>`);
  if (hasIcons) {
    html = html
      .replace(/(<link rel="apple-touch-icon" href=")[^"]*(")/, "$1./icon-180.png$2")
      .replace(/(<meta name="apple-mobile-web-app-title" content=")[^"]*(")/, `$1${SHORT}$2`);
  }
  html = injectSplash(html, { name: SHORT, accent: ACCENTS[mode] || "#e8a020", icon: "./icon-192.png" });
  writeFileSync(indexPath, html);
}
console.log(`🏋️  ${outDir}: Manifest + Titel auf "${NAME}" gesetzt`);
