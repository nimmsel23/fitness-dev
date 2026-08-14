import { isLocalMode } from '@db'
import { searchExercises as dbSearch } from '@db'
import * as fsRoutines from '../../lib/db/firestore/routines.js'
import * as fsWorkouts from '../../lib/db/firestore/workouts.js'

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

// Firebase-Build: Routinen/Workouts gegen Firestore statt server.mjs.
// Gibt eine Promise zurueck wenn der Pfad erkannt wurde, sonst null (Aufrufer
// faellt dann auf den generischen Fallback zurueck statt stillen No-op).
function firestoreDispatch(method, path, body) {
  let m
  if (method === 'GET') {
    if (path === '/routines') return fsRoutines.listRoutines()
    if ((m = path.match(/^\/routines\/([^/]+)$/))) return fsRoutines.getRoutine(m[1])
    if (path === '/workouts') return fsWorkouts.listWorkouts()
    if ((m = path.match(/^\/workouts\/([^/]+)$/))) return fsWorkouts.getWorkout(m[1])
  }
  if (method === 'POST') {
    if (path === '/routines') return fsRoutines.createRoutine(body)
    if ((m = path.match(/^\/routines\/([^/]+)\/exercises$/))) return fsRoutines.addRoutineExercise(m[1], body)
    if (path === '/workouts') return fsWorkouts.createWorkout(body)
    if ((m = path.match(/^\/workouts\/([^/]+)\/exercises$/))) return fsWorkouts.addWorkoutExercise(m[1], body)
    if ((m = path.match(/^\/workouts\/([^/]+)\/exercises\/([^/]+)\/sets$/))) return fsWorkouts.addSet(m[1], m[2])
  }
  if (method === 'PATCH') {
    if ((m = path.match(/^\/routines\/([^/]+)$/))) return fsRoutines.updateRoutine(m[1], body)
    if ((m = path.match(/^\/routines\/([^/]+)\/exercises\/([^/]+)$/))) return fsRoutines.updateRoutineExercise(m[1], m[2], body)
    if ((m = path.match(/^\/workouts\/([^/]+)$/))) return fsWorkouts.updateWorkout(m[1], body)
    if ((m = path.match(/^\/workouts\/([^/]+)\/exercises\/([^/]+)\/sets\/([^/]+)$/))) return fsWorkouts.updateSet(m[1], m[2], m[3], body)
  }
  if (method === 'PUT') {
    if ((m = path.match(/^\/routines\/([^/]+)\/exercises\/order$/))) return fsRoutines.reorderRoutineExercises(m[1], body.order)
    if ((m = path.match(/^\/workouts\/([^/]+)\/exercises\/order$/))) return fsWorkouts.reorderWorkoutExercises(m[1], body.order)
  }
  if (method === 'DELETE') {
    if ((m = path.match(/^\/routines\/([^/]+)$/))) return fsRoutines.deleteRoutine(m[1])
    if ((m = path.match(/^\/routines\/([^/]+)\/exercises\/([^/]+)$/))) return fsRoutines.deleteRoutineExercise(m[1], m[2])
    if ((m = path.match(/^\/workouts\/([^/]+)$/))) return fsWorkouts.deleteWorkout(m[1])
    if ((m = path.match(/^\/workouts\/([^/]+)\/exercises\/([^/]+)\/sets\/([^/]+)$/))) return fsWorkouts.deleteSet(m[1], m[2], m[3])
    if ((m = path.match(/^\/workouts\/([^/]+)\/exercises\/([^/]+)$/))) return fsWorkouts.deleteWorkoutExercise(m[1], m[2])
  }
  return null
}

export const api = {
  async get(path) {
    if (matches(path, LOCAL_GET)) {
      if (isLocalMode()) return localFetch('GET', path)
      const result = firestoreDispatch('GET', path)
      if (result) return result
    }

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
      const result = firestoreDispatch('POST', path, body)
      if (result) return result
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
      const result = firestoreDispatch('PATCH', path, body)
      if (result) return result
    }
    return {}
  },

  async put(path, body) {
    if (matches(path, LOCAL_PUT)) {
      if (isLocalMode()) return localFetch('PUT', path, body)
      const result = firestoreDispatch('PUT', path, body)
      if (result) return result
    }
    return {}
  },

  async delete(path) {
    if (matches(path, LOCAL_DELETE)) {
      if (isLocalMode()) return localFetch('DELETE', path)
      const result = firestoreDispatch('DELETE', path)
      if (result) return result
    }
    return {}
  },
}
