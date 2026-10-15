/**
 * Typisierter Client für das neue Python-Backend (backend/, FastAPI, /api/*).
 *
 * Typen kommen aus ./schema.d.ts (generiert: `pnpm run gen:api`, Quelle ist /openapi.json).
 * Transport: wie lib/db/local/core.js über window.aosOfflineQueue.fetch (Offline-Queue +
 * IDB-Cache für GETs), sonst fetch.
 *
 * Fehler: ApiError (status, detail), bei HTTP 409 auf PUT eine RevConflictError (currentRev).
 */

/** @typedef {import('./schema').components['schemas']['ClientOut']} ClientOut */
/** @typedef {import('./schema').components['schemas']['SessionSummary']} SessionSummary */
/** @typedef {import('./schema').components['schemas']['SyncPullRequest']} SyncPullRequest */
/** @typedef {import('./schema').components['schemas']['SyncPullResult']} SyncPullResult */
/** @typedef {Record<string, any>} Json  Antworten ohne eigenes Schema im Backend (Session, Plan, Auswertung, Katalog) */

const BASE = import.meta.env.VITE_API_BASE || ''

export class ApiError extends Error {
  /**
   * @param {string} method
   * @param {string} path
   * @param {number} status
   * @param {unknown} detail
   */
  constructor(method, path, status, detail) {
    super(`${method} ${path} → ${status}${detail ? `: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}` : ''}`)
    this.name = 'ApiError'
    this.method = method
    this.path = path
    this.status = status
    this.detail = detail
  }
}

/** Session wurde zwischenzeitlich anderswo gespeichert (Backend: HTTP 409, rev weicht ab). */
export class RevConflictError extends ApiError {
  /** @param {string} path @param {unknown} detail @param {number} currentRev */
  constructor(path, detail, currentRev) {
    super('PUT', path, 409, detail)
    this.name = 'RevConflictError'
    this.currentRev = currentRev
    this.message = `Session wurde zwischenzeitlich geändert (gespeichert ist rev ${currentRev}) — bitte neu laden.`
  }
}

function transport() {
  return window.aosOfflineQueue?.fetch ?? fetch
}

/**
 * @param {'GET'|'PUT'|'POST'} method
 * @param {string} path
 * @param {{ query?: Record<string, string|number|boolean|null|undefined>, body?: unknown }} [opts]
 * @returns {Promise<any>}
 */
async function request(method, path, { query, body } = {}) {
  let qs = ''
  if (query) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
    const s = params.toString()
    qs = s ? `?${s}` : ''
  }
  const url = `${BASE}${path}${qs}`
  const init = { method }
  if (method === 'GET') init.cache = 'no-store'
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' }
    init.body = JSON.stringify(body)
  }
  const res = await transport()(url, init)
  const source = res.headers?.get?.('X-Source') || ''
  const fromOffline = source.startsWith('offline')

  // offline-queue.js beantwortet ein GET ohne Netz UND ohne Cache mit einem Platzhalter ({ok:false, offline:true},
  // Status 200). Das ist KEINE Antwort des Backends — als Fehler behandeln, sonst hielte z.B. getSession den
  // Platzhalter für eine echte Session. (offline-cache = echte, zwischengespeicherte Antwort → bleibt gültig.)
  if (source === 'offline-stub') throw new ApiError(method, path, 0, 'offline (kein Netz, kein Cache)')

  if (res.status === 202) return res.json().catch(() => ({ ok: true, queued: true, offline: true }))

  let data = null
  try {
    data = await res.json()
  } catch {
    if (res.ok || fromOffline) return null
  }
  if (!res.ok && !fromOffline) {
    if (res.status === 409 && data && typeof data.current_rev === 'number') {
      throw new RevConflictError(path, data.detail, data.current_rev)
    }
    throw new ApiError(method, path, res.status, data?.detail ?? null)
  }
  return data
}

const enc = encodeURIComponent

export const backend = {
  /** @returns {Promise<Json>} */
  health: () => request('GET', '/api/health'),

  /** @returns {Promise<ClientOut[]>} */
  clients: () => request('GET', '/api/clients'),

  /** @returns {Promise<SessionSummary[]>} neueste zuerst */
  listSessions: (uid, { limit, since } = {}) => request('GET', `/api/users/${enc(uid)}/sessions`, { query: { limit, since } }),
  /** @param {string} docId YYYY-MM-DD oder YYYY-MM-DD__<id> @returns {Promise<Json>} komplette Session */
  getSession: (uid, docId) => request('GET', `/api/users/${enc(uid)}/sessions/${enc(docId)}`),
  /**
   * Ersetzt die Session komplett. `rev` im Body = Basis-Revision (409 bei Abweichung).
   * @returns {Promise<Json>} gespeicherte Session inkl. neuem rev/saved_at
   */
  saveSession: (uid, docId, session) => request('PUT', `/api/users/${enc(uid)}/sessions/${enc(docId)}`, { body: session }),

  weekly: (uid, week = 'current') => request('GET', `/api/users/${enc(uid)}/analytics/weekly`, { query: { week } }),
  coverage: (uid, dateFrom, dateTo) => request('GET', `/api/users/${enc(uid)}/analytics/coverage`, { query: { date_from: dateFrom, date_to: dateTo } }),

  planTemplates: () => request('GET', '/api/plan/templates'),
  /** @param {{template?: string, split?: string, day?: string, goal?: string}} [params] */
  plan: (params = {}) => request('GET', '/api/plan', { query: params }),

  /** @returns {Promise<{results: Json[], total: number}>} */
  searchExercises: (q, limit = 12) => request('GET', '/api/catalog/exercises', { query: { q, limit } }),
  getExercise: (exerciseId) => request('GET', `/api/catalog/exercises/${enc(exerciseId)}`),

  /** @param {SyncPullRequest} body @returns {Promise<SyncPullResult>} */
  syncPull: (body = {}) => request('POST', '/api/sync/pull', { body }),
  syncLog: (query = {}) => request('GET', '/api/sync/log', { query }),
}
