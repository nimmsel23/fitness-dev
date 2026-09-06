/**
 * useSessionCrud — Load/Reset/Select/Delete/New-Session-Handler, aus
 * useSession.js herausgelöst (PHASE3_TODO.md Stück 4, Fortsetzung
 * 2026-09-06, rein mechanisch, keine Logik/Werte verändert).
 *
 * `loadSessionData()`/`resetSessionData()` hängen stark von den Settern
 * der anderen Mini-Hooks ab (`setActivity`/`setHasActivity`/
 * `setActivityAddons` aus useSessionActivity.js, `setSlots` aus
 * useSessionSlots.js, `setSessionGate` aus useSessionGateController.js) —
 * werden deshalb als Parameter-Objekt hereingereicht statt hier erneut
 * importiert/instanziiert (keine zweite Instanz dieser Mini-Hooks).
 * `setRecentSessions` (aus useSessionHistory.js) wird von
 * `handleDeleteSession()` gebraucht, um den DateStrip-Indikator direkt
 * nach dem Löschen zu aktualisieren, ohne auf den nächsten History-Fetch
 * zu warten.
 *
 * `DEFAULT_ACTIVITY` kommt bewusst aus useSessionActivity.js (Single
 * Source), nicht als eigene Kopie hier.
 */

import { deleteSession, listSessionsForDate } from '@db';
import { normalizeSessionGate } from '../../lib/sessionGate.js';
import { clearSessionRuntimeDraft, mergeSessionRuntimeDrafts } from '../../lib/sessionRuntimeStore.js';
import { DEFAULT_ACTIVITY } from './useSessionActivity.js';

export function useSessionCrud({
  date, sessionId, setSessionId, daySessions, setDaySessions, setRecentSessions,
  setDirty, flushDirty, showToast, initialDraft,
  setBlock, setExercises, setEffort, setLocation, setDuration, setNotes,
  setCoachFeedback, setTrainingsart, setSessionMode,
  setActivity, setHasActivity, setActivityAddons,
  setSlots, setSessionGate,
}) {
  // ── Load / Reset ─────────────────────────────────────────────
  const loadSessionData = (d) => {
    setBlock(d.block || '');
    setExercises(d.exercises || []);
    setEffort(d.effort ?? 5);
    setLocation(d.location || '');
    setDuration(d.duration || '');
    setNotes(d.notes || '');
    setCoachFeedback(d.coachFeedback || '');
    setTrainingsart(d.trainingsart || '');
    if (d.sessionMode) {
      setSessionMode(d.sessionMode);
    } else if (d.activity && !(d.exercises?.length)) {
      setSessionMode('cardio');
    } else {
      setSessionMode('strength');
    }
    if (d.activity) {
      setActivity({ ...DEFAULT_ACTIVITY, ...d.activity });
      if (d.sessionMode !== 'cardio') setHasActivity(true);
      else setHasActivity(false);
    } else {
      setActivity({ ...DEFAULT_ACTIVITY });
      setHasActivity(false);
    }
    setActivityAddons(Array.isArray(d.activityAddons) ? d.activityAddons : []);
    setSlots(Array.isArray(d.slots) ? d.slots : []);
    setSessionGate(normalizeSessionGate(d.sessionGate));
  };

  const resetSessionData = () => {
    setBlock(initialDraft?.block || '');
    setExercises(initialDraft?.exercises || []);
    setEffort(5);
    setLocation('');
    setDuration('');
    setNotes('');
    setCoachFeedback('');
    setTrainingsart('');
    setSessionMode('strength');
    setActivity({ ...DEFAULT_ACTIVITY });
    setHasActivity(false);
    setActivityAddons([]);
    setSlots([]);
    setSessionGate(normalizeSessionGate(null));
  };

  const selectSession = (id) => {
    flushDirty();
    setSessionId(id);
    const d = daySessions.find(s => s.id === id);
    if (d) loadSessionData(d);
    else resetSessionData();
  };

  // ── Delete session ────────────────────────────────────────────
  async function handleDeleteSession() {
    if (!window.confirm('Dieses Workout wirklich löschen?')) return;
    try {
      await deleteSession(date, sessionId);
      clearSessionRuntimeDraft(date, sessionId);
      // Dirty-Flag löschen, sonst würde der nächste Flush (Tab-/Datumswechsel)
      // die gerade gelöschte Session als leere Datei wieder anlegen.
      setDirty(false);
      showToast('Gelöscht ✓');
      const list = mergeSessionRuntimeDrafts(date, await listSessionsForDate(date));
      setDaySessions(list);
      // DateStrip-Indikator aktualisieren: ohne Refresh bliebe der ✓-Haken stehen.
      setRecentSessions(prev => {
        const next = { ...prev };
        if (list.length > 0) next[date] = list[0];
        else delete next[date];
        return next;
      });
      if (list.length > 0) { setSessionId(list[0].id); loadSessionData(list[0]); }
      else { setSessionId(null); resetSessionData(); }
    } catch { showToast('Fehler beim Löschen'); }
  }

  function handleNewSession() {
    flushDirty();
    // crypto.randomUUID() statt Date.now(): kollisionsfrei bei zwei
    // Geräten/Tabs, die im selben Millisekunden-Fenster eine Zusatz-Session
    // für denselben Tag starten (sonst gleicher Dateiname, eine überschreibt
    // die andere). Fallback für Nicht-HTTPS/Nicht-localhost-Kontexte, wo
    // crypto.randomUUID fehlt (gleiches Muster wie lib/db/firestore/workouts.js).
    const newSuffix = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setSessionId(newSuffix);
    clearSessionRuntimeDraft(date, newSuffix);
    resetSessionData();
    setDaySessions(prev => [...prev, { id: newSuffix, block: 'Neues Workout', exercises: [], saved_at: new Date().toISOString() }]);
  }

  return { loadSessionData, resetSessionData, selectSession, handleDeleteSession, handleNewSession };
}
