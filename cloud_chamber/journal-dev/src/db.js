/**
 * @db — journal-dev Data Layer
 * Alle Funktionen die Journal + Habits Views benötigen.
 * Gleiche API-Signaturen wie fitness-dev/src/lib/db/journal.js + habits.js
 * damit die kopierten View-Komponenten unverändert funktionieren.
 */

const BASE = import.meta.env.VITE_API_BASE || ''

function apiFetch(url, opts) {
  const fn = window.aosOfflineQueue?.fetch ?? fetch
  return fn(url, opts)
}

async function get(path) {
  const res = await apiFetch(BASE + path, { cache: 'no-store' })
  const fromOffline = res.headers?.get?.('X-Source')?.startsWith('offline')
  if (!res.ok && !fromOffline) throw new Error(`GET ${path} → ${res.status}`)
  try { return await res.json() } catch { return null }
}

async function post(path, data) {
  const res = await apiFetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok && res.status !== 202) throw new Error(`POST ${path} → ${res.status}`)
  return res.json()
}

async function del(path) {
  const res = await apiFetch(BASE + path, { method: 'DELETE' })
  if (!res.ok && res.status !== 202) throw new Error(`DELETE ${path} → ${res.status}`)
  return res.json()
}

// ── Utils ─────────────────────────────────────────────────────────────────────

export function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function isLocalMode() { return true }
export function getUid() { return 'local' }
export function watchAuth(cb) { cb?.({ displayName: 'Local', email: 'localhost' }); return () => {} }
export async function signIn() { return { ok: true } }
export async function signOut() { return { ok: true } }

// Stub — journal-dev hat keine Sessions
export async function getSessionHistory() { return [] }

// ── Journal ───────────────────────────────────────────────────────────────────

export async function getJournal(date = localToday()) {
  try {
    const data = await get(`/journal?date=${date}`)
    if (!data?.content) return []
    return [{ id: date, date, text: data.content, time: data.mtime || date }]
  } catch { return [] }
}

export async function getJournalHistory(limitCount = 50) {
  try {
    const data = await get(`/journal/list?limit=${limitCount}`)
    return (data?.entries || []).map(e => ({ id: e.date, date: e.date, text: e.preview }))
  } catch { return [] }
}

export async function saveJournal(date = localToday(), text) {
  const content = String(text || '').trim()
  await post(`/journal?date=${date}`, { content })
  return { id: date, date, text: content, time: new Date().toISOString() }
}

export async function updateJournal(id, text) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(id) ? id : localToday()
  await post(`/journal?date=${date}`, { content: String(text || '').trim() })
  return { ok: true }
}

// Habit-Journal: bleibt localStorage (wie in fitness-dev)
const HJ_KEY = 'journal-dev-habit-journals'
function readHJ() { try { return JSON.parse(localStorage.getItem(HJ_KEY) || '{}') } catch { return {} } }
function writeHJ(d) { try { localStorage.setItem(HJ_KEY, JSON.stringify(d)) } catch {} }

export async function getAllHabitJournalsForDate(date) {
  const journals = readHJ()
  return Object.entries(journals).map(([habitId, items]) => {
    const cur = (Array.isArray(items) ? items : []).find(i => i.date === date)
    return cur ? { id: `${habitId}_${date}`, habitId, ...cur, type: 'habit' } : null
  }).filter(Boolean)
}

export async function getAllHabitJournalsHistory(limitCount = 50) {
  const journals = readHJ()
  const all = []
  Object.entries(journals).forEach(([habitId, items]) => {
    ;(Array.isArray(items) ? items : []).forEach(item =>
      all.push({ id: `${habitId}_${item.date}`, habitId, ...item, type: 'habit' }))
  })
  return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limitCount)
}

// ── Habits ────────────────────────────────────────────────────────────────────

const OVERLAY_KEY = 'journal-dev-habit-overlay'
function readOverlay() { try { return JSON.parse(localStorage.getItem(OVERLAY_KEY) || '{}') } catch { return {} } }
function writeOverlay(d) { try { localStorage.setItem(OVERLAY_KEY, JSON.stringify(d)) } catch {} }

function normalizeRecord(r) {
  const date = r?.date || (r?.epochDay !== undefined
    ? new Date(Number(r.epochDay) * 86400000).toISOString().slice(0, 10) : null)
  if (!date) return null
  return { ...r, date, completion: r?.completion || (r?.done ? 'DONE' : 'MISSED') }
}

function mapHabits(raw) {
  const overlay = readOverlay()
  const habits = Array.isArray(raw) ? raw : raw?.habits || []
  return habits.map(h => {
    const records = (h.records || []).map(normalizeRecord).filter(Boolean)
    const ov = overlay[h.uuid || h.id] || {}
    return {
      uuid: h.uuid || h.id,
      name: ov.name || h.name,
      icon: ov.icon || h.icon || 'Activity',
      deleted: ov.deleted ?? !!h.deleted,
      source: h.source || 'coach',
      records,
      hasRecord: (date) => records.some(x => x.date === date && x.completion === 'DONE'),
    }
  })
}

export async function getHabits() {
  try {
    const data = await get('/habitsync/habits')
    return mapHabits(data).filter(h => !h.deleted)
  } catch { return [] }
}

export async function addHabit(name, icon = 'Activity') {
  return post('/habitsync/add', { name: name.trim(), icon })
}

export async function deleteHabit(uuid) {
  const overlay = readOverlay()
  overlay[uuid] = { ...(overlay[uuid] || {}), deleted: true }
  writeOverlay(overlay)
  return del(`/habitsync/delete/${encodeURIComponent(uuid)}`)
}

export async function recordHabit(uuid) {
  return post(`/habitsync/record/${encodeURIComponent(uuid)}`, {})
}

export async function unrecordHabit(uuid) {
  return post(`/habitsync/record/${encodeURIComponent(uuid)}`, {})
}

export async function updateHabit(uuid, newName, newIcon) {
  const overlay = readOverlay()
  overlay[uuid] = { ...(overlay[uuid] || {}), name: newName, icon: newIcon }
  writeOverlay(overlay)
  return { ok: true }
}

export async function getHabitRecordsForDate(date = localToday()) {
  const habits = await getHabits()
  return habits.filter(h => h.hasRecord(date)).map(h => h.uuid)
}

export async function getHabitJournal(habitId, date) {
  const journals = readHJ()
  return (journals[habitId] || []).find(i => i.date === date) || null
}

export async function getHabitJournalHistory(habitId) {
  const journals = readHJ()
  return (journals[habitId] || []).slice().sort((a, b) => b.date.localeCompare(a.date))
}

export async function saveHabitJournal(habitId, date, text) {
  const journals = readHJ()
  const items = (Array.isArray(journals[habitId]) ? journals[habitId] : []).filter(i => i.date !== date)
  items.unshift({ date, text: String(text || '').trim(), updated_at: new Date().toISOString() })
  journals[habitId] = items
  writeHJ(journals)
  return { ok: true }
}
