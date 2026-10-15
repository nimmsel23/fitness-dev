#!/usr/bin/env node
/* eslint-env node */
// Test der Offline-Queue (public/offline-queue.js), Schwerpunkt: HTTP 409 beim Abspielen darf einen Offline-Stand
// NIEMALS stillschweigend verwerfen (neues Backend lehnt PUT mit veralteter rev mit 409 ab).
import 'fake-indexeddb/auto'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const FILE = process.env.OFFLINE_QUEUE_FILE || fileURLToPath(new URL('../public/offline-queue.js', import.meta.url))
globalThis.window = new EventTarget()
const events = []
window.addEventListener('fitness:queue-conflict', (e) => events.push(e.detail))

const realFetch = globalThis.fetch
let mode = 'offline'
let responder = null
const calls = []
globalThis.fetch = async (url, init) => {
  calls.push({ url: String(url), method: init?.method })
  if (mode === 'offline') throw new TypeError('offline')
  return responder(url, init)
}
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

await import(FILE)
const q = window.aosOfflineQueue
const readQueue = () => new Promise((resolve, reject) => {
  const r = indexedDB.open('aos-offline-fitness', 1)
  r.onsuccess = () => { const g = r.result.transaction('queue').objectStore('queue').getAll(); g.onsuccess = () => resolve(g.result); g.onerror = () => reject(g.error) }
  r.onerror = () => reject(r.error)
})

const results = []
const t = async (name, fn) => { try { await fn(); results.push(['OK  ', name]) } catch (e) { results.push(['FAIL', `${name} — ${e.message}`]) } }
const URL_A = '/api/users/u1/sessions/2026-10-12'
const put = (body) => q.fetch(URL_A, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

await t('Offline: PUT wird eingereiht (202 queued)', async () => {
  const res = await put({ rev: 1, notes: 'offline editiert' })
  assert.equal(res.status, 202); assert.equal((await res.json()).queued, true)
  assert.equal(await q.size(), 1)
})
await t('409 beim Abspielen: Eintrag bleibt, ist als conflict markiert, Event wird gesendet', async () => {
  mode = 'online'; responder = () => json(409, { detail: 'rev-Konflikt', current_rev: 4 })
  const r = await q.flush()
  assert.equal(r.flushed, 0); assert.equal(r.conflicts, 1); assert.equal(r.failed, 0)
  const items = await readQueue()
  assert.equal(items.length, 1)
  assert.equal(items[0].conflict, true); assert.equal(items[0].current_rev, 4)
  assert.equal(JSON.parse(items[0].body).notes, 'offline editiert')   // Payload vollständig erhalten
  assert.equal(events.length, 1); assert.equal(events[0].current_rev, 4)
})
await t('Konflikt-Eintrag wird nicht erneut gesendet', async () => {
  const before = calls.length
  const r = await q.flush()
  assert.equal(calls.length, before); assert.equal(r.conflicts, 0)
  assert.equal((await readQueue()).length, 1)
})
await t('Weitere Einträge laufen trotz Konflikt-Eintrag durch (200 → entfernt)', async () => {
  mode = 'offline'; await q.fetch('/api/users/u1/sessions/2026-10-13', { method: 'PUT', body: '{"notes":"ok"}' })
  assert.equal((await readQueue()).length, 2)
  mode = 'online'; responder = () => json(200, { ok: true })
  const r = await q.flush()
  assert.equal(r.flushed, 1)
  const left = await readQueue(); assert.equal(left.length, 1); assert.equal(left[0].conflict, true)
})
await t('5xx: Eintrag bleibt und wird später erneut versucht (unverändertes Verhalten)', async () => {
  mode = 'offline'; await q.fetch('/api/users/u1/sessions/2026-10-14', { method: 'PUT', body: '{"notes":"später"}' })
  mode = 'online'; responder = () => json(503, { detail: 'down' })
  const r = await q.flush()
  assert.equal(r.failed, 1); assert.equal(r.flushed, 0)
  assert.equal((await readQueue()).filter((i) => !i.conflict).length, 1)
})
await t('4xx außer 409 (z.B. 422): Eintrag wird verworfen (unverändertes Verhalten)', async () => {
  responder = () => json(422, { detail: 'ungültig' })
  const r = await q.flush()
  assert.equal(r.flushed, 1)
  assert.equal((await readQueue()).filter((i) => !i.conflict).length, 0)
})

globalThis.fetch = realFetch
for (const [s, n] of results) console.log(s, n)
const failed = results.filter((r) => r[0] === 'FAIL').length
console.log(`\n${results.length - failed}/${results.length} bestanden`)
process.exit(failed ? 1 : 0)
