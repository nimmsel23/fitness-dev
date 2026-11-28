import { mergeSessionRuntimeDrafts } from '../../lib/sessionRuntimeStore.js';

export const sessionId = session => session.id ?? session.session_id ?? null;

// Digests and daily aggregates omit fields. Always move the full stored document.
export async function moveLogbookSession(db, date, id, newDate) {
  const sessions = mergeSessionRuntimeDrafts(date, await db.listSessionsForDate(date));
  const session = sessions.find(item => sessionId(item) === id);
  if (!session) throw new Error('Die Einheit existiert nicht mehr. Bitte neu laden.');
  return db.relocateSession(date, id, session, newDate);
}

export function applySessionChange(sessions, { date, id, session = null }) {
  const next = sessions.filter(item => !(item.date === date && sessionId(item) === id));
  return session ? [...next, { ...session, id }] : next;
}
