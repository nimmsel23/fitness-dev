import { useEffect, useState } from 'react';
import * as db from '@db';
import { clearSessionRuntimeDraft } from '../../lib/sessionRuntimeStore.js';
import { moveLogbookSession, sessionId } from './sessionActions.js';

export default function SessionActions({ date, onOpenSession, onChanged }) {
  const [sessions, setSessions] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [target, setTarget] = useState(date);
  useEffect(() => {
    let alive = true;
    db.listSessionsForDate(date).then(items => { if (alive) setSessions(items); })
      .catch(() => { if (alive) setError('Einheiten konnten nicht geladen werden.'); });
    return () => { alive = false; };
  }, [date]);

  async function change(session, remove = false) {
    const id = sessionId(session);
    if (busy || (!remove && (!target || target === date))) return;
    if (remove && !window.confirm('Diese einzelne Trainingseinheit löschen?')) return;
    setBusy(true); setError('');
    try {
      const result = remove ? await db.deleteSession(date, id) : await moveLogbookSession(db, date, id, target);
      clearSessionRuntimeDraft(date, id);
      setSessions(items => items.filter(item => sessionId(item) !== id));
      onChanged({ date, id, session: remove ? null : result.session });
      setEditing(null);
    } catch (err) {
      const messages = {
        'target-occupied': 'Am Zieltag gibt es bereits eine Einheit mit derselben Kennung. Nichts wurde überschrieben.',
        'copied-not-deleted': 'Die Kopie am Zieltag wurde gespeichert, die alte Einheit konnte nicht gelöscht werden. Bitte neu laden.',
      };
      setError(messages[err.code] || err.message || 'Änderung fehlgeschlagen.');
    } finally { setBusy(false); }
  }

  function open(session) {
    try { sessionStorage.setItem('fitness-pending-session-id', sessionId(session) || ''); } catch { /* first session remains the fallback */ }
    onOpenSession?.(date, null, session);
  }

  return <div className="space-y-2 p-3" aria-label={`Einheiten am ${date}`}>
    {error && <p role="alert" className="text-sm">{error}</p>}
    {!sessions && !error && <p role="status">Einheiten laden …</p>}
    {sessions?.map((session, index) => <div key={sessionId(session) || 'main'} className="rounded-xl border p-3" style={{ borderColor: 'var(--line)' }}>
      <div className="mb-2 text-sm font-bold">{session.block || session.trainingsart || `Einheit ${index + 1}`}</div>
      <div className="flex flex-wrap gap-3 text-xs">
        <button type="button" disabled={busy} onClick={() => open(session)}>Bearbeiten</button>
        <button type="button" disabled={busy} onClick={() => { setEditing(index); setTarget(date); }}>Datum ändern</button>
        <button type="button" disabled={busy} onClick={() => change(session, true)}>Löschen</button>
      </div>
      {editing === index && <form className="mt-3 flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); void change(session); }}>
        <input aria-label="Neues Session-Datum" type="date" required value={target} onChange={event => setTarget(event.target.value)} disabled={busy} style={{ color: 'var(--ink)', background: 'var(--bg2)' }} />
        <button disabled={busy || !target || target === date}>Verschieben</button>
        <button type="button" disabled={busy} onClick={() => setEditing(null)}>Abbrechen</button>
      </form>}
    </div>)}
  </div>;
}
