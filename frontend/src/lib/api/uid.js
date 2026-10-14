/**
 * Aktive UID im lokalen Modus. Das neue Backend adressiert Nutzer explizit (/api/users/{uid}/…),
 * der alte lokale Modus kannte nur "local" und das Backend riet die UID.
 *
 * Reihenfolge: bewusst gewählt (localStorage 'fitness-active-uid', z.B. Coach-Klientenwechsel)
 *              > VITE_FITNESS_UID > erster Eintrag mit is_coach aus /api/clients.
 */
import { backend } from './client.js'

const KEY = 'fitness-active-uid'
/** @type {string|null} */
let cached = null
/** @type {Promise<string>|null} */
let pending = null

function stored() {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function setActiveUid(uid) {
  cached = uid || null
  pending = null
  try {
    if (uid) localStorage.setItem(KEY, uid)
    else localStorage.removeItem(KEY)
  } catch { /* Storage nicht verfügbar */ }
}

export function getActiveUid() {
  if (cached) return Promise.resolve(cached)
  const explicit = stored() || import.meta.env.VITE_FITNESS_UID
  if (explicit) { cached = explicit; return Promise.resolve(explicit) }
  pending ??= backend.clients().then((clients) => {
    const coach = clients.find((c) => c.is_coach)
    if (!coach) throw new Error('Keine aktive UID: kein Coach in /api/clients und VITE_FITNESS_UID nicht gesetzt.')
    cached = coach.uid
    return coach.uid
  }).finally(() => { pending = null })
  return pending
}
