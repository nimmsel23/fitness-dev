// Same-origin in Prod (api.py served dist/) und lokal (Vite-Proxy) — kein Prefix nötig.
// Hinter dem Tailscale Funnel liegt die UI unter /fitness-catalog/ (das Backend
// schreibt diesen Pfad intern auf /catalog-ui/ um), API-Routen liegen auf dem
// Backend aber an der Wurzel — absolute Pfade wie /health träfen dort sonst wieder
// den /catalog-ui-Catchall. /fitness-api/ ist die separate, unrewrittene Funnel-
// Route direkt auf denselben Backend-Root (:9150) — dorthin umleiten, wenn wir
// unter dem /fitness-catalog-Mount laufen.
export const API_BASE = window.location.pathname.startsWith('/fitness-catalog')
  ? '/fitness-api'
  : '';

// ── Übersetzung alter Routen → neues Backend (/api/*) ───────────────────────────
// Die Komponenten rufen weiter die alten Pfade auf (api('/fitness/weekly?week=…')). Hier werden die
// Routen, die das neue Backend kennt, auf dessen typisierten Client umgeleitet und die Antwort in die
// alte Form gebracht. Alles andere läuft unverändert an die Legacy-Route (Vite-Proxy → FITNESS_LEGACY_BACKEND)
// und scheitert mit 404, solange das Backend dafür nichts hat — Liste: ../../docs/BACKEND-GAPS.md.
// Sobald die Komponenten selbst auf `backend.*` umgestellt sind, kann diese Tabelle ersatzlos entfallen.
import { backend, getActiveUid } from '../../src/lib/api/index.js';

const params = (path) => new URLSearchParams(path.split('?')[1] || '');

const ROUTES = [
  { match: (p) => p === '/health', run: () => backend.health() },
  {
    match: (p) => p.split('?')[0] === '/exercises/search',
    run: (p) => backend.searchExercises(params(p).get('q') || '', Number(params(p).get('limit')) || 24),
  },
  {
    match: (p) => /^\/exercise\/[^/?]+$/.test(p),
    run: async (p) => ({ exercise: await backend.getExercise(decodeURIComponent(p.split('/')[2])) }),
  },
  {
    // alt: POST /fitness/plan {template, goal} → {ok, plan}; neu: GET /api/plan?template=&goal=
    match: (p) => p.split('?')[0] === '/fitness/plan',
    run: async (_p, opts) => {
      const body = opts?.body ? JSON.parse(opts.body) : {};
      return { ok: true, plan: await backend.plan({ template: body.template, split: body.split, day: body.day, goal: body.goal }) };
    },
  },
  {
    // alt: GET /fitness/weekly?week= (implizite UID) → {ok, ...}; neu: UID im Pfad → aktive UID (Coach)
    match: (p) => p.split('?')[0] === '/fitness/weekly',
    run: async (p) => ({ ok: true, ...(await backend.weekly(await getActiveUid(), params(p).get('week') || 'current')) }),
  },
];

async function legacy(path, opts) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function api(path, opts = {}) {
  const route = ROUTES.find((r) => r.match(path));
  return route ? route.run(path, opts) : legacy(path, opts);
}
