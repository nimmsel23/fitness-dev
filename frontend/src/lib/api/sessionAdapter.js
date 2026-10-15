/**
 * Brücke zwischen dem alten lokalen DB-Layer (Session je `date` + optionaler `id`, Antworten als
 * {data}/{sessions}) und dem neuen Backend (Dokument-ID `YYYY-MM-DD[__id]`, UID im Pfad).
 *
 * rev-Konfliktschutz: Das Backend lehnt ein PUT mit abweichender Basis-`rev` mit HTTP 409 ab. Der UI-State
 * trägt aber oft die `rev` vom Laden — nach dem eigenen Speichern wäre sie veraltet und der nächste Save
 * würde fälschlich kollidieren. Darum merkt sich dieser Adapter die zuletzt bekannte `rev` je Dokument
 * (nach getSession/saveSession) und nutzt sie als Basis; nur ohne Eintrag zählt die `rev` aus dem State.
 */
import { backend } from './client.js'
import { getActiveUid } from './uid.js'

export const docIdOf = (date, id) => (id ? `${date}__${id}` : date)

/** @type {Map<string, number>} */
const knownRev = new Map()
const key = (uid, docId) => `${uid}/${docId}`

/** Begrenzte Parallelität für N+1-Abrufe (Liste → volle Sessions). */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i], i).catch(() => null)
    }
  })
  await Promise.all(workers)
  return out
}

export async function loadSession(date, id = null) {
  const uid = await getActiveUid()
  const docId = docIdOf(date, id)
  const session = await backend.getSession(uid, docId)
  if (session && typeof session.rev === 'number') knownRev.set(key(uid, docId), session.rev)
  return session
}

export async function persistSession(date, data, id = null) {
  const uid = await getActiveUid()
  const docId = docIdOf(date, id)
  const k = key(uid, docId)
  const body = { ...(data || {}), date }
  const base = knownRev.has(k) ? knownRev.get(k) : data?.rev
  if (base === undefined || base === null) delete body.rev
  else body.rev = base
  const saved = await backend.saveSession(uid, docId, body)   // wirft RevConflictError bei 409
  if (saved && typeof saved.rev === 'number') knownRev.set(k, saved.rev)
  return saved
}

/** Alle Sessions eines Tages (Haupt-Session + Sidecars), als volle Objekte. */
export async function loadSessionsForDate(date) {
  const uid = await getActiveUid()
  const summaries = await backend.listSessions(uid, { since: date, limit: 200 })
  const ids = summaries.filter((s) => s.date === date).map((s) => s.doc_id)
  const full = await mapLimit(ids, 4, (docId) => backend.getSession(uid, docId))
  return full.filter(Boolean)
}

/**
 * Die letzten n Sessions als volle Objekte (neueste zuerst). N+1-Abrufe, weil die Liste nur
 * Zusammenfassungen liefert — Backend-Wunsch: ?full=true (docs/BACKEND-GAPS.md).
 */
export async function loadRecentSessions(n) {
  const uid = await getActiveUid()
  const summaries = await backend.listSessions(uid, { limit: n })
  const full = await mapLimit(summaries, 6, (s) => backend.getSession(uid, s.doc_id))
  return full.filter(Boolean)
}
