import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore'
import { db, auth } from '@db'
import { searchExercises as dbSearch } from '@db'

function uid() { return auth.currentUser?.uid }
const wCol = () => collection(db, 'fitness', uid(), 'wf_workouts')
const eCol = (wid) => collection(db, 'fitness', uid(), 'wf_workouts', wid, 'exercises')

export const api = {
  async get(path) {
    if (path === '/workouts') {
      const snap = await getDocs(query(wCol(), orderBy('created_at', 'desc')))
      return { workouts: snap.docs.map(d => ({ id: d.id, ...d.data() })) }
    }

    const workoutMatch = path.match(/^\/workouts\/([^/]+)$/)
    if (workoutMatch) {
      const [, wid] = workoutMatch
      const wSnap = await getDoc(doc(wCol(), wid))
      const eSnap = await getDocs(query(eCol(wid), orderBy('order', 'asc')))
      return { workout: { id: wSnap.id, ...wSnap.data(), exercises: eSnap.docs.map(d => ({ id: d.id, ...d.data() })) } }
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
    if (path === '/workouts') {
      const ref = await addDoc(wCol(), { name: body.name, goal: body.goal || null, created_at: new Date().toISOString() })
      return { id: ref.id }
    }

    const addExMatch = path.match(/^\/workouts\/([^/]+)\/exercises$/)
    if (addExMatch) {
      const [, wid] = addExMatch
      const eSnap = await getDocs(eCol(wid))
      const ref = await addDoc(eCol(wid), {
        exercise_id: body.exercise_id,
        name: body.name || body.exercise_id,
        primaryMuscles: body.primaryMuscles || [],
        secondaryMuscles: body.secondaryMuscles || [],
        yuhonas_id: body.yuhonas_id || null,
        sets: 3, reps: '8-12', rest_seconds: 90,
        weight_type: 'kg', effort: 'normal',
        rir: null, tempo: null, drop_set: false, notes: null,
        order: eSnap.size,
      })
      return { id: ref.id }
    }

    if (path === '/settings') {
      const cur = JSON.parse(localStorage.getItem('wf-settings') || '{}')
      localStorage.setItem('wf-settings', JSON.stringify({ ...cur, ...body }))
      return { ok: true }
    }

    return {}
  },

  async patch(path, body) {
    const exMatch = path.match(/^\/workouts\/([^/]+)\/exercises\/([^/]+)$/)
    if (exMatch) {
      const [, wid, eid] = exMatch
      await updateDoc(doc(eCol(wid), eid), body)
      return { ok: true }
    }
    const wMatch = path.match(/^\/workouts\/([^/]+)$/)
    if (wMatch) {
      await updateDoc(doc(wCol(), wMatch[1]), body)
      return { ok: true }
    }
    return {}
  },

  async put(path, body) {
    const orderMatch = path.match(/^\/workouts\/([^/]+)\/exercises\/order$/)
    if (orderMatch) {
      const [, wid] = orderMatch
      await Promise.all(body.order.map(({ id, order }) => updateDoc(doc(eCol(wid), id), { order })))
      return { ok: true }
    }
    return {}
  },

  async delete(path) {
    const exMatch = path.match(/^\/workouts\/([^/]+)\/exercises\/([^/]+)$/)
    if (exMatch) {
      const [, wid, eid] = exMatch
      await deleteDoc(doc(eCol(wid), eid))
      return { ok: true }
    }
    const wMatch = path.match(/^\/workouts\/([^/]+)$/)
    if (wMatch) {
      await deleteDoc(doc(wCol(), wMatch[1]))
      return { ok: true }
    }
    return {}
  },
}
