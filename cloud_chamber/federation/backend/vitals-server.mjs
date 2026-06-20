/**
 * VitalOS Hub Server — /opt/vitals/
 *
 * Servert fitness + fuel + relax prod builds unter einem Port.
 * Jede App läuft unter eigenem Subpath (/fitness/, /fuel/, /relax/).
 * API-Calls werden an die jeweiligen Backends proxied.
 *
 * Voraussetzung: Apps wurden mit korrektem base-URL gebaut
 * (→ cloud_chamber/federation/backend/build.sh)
 *
 * Port: 6200 (prod-Konvention: 6xxx)
 * Deploy: sudo bash cloud_chamber/federation/backend/deploy.sh
 */

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.VITALS_PORT || 6200);
const HOST = process.env.VITALS_HOST || "127.0.0.1";

// Dist-Verzeichnisse — relativ zu /opt/vitals/ (oder überschreibbar via Env)
const DIST = {
  fitness: process.env.VITALS_FITNESS_DIST || path.join(__dirname, "fitness"),
  fuel:    process.env.VITALS_FUEL_DIST    || path.join(__dirname, "fuel"),
  relax:   process.env.VITALS_RELAX_DIST   || path.join(__dirname, "relax"),
};

// Backend-URLs für zukünftigen API-Proxy (noch nicht aktiviert)
// fitness: process.env.VITALS_FITNESS_API || "http://127.0.0.1:6100"
// fuel:    process.env.VITALS_FUEL_API    || "http://127.0.0.1:7000"
// relax:   process.env.VITALS_RELAX_API   || "http://127.0.0.1:9123"

const app = new Hono();

// ── Health ────────────────────────────────────────────────────────────────────

app.get("/health", (c) => {
  const status = Object.fromEntries(
    Object.entries(DIST).map(([name, dir]) => [name, fs.existsSync(dir)])
  );
  return c.json({ ok: true, apps: status, port: PORT });
});

// ── Hub Landing Page ──────────────────────────────────────────────────────────

app.get("/", (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VitalOS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0a0a0f; color: #e2e8f0;
           display: flex; flex-direction: column; align-items: center;
           justify-content: center; min-height: 100vh; gap: 2rem; }
    h1 { font-size: 1.5rem; font-weight: 300; letter-spacing: 0.2em;
         color: #64748b; text-transform: uppercase; }
    .apps { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }
    a { display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
        padding: 1.5rem 2rem; border-radius: 12px; border: 1px solid #1e293b;
        text-decoration: none; color: #e2e8f0; transition: border-color 0.2s, background 0.2s; }
    a:hover { border-color: #3b82f6; background: #0f172a; }
    .icon { font-size: 2rem; }
    .label { font-size: 0.9rem; font-weight: 500; }
    .sub { font-size: 0.75rem; color: #475569; }
  </style>
</head>
<body>
  <h1>VitalOS</h1>
  <div class="apps">
    <a href="/fitness/">
      <span class="icon">💪</span>
      <span class="label">Fitness</span>
      <span class="sub">Training · Anatomie · Katalog</span>
    </a>
    <a href="/fuel/">
      <span class="icon">🍽️</span>
      <span class="label">Fuel</span>
      <span class="sub">Ernährung · Supplements · Makros</span>
    </a>
    <a href="/relax/">
      <span class="icon">🧘</span>
      <span class="label">Relax</span>
      <span class="sub">Physio · Regeneration</span>
    </a>
  </div>
</body>
</html>`);
});

// ── Static + SPA Fallback pro App ─────────────────────────────────────────────

function serveSpa(app_name) {
  const distDir = DIST[app_name];
  const prefix = `/${app_name}`;

  return async (c, next) => {
    const url = c.req.path;
    if (!url.startsWith(prefix)) return next();

    // Relativer Pfad innerhalb des App-Verzeichnisses
    const rel = url.slice(prefix.length) || "/";
    const filePath = path.join(distDir, rel);

    // Datei existiert → direkt serven
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return c.newResponse(fs.readFileSync(filePath), {
        headers: { "Content-Type": getMime(filePath) },
      });
    }

    // SPA-Fallback → index.html der jeweiligen App
    const indexPath = path.join(distDir, "index.html");
    if (fs.existsSync(indexPath)) {
      return c.html(fs.readFileSync(indexPath, "utf-8"));
    }

    return c.text(`${app_name} dist nicht gefunden: ${distDir}`, 404);
  };
}

app.use("/fitness/*", serveSpa("fitness"));
app.use("/fuel/*",    serveSpa("fuel"));
app.use("/relax/*",   serveSpa("relax"));

// ── MIME Helper ───────────────────────────────────────────────────────────────

const MIME = new Map([
  [".html",  "text/html; charset=utf-8"],
  [".js",    "application/javascript; charset=utf-8"],
  [".mjs",   "application/javascript; charset=utf-8"],
  [".css",   "text/css; charset=utf-8"],
  [".json",  "application/json"],
  [".svg",   "image/svg+xml"],
  [".png",   "image/png"],
  [".jpg",   "image/jpeg"],
  [".ico",   "image/x-icon"],
  [".woff2", "font/woff2"],
  [".woff",  "font/woff"],
  [".webp",  "image/webp"],
]);

function getMime(filePath) {
  return MIME.get(path.extname(filePath)) || "application/octet-stream";
}

// ── Start ─────────────────────────────────────────────────────────────────────

console.log(`🌿 VitalOS Hub → http://${HOST}:${PORT}`);
console.log(`   /fitness/ → ${DIST.fitness}`);
console.log(`   /fuel/    → ${DIST.fuel}`);
console.log(`   /relax/   → ${DIST.relax}`);

serve({ fetch: app.fetch, port: PORT, hostname: HOST });
