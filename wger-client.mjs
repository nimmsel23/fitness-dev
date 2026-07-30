import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Nur importiert, wenn server.mjs den ersten echten wger-Fallback braucht
// (Katalog-Suche ohne lokalen Treffer) — kein Boot-Ping, keine Secrets im
// Hauptmodul. Lädt ~/.env/fitness.env selbst (AlphaOS-Konvention, wie
// fitness/catalog/core/paths.py es auf der Python-Seite tut) statt eines
// hartcodierten Fallback-Tokens im Quellcode.
function loadEnvFile(p) {
  try {
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
    }
  } catch {
    // Datei fehlt (z.B. anderer Host/Container) — Token bleibt dann leer,
    // fetchWger/postWger no-oppen gracefully statt zu crashen.
  }
}
loadEnvFile(path.join(os.homedir(), ".env", "fitness.env"));

const WGER_BASE = process.env.WGER_BASE || "http://127.0.0.1/api/v2";

function wgerToken() {
  return process.env.WGER_API_TOKEN || process.env.WGER_TOKEN || null;
}

// wger ist meist offline (lokaler Docker-Stack läuft nicht durchgehend) —
// nach einem fehlgeschlagenen Call für COOLDOWN_MS keine weiteren Versuche,
// sonst wartet jede Suchanfrage einzeln die vollen 4s Timeout aus.
const COOLDOWN_MS = 30_000;
let downSince = 0;

function isCoolingDown() {
  return downSince && Date.now() - downSince < COOLDOWN_MS;
}
function markDown() {
  downSince = Date.now();
}
function markUp() {
  downSince = 0;
}

export async function fetchWger(wgerPath, qs = "") {
  const token = wgerToken();
  if (!token || isCoolingDown()) return {};
  const url = `${WGER_BASE}${wgerPath}?format=json${qs ? "&" + qs : ""}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Token ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      markUp();
      return res.json();
    }
    await res.text().catch(() => {}); // Body draining, siehe server.mjs notifyPythonSync
    markDown();
    return {};
  } catch {
    markDown();
    return {};
  }
}

export async function postWger(wgerPath, body) {
  const token = wgerToken();
  if (!token || isCoolingDown()) return null;
  const url = `${WGER_BASE}${wgerPath}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      markUp();
      return res.json();
    }
    await res.text().catch(() => {});
    markDown();
    return null;
  } catch {
    markDown();
    return null;
  }
}
