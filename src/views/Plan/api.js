import { isLocalMode } from '@db'
import { searchExercises as dbSearch } from '@db'

const API_BASE = import.meta.env.VITE_API_BASE || ''

// Routines (Vorlagen) und Workouts (geloggte Instanzen, Strong-Modell) laufen
// bislang nur lokal gegen server.mjs — kein Firestore-Prod-Pendant. Vorherige
// Firestore-only Implementierung (wf_workouts-Collection) ist raus: `db` aus
// `@db` ist im lokalen Dev-Build `null`, jeder Firestore-Call wäre dort
// synchron gecrasht (Plan-SubTab hing bei "Lädt…").
async function localFetch(method, path, body) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`)
  return res.json()
}

const LOCAL_GET = [/^\/routines$/, /^\/routines\/[^/]+$/, /^\/workouts$/, /^\/workouts\/[^/]+$/]
const LOCAL_POST = [/^\/routines$/, /^\/routines\/[^/]+\/exercises$/, /^\/workouts$/, /^\/workouts\/[^/]+\/exercises$/, /^\/workouts\/[^/]+\/exercises\/[^/]+\/sets$/]
const LOCAL_PATCH = [/^\/routines\/[^/]+$/, /^\/routines\/[^/]+\/exercises\/[^/]+$/, /^\/workouts\/[^/]+$/, /^\/workouts\/[^/]+\/exercises\/[^/]+\/sets\/[^/]+$/]
const LOCAL_PUT = [/^\/routines\/[^/]+\/exercises\/order$/, /^\/workouts\/[^/]+\/exercises\/order$/]
const LOCAL_DELETE = [/^\/routines\/[^/]+$/, /^\/routines\/[^/]+\/exercises\/[^/]+$/, /^\/workouts\/[^/]+$/, /^\/workouts\/[^/]+\/exercises\/[^/]+$/, /^\/workouts\/[^/]+\/exercises\/[^/]+\/sets\/[^/]+$/]

function matches(path, patterns) { return patterns.some(p => p.test(path)) }

// Schreibende Routinen/Workout-Calls im Firebase-Build duerfen NICHT wie ein
// Erfolg aussehen (frueher: stiller `{}`-Return) - das liess Uebungen nach dem
// Hinzufuegen kommentarlos verschwinden, weil der folgende GET dann die leere
// emptyShapeFor()-Huelle lieferte. Lieber sichtbar fehlschlagen.
function assertLocalWriteSupported(path) {
  throw new Error(`Plan/Workout-Aenderungen sind in dieser Build-Variante noch nicht verfuegbar (${path}) — nur im lokalen Dev-/Prod-Server.`)
}

// Firebase-Prod-Build hat noch keine Firestore-Implementierung für Routinen/
// Workouts (siehe Kommentar oben) — muss aber trotzdem valide leere Shapes
// liefern statt {}, sonst crasht WorkoutList.jsx ("d.routines.length" auf
// undefined) direkt beim Öffnen des Plan-Tabs (Live-Vorfall 2026-08-12,
// nachdem der lokale Umbau versehentlich auf master deployed wurde).
function emptyShapeFor(path) {
  if (path === '/routines') return { routines: [] }
  if (/^\/routines\/[^/]+$/.test(path)) return { routine: { id: null, name: '', goal: null, exercises: [] } }
  if (path === '/workouts') return { workouts: [] }
  if (/^\/workouts\/[^/]+$/.test(path)) return { workout: { id: null, name: '', exercises: [] } }
  return null
}

export const api = {
  async get(path) {
    if (isLocalMode() && matches(path, LOCAL_GET)) return localFetch('GET', path)

    const fallback = emptyShapeFor(path)
    if (fallback) return fallback

    if (path.startsWith('/exercises')) {
      const q = new URLSearchParams(path.split('?')[1] || '').get('q') || ''
      const res = await dbSearch(q, 12)
      const results = (res?.results || []).map(ex => ({
        id: ex.id || ex.exercise_id,
        name: ex.name || ex.display_name,
        primaryMuscles: ex.primary_muscles || ex.primaryMuscles || [],
        secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
        equipment: ex.equipment,
        yuhonas_id: ex.yuhonas_id || ex.external_ids?.yuhonas?.[0] || null,
      }))
      return { results }
    }

    if (path === '/settings') {
      return { settings: JSON.parse(localStorage.getItem('wf-settings') || '{"yuhonas_enabled":"true","wger_enabled":"false","wger_url":"http://localhost:8000","wger_token":""}') }
    }

    return {}
  },

  async post(path, body) {
    if (matches(path, LOCAL_POST)) {
      if (isLocalMode()) return localFetch('POST', path, body)
      assertLocalWriteSupported(path)
    }

    if (path === '/settings') {
      const cur = JSON.parse(localStorage.getItem('wf-settings') || '{}')
      localStorage.setItem('wf-settings', JSON.stringify({ ...cur, ...body }))
      return { ok: true }
    }

    return {}
  },

  async patch(path, body) {
    if (matches(path, LOCAL_PATCH)) {
      if (isLocalMode()) return localFetch('PATCH', path, body)
      assertLocalWriteSupported(path)
    }
    return {}
  },

  async put(path, body) {
    if (matches(path, LOCAL_PUT)) {
      if (isLocalMode()) return localFetch('PUT', path, body)
      assertLocalWriteSupported(path)
    }
    return {}
  },

  async delete(path) {
    if (matches(path, LOCAL_DELETE)) {
      if (isLocalMode()) return localFetch('DELETE', path)
      assertLocalWriteSupported(path)
    }
    return {}
  },
}
