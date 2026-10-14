#!/usr/bin/env node
/* eslint-env node */
// Funktionstest der Backend-Anbindung (typisierter Client, Session-Adapter, DB-Layer, Catalog-UI-Übersetzung).
// Lädt die echten Module über Vites SSR-Loader und ruft sie gegen ein LAUFENDES Backend auf.
//
//   # 1) Backend gegen eine DATENKOPIE starten (der Test schreibt Sessions!):
//   FITNESS_DATA_ROOT=/tmp/fitness-copy python3 -m backend serve --port 9951
//   # 2) Test (direkt am Backend oder über den Vite-Dev-Server-Proxy):
//   FITNESS_SMOKE_BASE=http://127.0.0.1:9951 pnpm run test:smoke
//
// Schutz: bricht ab, wenn data_root unter ~/.aos liegt (echte Nutzerdaten).
import assert from 'node:assert/strict'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BASE = process.env.FITNESS_SMOKE_BASE || 'http://127.0.0.1:5911'
process.env.VITE_API_BASE = BASE

const health = await fetch(`${BASE}/api/health`).then((r) => r.json()).catch(() => null)
if (!health?.ok) { console.error(`Backend unter ${BASE} nicht erreichbar (/api/health).`); process.exit(2) }
if (String(health.data_root).startsWith(`${os.homedir()}/.aos`)) {
  console.error(`ABBRUCH: data_root=${health.data_root} sind echte Nutzerdaten. Backend mit FITNESS_DATA_ROOT=<Kopie> starten.`)
  process.exit(2)
}

globalThis.window = { location: { pathname: '/' } }
const mem = new Map()
globalThis.localStorage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) }

const server = await createServer({
  root: ROOT, configFile: `${ROOT}vite.config.js`, appType: 'custom', logLevel: 'error',
  server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true },
})
const results = []
const t = async (name, fn) => { try { await fn(); results.push(['OK  ', name]) } catch (e) { results.push(['FAIL', `${name} — ${e.message}`]) } }
const load = async (path) => { try { return await server.ssrLoadModule(path) } catch (e) { results.push(['FAIL', `${path} laden — ${e.message}`]); return null } }

