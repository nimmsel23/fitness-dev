import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { api } from './core'
import { getDb, isFirebaseConfigured } from '../firebase'

const BACKEND_OVERRIDE = (import.meta.env.VITE_DB_BACKEND || '').toLowerCase()
const USE_FIRESTORE = BACKEND_OVERRIDE
  ? BACKEND_OVERRIDE === 'firestore'
  : isFirebaseConfigured()

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(s) {
  return normalize(s).split(' ').filter(Boolean)
}

function toFrontendExercise(ex) {
  if (!ex) return null
  return {
    ...ex,
    id:               ex.exercise_id || ex.id,
    name:             ex.display_name || ex.german || ex.name || ex.exercise_id,
    displayName:      ex.display_name || ex.name,
    primaryMuscles:   ex.primary_muscles   || ex.primaryMuscles   || [],
    secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
    source:           ex.source || (USE_FIRESTORE ? 'firestore' : 'local_yaml'),
  }
}

function scoreMatch(ex, qNorm, qTokens) {
  const hay = [
    ex.display_name, ex.german, ex.name, ex.exercise_id,
    ...(ex.aliases || []),
    ...(ex.tags    || []),
  ].map(normalize)

  if (hay.some(h => h === qNorm))           return 100
  if (hay.some(h => h.startsWith(qNorm)))   return 80
  if (hay.some(h => h.includes(qNorm)))     return 60
  const everyToken = qTokens.every(t => hay.some(h => h.includes(t)))
  if (everyToken && qTokens.length > 1)     return 50
  const anyToken = qTokens.some(t => hay.some(h => h.includes(t)))
  if (anyToken)                             return 20
  return 0
}

// ── Firestore impl ────────────────────────────────────────────────────────────
let firestoreCache = null

async function loadFirestoreExercises() {
  if (firestoreCache) return firestoreCache
  const db = getDb()
  if (!db) return []
  const snap = await getDocs(collection(db, 'fitness', 'kb', 'exercises'))
  firestoreCache = snap.docs.map(d => ({ ...d.data(), exercise_id: d.data().exercise_id || d.id }))
  return firestoreCache
}

async function searchFirestore(query, limit) {
  let all
  try { all = await loadFirestoreExercises() }
  catch { return { ok: false, source: 'firestore', query, results: [], suggestions: [] } }
  const qNorm = normalize(query)
  const qTokens = tokens(query)
  const scored = (all || [])
    .map(ex => ({ ex, score: scoreMatch(ex, qNorm, qTokens) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => toFrontendExercise(x.ex))
  return {
    ok: true,
    source: 'firestore',
    query,
    results: scored,
    suggestions: scored.slice(0, 3).map(m => ({ canonical_id: m.id, display_name: m.name })),
  }
}

async function getFirestoreById(id) {
  const db = getDb()
  if (!db) return null
  const snap = await getDoc(doc(db, 'fitness', 'kb', 'exercises', id))
  return snap.exists() ? toFrontendExercise({ ...snap.data(), exercise_id: id }) : null
}

// ── Node impl ─────────────────────────────────────────────────────────────────
async function searchNode(query, limit) {
  const data = await api.get(`/fitness/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  const results = (data?.results || []).map(toFrontendExercise)
  return {
    ok: data?.ok !== false,
    source: data?.source || 'local_yaml',
    query,
    results,
    suggestions: data?.suggestions || [],
  }
}

async function getNodeById(id) {
  try {
    const data = await api.get('/fitness/exercises/all')
    const found = (data?.exercises || []).find(e => String(e.exercise_id || e.id) === String(id))
    return found ? toFrontendExercise(found) : null
  } catch { return null }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function searchExercises(query, limit = 12) {
  if (!query || query.length < 1) return { ok: true, results: [], query, suggestions: [] }
  return USE_FIRESTORE ? searchFirestore(query, limit) : searchNode(query, limit)
}

export async function getExerciseById(id) {
  if (!id) return null
  return USE_FIRESTORE ? getFirestoreById(id) : getNodeById(id)
}

export function exerciseBackend() {
  return USE_FIRESTORE ? 'firestore' : 'node'
}
