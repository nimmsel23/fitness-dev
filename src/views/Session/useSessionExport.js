/**
 * useSessionExport — Obsidian-/Markdown-Export + Move-Session-Between-Dates,
 * aus useSession.js herausgelöst (PHASE3_TODO.md Stück 4, Fortsetzung
 * 2026-09-06, rein mechanisch, keine Logik/Werte verändert).
 *
 * Vergleichsweise isoliert — braucht nur die Basis-Session-Felder
 * (date/block/exercises/effort/location/duration/notes), `recentSessions`/
 * `setRecentSessions` (aus useSessionHistory.js, für den DateStrip-Cache
 * beim Verschieben) und `setReDateEntry`/`showToast`.
 *
 * Hinweis (bewusst NICHT vereinheitlicht): `moveSessionToDate()` ruft
 * `deleteSession(oldDate)` ohne expliziten sessionId-Parameter auf, anders
 * als `handleDeleteSession()` in useSessionCrud.js
 * (`deleteSession(date, sessionId)`) — dieser Unterschied stand schon vor
 * dem Split so im Code und wurde 1:1 übernommen, nicht angeglichen.
 */

import { saveSession, deleteSession, exportFitnessData } from '@db';
import { buildSessionCoachSheet } from '../../lib/exerciseInsights.js';
import { clearSessionRuntimeDraft } from '../../lib/sessionRuntimeStore.js';

export function useSessionExport({
  date, block, exercises, effort, location, duration, notes,
  recentSessions, setRecentSessions, setReDateEntry, showToast,
}) {
  // ── Exports ───────────────────────────────────────────────────
  async function exportObsidian() {
    try {
      const result = await exportFitnessData({ kind: 'session', session: { date, block, exercises, effort, location, duration, notes }, force: true });
      showToast(result?.path ? `Export: ${result.path}` : 'Exportiert');
    } catch { showToast('Export fehlgeschlagen'); }
  }

  function handleDownload() {
    const md = buildSessionCoachSheet({ date, block, exercises, effort, location, duration, notes });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fitness-session-${date}.md`; a.click();
    URL.revokeObjectURL(url);
  }

  // ── History: move session between dates ───────────────────────
  async function moveSessionToDate(oldDate, newDate) {
    if (!newDate || newDate === oldDate) { setReDateEntry(null); return; }
    const sess = recentSessions[oldDate];
    if (!sess) return;
    await saveSession(newDate, { ...sess, date: newDate });
    await deleteSession(oldDate);
    clearSessionRuntimeDraft(oldDate, sess.id || null);
    setRecentSessions(prev => {
      const next = { ...prev, [newDate]: { ...sess, date: newDate } };
      delete next[oldDate];
      return next;
    });
    setReDateEntry(null);
    showToast(`Verschoben → ${newDate}`);
  }

  return { exportObsidian, handleDownload, moveSessionToDate };
}