try {
  const api = await load('/src/lib/api/index.js')
  const adapter = await load('/src/lib/api/sessionAdapter.js')
  const { backend, RevConflictError, ApiError } = api

  let uid, anyDate
  const DAY = '2099-01-01'   // fern in der Zukunft: kollidiert nie mit echten Sessions der Kopie
  await t('Aktive UID = Coach aus /api/clients', async () => { uid = await api.getActiveUid(); assert.ok(uid) })
  await t('health', async () => assert.equal((await backend.health()).ok, true))
  await t('clients enthält einen Coach', async () => assert.ok((await backend.clients()).some((c) => c.is_coach)))
  await t('listSessions + loadSession', async () => {
    const list = await backend.listSessions(uid, { limit: 3 }); assert.ok(list.length > 0); anyDate = list[0].date
    assert.equal((await adapter.loadSession(anyDate, list[0].session_id)).date, anyDate)
  })
  await t('loadSession (fehlend) → ApiError 404', () =>
    assert.rejects(() => adapter.loadSession('2000-01-01'), (e) => e instanceof ApiError && e.status === 404))
  await t('Speichern, nochmal Speichern mit veralteter UI-rev ohne falschen 409', async () => {
    const a = await adapter.persistSession(DAY, { notes: 'smoke 1', exercises: [] })
    const stale = { notes: 'smoke 2', exercises: [], rev: a.rev - 1 }
    const b = await adapter.persistSession(DAY, stale)
    assert.equal(b.rev, a.rev + 1)
    assert.equal((await adapter.persistSession(DAY, { ...stale, notes: 'smoke 3' })).rev, b.rev + 1)
  })
  await t('Echter Konflikt → RevConflictError(currentRev)', async () => {
    const cur = (await backend.getSession(uid, DAY)).rev
    await assert.rejects(() => backend.saveSession(uid, DAY, { notes: 'x', rev: cur - 1 }),
      (e) => e instanceof RevConflictError && e.currentRev === cur && /neu laden/.test(e.message))
  })
  await t('Sidecar (date__id) speichern, laden, loadSessionsForDate', async () => {
    await adapter.persistSession(DAY, { notes: 'sidecar', exercises: [] }, 'hiit1')
    const s = await adapter.loadSession(DAY, 'hiit1'); assert.equal(s.notes, 'sidecar'); assert.equal(s.session_id, 'hiit1')
    assert.equal((await adapter.loadSessionsForDate(DAY)).length, 2)
  })
  await t('loadRecentSessions(3)', async () => assert.equal((await adapter.loadRecentSessions(3)).length, 3))
  await t('plan / planTemplates / searchExercises / getExercise', async () => {
    const { templates } = await backend.planTemplates(); assert.ok(templates.length)
    assert.ok((await backend.plan({ template: templates[0] })).slots.length > 0)
    const hit = (await backend.searchExercises('klimm', 3)).results[0]; assert.ok(hit)
    assert.equal((await backend.getExercise(hit.exercise_id)).exercise_id, hit.exercise_id)
  })
  await t('plan: unbekanntes Template → 404', () =>
    assert.rejects(() => backend.plan({ template: 'gibt-es-nicht' }), (e) => e instanceof ApiError && e.status === 404))

  await t('Offline: Platzhalter (offline-stub) ist ein Fehler, offline-cache bleibt gültig', async () => {
    const mk = (body, source) => async () => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json', 'X-Source': source } })
    try {
      window.aosOfflineQueue = { fetch: mk({ ok: false, offline: true }, 'offline-stub') }
      await assert.rejects(() => backend.getSession(uid, DAY), (e) => e instanceof ApiError && e.status === 0)
      assert.equal(await (await load('/src/lib/db/local/sessions.js')).getSession(DAY), null)   // DB-Layer: kein Fake-Session-Objekt
      window.aosOfflineQueue = { fetch: mk({ date: DAY, notes: 'aus Cache' }, 'offline-cache') }
      assert.equal((await backend.getSession(uid, DAY)).notes, 'aus Cache')
    } finally { delete window.aosOfflineQueue }
  })

  const sessions = await load('/src/lib/db/local/sessions.js')
  if (sessions) {
    await t('DB-Layer: saveSession/getSession (alte Signatur)', async () => {
      const r = await sessions.saveSession(DAY, { notes: 'via db-layer', exercises: [] })
      assert.equal(r.ok, true); assert.equal(typeof r.rev, 'number'); assert.equal(r.sqliteSync, true)
      assert.equal((await sessions.getSession(DAY)).notes, 'via db-layer')
      assert.equal(await sessions.getSession('2000-01-01'), null)
    })
    await t('DB-Layer: getRecentSessions / getPlanSuggestion({..}) → {ok, plan}', async () => {
      assert.equal((await sessions.getRecentSessions(3)).length, 3)
      const p = await sessions.getPlanSuggestion({ template: (await backend.planTemplates()).templates[0] })
      assert.equal(p.ok, true); assert.ok(p.plan.slots.length)
    })
  }
  const kb = await load('/src/lib/db/local/kb.js')
  if (kb) {
    await t('DB-Layer: searchExercises (alte Rückgabeform) + getExercise', async () => {
      const r = await kb.searchExercises('klimm', 5); assert.equal(r.ok, true); assert.ok(r.results[0].displayName)
      assert.ok(await kb.getExercise(r.results[0].exercise_id))
    })
  }
  const coach = await load('/src/lib/db/local/coach.js')
  if (coach) await t('DB-Layer: getAllUserProfiles → {uid:{displayName,slug}}', async () => {
    const p = await coach.getAllUserProfiles(); assert.ok(p[uid].displayName); assert.ok(Object.values(p).every((x) => x.uid))
  })

  const cat = await load('/catalog-ui/src/api.js')
  if (cat) {
    await t('catalog-ui: /health, /exercises/search, /exercise/{id}', async () => {
      assert.equal((await cat.api('/health')).ok, true)
      const r = await cat.api('/exercises/search?q=klimm'); assert.ok(r.results.length)
      assert.equal((await cat.api(`/exercise/${r.results[0].exercise_id}`)).exercise.exercise_id, r.results[0].exercise_id)
    })
    await t('catalog-ui: POST /fitness/plan → {ok, plan}; /fitness/weekly → {ok, …}', async () => {
      const p = await cat.api('/fitness/plan', { method: 'POST', body: JSON.stringify({ template: 'push_day' }) })
      assert.equal(p.ok, true); assert.ok(p.plan.slots.length)
      const w = await cat.api('/fitness/weekly?week=current'); assert.equal(w.ok, true); assert.ok(Array.isArray(w.missing_regions))
    })
  }
} finally {
  await server.close()
}
for (const [s, n] of results) console.log(s, n)
const failed = results.filter((r) => r[0] === 'FAIL').length
console.log(`\n${results.length - failed}/${results.length} bestanden`)
process.exit(failed ? 1 : 0)
