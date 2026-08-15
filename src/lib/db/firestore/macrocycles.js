import { db } from '../../../firebase.js'
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore'

// Makrozyklen — Firestore-Pendant zu fitness/api/routers/macrocycles.py.
// Collection: fitness/{clientUid}/macrocycles/{id}

export async function listMacrocycles(clientUid) {
  try {
    const ref = collection(db, 'fitness', clientUid, 'macrocycles')
    const snap = await getDocs(query(ref, orderBy('createdAt', 'desc')))
    return snap.docs.map(d => {
      const { weeks, ...rest } = d.data()
      return { id: d.id, ...rest, weekCount: (weeks || []).length }
    })
  } catch (error) {
    console.error('Error listing macrocycles:', error)
    return []
  }
}

export async function getMacrocycle(clientUid, cycleId) {
  try {
    const snap = await getDoc(doc(db, 'fitness', clientUid, 'macrocycles', cycleId))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (error) {
    console.error('Error fetching macrocycle:', error)
    return null
  }
}

const DAYS = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so']
function emptyWeek(weekNr) {
  return { weekNr, days: Object.fromEntries(DAYS.map(d => [d, null])) }
}

export async function createMacrocycle(clientUid, { name, coachUid, weeks }) {
  try {
    const weekCount = Math.max(1, Math.min(Number(weeks) || 1, 52))
    const ref = doc(collection(db, 'fitness', clientUid, 'macrocycles'))
    const record = {
      name,
      clientUid,
      coachUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      weeks: Array.from({ length: weekCount }, (_, i) => emptyWeek(i + 1)),
    }
    await setDoc(ref, record)
    return { id: ref.id, ...record }
  } catch (error) {
    console.error('Error creating macrocycle:', error)
    return null
  }
}

export async function updateMacrocycleWeeks(clientUid, cycleId, weeks) {
  try {
    const ref = doc(db, 'fitness', clientUid, 'macrocycles', cycleId)
    await setDoc(ref, { weeks, updatedAt: new Date().toISOString() }, { merge: true })
    const snap = await getDoc(ref)
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (error) {
    console.error('Error updating macrocycle:', error)
    return null
  }
}

export async function deleteMacrocycle(clientUid, cycleId) {
  try {
    await deleteDoc(doc(db, 'fitness', clientUid, 'macrocycles', cycleId))
    return true
  } catch (error) {
    console.error('Error deleting macrocycle:', error)
    return false
  }
}
