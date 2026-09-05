/**
 * useSession — Custom hook for all Session state & handlers.
 *
 * Extracted from the 860-line index.jsx monolith, dann selbst zum
 * State-Monolith gewachsen (771 Zeilen) — PHASE3_TODO.md Stück 4 hat die
 * vier fachlich abgrenzbaren Teile in eigene Mini-Hooks ausgelagert:
 * `useExerciseList()`, `useSessionActivity()`, `useSessionSlots()`,
 * `useSessionGateController()` (siehe jeweilige Datei für Details/
 * Interdependenzen). Dieser Haupthook bleibt Koordination: Datum/Session-
 * Auswahl laden & speichern, History/Hints/Autosave, plus die Basis-
 * Session-Felder (block/effort/location/duration/notes/...), die keinem
 * der vier Mini-Hooks eindeutig zuzuordnen sind.
 *
 * Externer Rückgabe-Vertrag bleibt UNVERÄNDERT (SessionEditor.jsx konsumiert
 * ihn per `{...session}`-Spread, siehe views/Session/index.jsx) — reine
 * interne Umorganisation, kein Feature-/Verhaltensunterschied außer der
 * unten dokumentierten Autosave-Race-Klärung.
 */

import { useState, useEffect, useRef } from 'react';
import {
  saveSession, getSessionHistory, listSessionsForDate, deleteSession,
  getCoverageGaps, getPlanSuggestion, exportFitnessData,
} from '@db';
import { localToday } from '@utils';
import { buildSessionCoachSheet } from '../../lib/exerciseInsights.js';
import { normalizeSessionGate, sessionHasLoggedWorkout } from '../../lib/sessionGate.js';
import {
  saveSessionRuntimeDraft,
  clearSessionRuntimeDraft,
  clearQueuedSessionRuntimeDraftsForDate,
  mergeSessionRuntimeDrafts,
  mergeSessionRuntimeDraftsIntoHistory,
} from '../../lib/sessionRuntimeStore.js';
import { getRollingDays } from './utils';
import { useExerciseList } from './useExerciseList.js';
import { useSessionActivity, DEFAULT_ACTIVITY } from './useSessionActivity.js';
import { useSessionSlots } from './useSessionSlots.js';
import { useSessionGateController } from './useSessionGateController.js';

export function useSession({ initialDate, initialDraft, recentDays = 7, coverageThreshold = 1.0, onDateChange = null }) {
  const [date, setDateState]        = useState(initialDate || localToday());
  const [sessionMode, setSessionMode] = useState('strength');
  const [block, setBlock]           = useState('');
  const [effort, setEffort]         = useState(5);
  const [location, setLocation]     = useState('');
  const [duration, setDuration]     = useState('');
  const [trainingsart, setTrainingsart] = useState('');
  const [notes, setNotes]           = useState('');
  const [coachFeedback, setCoachFeedback] = useState('');
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState('');
  const [restHours, setRestHours]   = useState(null);
  const [recentSessions, setRecentSessions] = useState({});
  const [historyLimit, setHistoryLimit] = useState(60);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [hint, setHint]             = useState(null);
  const [gaps, setGaps]             = useState([]);
  const [prevMap, setPrevMap]       = useState({});
  const [daySessions, setDaySessions] = useState([]);
  const [sessionId, setSessionId]   = useState(null);
  const [autoSaveLabel, setAutoSaveLabel] = useState('');
  const [dirty, setDirty]           = useState(false);
  const [showMap, setShowMap]       = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTabSettings, setShowTabSettings] = useState(false);

  // Drag-and-drop state for history view
  const [reDateEntry, setReDateEntry] = useState(null);
  const [draggedDate, setDraggedDate] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  const saveRef = useRef(null);
  const dirtyRef = useRef(false);
  const dateRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  // Race-Guard (PHASE3_TODO.md Stück 4, DB-Layer-Audit-Bugfund): der
  // Draft-Effect unten schreibt bei JEDER relevanten State-Änderung
  // syncState:'local' in den Runtime-Draft — lief bisher unabhängig davon,
  // ob gerade ein echter API-Save (save()) in Flight ist. Ändert sich
  // während eines laufenden Saves noch ein State-Feld (z.B. weitergetippte
  // Notiz), konnte der Draft-Effect ein von save() gerade gesetztes
  // 'saving'/'queued' wieder auf 'local' zurückstufen — kein Datenverlust
  // (der API-Call selbst lief unbeeinflusst weiter), aber ein falscher
  // Sync-Status im Runtime-Draft, der bei einem Reload mitten im Save kurz
  // "unsynced" statt "wird synchronisiert" anzeigen konnte. Guard: Draft-
  // Effect überspringt den Schreibvorgang, solange `savingRef.current`.
  const savingRef = useRef(false);
  // War fix 30 — Date-Picker konnte nie weiter als 30 Tage zurück, unabhängig
  // von tatsächlich vorhandenen älteren Sessions (Klienten-Bug: Matthias
  // konnte alte Workouts nicht nachloggen). 365 Tage sind nur Datums-Strings,
  // keine Fetches — billig genug, um das Fenster einfach großzügig zu machen.
  const rollingDays = getRollingDays(365);

  // ── Toast ─────────────────────────────────────────────────────
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2200); }

  // Debounced Save: reine dirty=true-Markierung hat bislang NICHT automatisch
  // gespeichert — echte Saves liefen nur bei Tab-Wechsel/Datumswechsel/Unmount.
  // Wird die PWA im Hintergrund vom OS gekillt (Handy, Bildschirm aus beim
  // Training), ohne dass diese Events sauber feuern, gingen Änderungen (Sets,
  // Removes) verloren. Jetzt: 1.5s nach der letzten Änderung wird tatsächlich
  // gespeichert, unabhängig von Tab-Lifecycle-Events.
  function scheduleAutoSave() {
    setDirty(true);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveTimerRef.current = null;
      if (dirtyRef.current) { saveRef.current?.(true); setDirty(false); }
    }, 1500);
  }

  // ── Mini-Hooks (PHASE3_TODO.md Stück 4) ─────────────────────────
  const {
    exercises, setExercises, quickInput, setQuickInput,
    addEx, addQuick, updateEx, addSet, replaceSets, removeSet, moveEx, moveExercise, removeEx,
  } = useExerciseList({ scheduleAutoSave, showToast, saveRef, setDirty });

  const {
    activity, setActivity, hasActivity, setHasActivity,
    activityAddons, setActivityAddons, removeActivityAddon,
  } = useSessionActivity({ date });

  const { slots, setSlots, addSlot, removeSlot, updateSlot, reorderSlots } =
    useSessionSlots({ setExercises, scheduleAutoSave });

  const { sessionGate, setSessionGate, startSessionGate, stopSessionGate } =
    useSessionGateController({ location, setLocation, duration, setDuration, save, setDirty, showToast });

  // Ungespeicherte Änderungen sichern, bevor der Editor-State neu geladen wird
  // (Datumswechsel, Session-Wechsel, neues Workout, Unmount). save() liest den
  // State der aktuellen Closure — muss also VOR setDate/loadSessionData laufen.
  function flushDirty() {
    if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }
    if (dirtyRef.current) { saveRef.current?.(true); setDirty(false); }
  }

  function changeDate(d) {
    flushDirty();
    setDateState(d);
    onDateChange?.(d);
  }

  useEffect(() => {
    if (initialDate && initialDate !== date) setDateState(initialDate);
  }, [initialDate, date]);

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

  // ── History / prevMap ─────────────────────────────────────────
  // historyLimit ist stateful (statt fix 60) — SessionHistory.jsx bekommt
  // einen "Mehr laden"-Button, der ihn hochsetzt, weil sowohl die lokale
  // Route als auch die Firestore-Query (`limit(n)`) hart bei n abschneiden,
  // ohne Pagination. Betrifft Firebase-Prod genauso wie lokal (Matthias
  // konnte im Date-Picker/Verlauf nicht weiter als ~60 Sessions zurück).
  useEffect(() => {
    getSessionHistory(historyLimit).then(sessions => {
      const hydratedSessions = mergeSessionRuntimeDraftsIntoHistory(sessions);
      setHasMoreHistory(sessions.length >= historyLimit);
      const sessByDate = {};
      const pMap = {};
      hydratedSessions.forEach(s => {
        const existing = sessByDate[s.date];
        if (existing) {
          // Mehrere Docs am selben Tag (z.B. Legs + HIIT-Finisher im selben Doc
          // gespeichert, aber historisch auf zwei Docs verteilt) mergen statt
          // überschreiben. Eine explizit als eigene Cardio-Session geloggte
          // zweite Session (sessionMode === 'cardio', z.B. ein separat
          // geloggter Spaziergang) ist aber KEIN Finisher der ersten Session —
          // deren activity darf nicht als Finisher-Badge übernommen werden.
          const mainDoc = (existing.exercises?.length > 0) ? existing
            : (s.exercises?.length > 0) ? s : existing;
          const otherDoc = mainDoc === existing ? s : existing;
          const finisherActivity = otherDoc.sessionMode !== 'cardio' ? otherDoc.activity : null;
          sessByDate[s.date] = {
            ...mainDoc,
            exercises: [...(existing.exercises || []), ...(s.exercises || [])],
            activity: mainDoc.activity || finisherActivity,
          };
        } else {
          sessByDate[s.date] = s;
        }
        if (s.date !== date) {
          (s.exercises || []).forEach(ex => {
            if (ex.name && !pMap[ex.name]) {
              pMap[ex.name] = { date: s.date, sets: ex.sets, reps: ex.reps, weight: ex.weight, setsArray: ex.setsArray };
            }
          });
        }
      });
      setRecentSessions(sessByDate);
      setPrevMap(pMap);
      if (block) {
        const lastSame = sessions.find(s => s.date < date && (s.block === block || s.trainingsart === block));
        if (lastSame) {
          const hours = Math.round((new Date(date) - new Date(lastSame.date)) / (1000 * 60 * 60));
          setRestHours(hours);
        } else {
          setRestHours(null);
        }
      }
    }).catch(() => {});
  }, [block, date, historyLimit]);

  function loadMoreHistory() {
    setHistoryLimit(current => current + 60);
  }

  // ── Day sessions + hints ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const list = mergeSessionRuntimeDrafts(date, await listSessionsForDate(date));
        setDaySessions(list);
        if (list.length > 0) {
          const found = list.find(s => s.id === sessionId);
          if (found) { setSessionId(found.id); loadSessionData(found); }
          else { setSessionId(list[0].id); loadSessionData(list[0]); }
        } else {
          setSessionId(null);
          resetSessionData();
        }
      } catch (e) { console.error('Failed to load sessions for date', e); }
    };
    load();
    getPlanSuggestion(date).then(setHint).catch(() => {});
    getCoverageGaps(recentDays, coverageThreshold).then(setGaps).catch(() => {});
  }, [date, recentDays, coverageThreshold]);

  useEffect(() => {
    if (!dirty) return;
    // Guard siehe savingRef-Deklaration oben: kein 'local'-Downgrade während
    // ein echter API-Save (save()) bereits eigene syncState-Updates schreibt.
    if (savingRef.current) return;
    saveSessionRuntimeDraft(date, buildSessionPayload(), sessionId, { syncState: 'local' });
  }, [
    dirty, date, sessionId, block, exercises, effort, location, duration, notes,
    trainingsart, sessionMode, activity, hasActivity, slots, sessionGate,
  ]);

  useEffect(() => {
    function handleQueueFlushed(event) {
      const items = Array.isArray(event?.detail?.items) ? event.detail.items : [];
      const touchedCurrentDate = items.some((item) => {
        if (item?.method !== 'POST') return false;
        const url = String(item?.url || '');
        return url.includes('/session') && url.includes(`date=${date}`);
      });
      if (!touchedCurrentDate) return;
      clearQueuedSessionRuntimeDraftsForDate(date);
      listSessionsForDate(date)
        .then((list) => mergeSessionRuntimeDrafts(date, list))
        .then((list) => {
          if (dateRef.current !== date) return;
          setDaySessions(list);
          const current = list.find((session) => session.id === sessionId) || list[0] || null;
          if (current) {
            setSessionId(current.id);
            loadSessionData(current);
          }
        })
        .catch(() => {});
    }
    window.addEventListener('fitness:queue-flushed', handleQueueFlushed);
    return () => window.removeEventListener('fitness:queue-flushed', handleQueueFlushed);
  }, [date, sessionId]);

  // ── Save ──────────────────────────────────────────────────────
  function buildSessionPayload(overrides = {}) {
    const nextSessionMode = overrides.sessionMode ?? sessionMode;
    const nextActivity = overrides.activity ?? activity;
    const nextHasActivity = overrides.hasActivity ?? hasActivity;
    const nextSessionGate = normalizeSessionGate(overrides.sessionGate ?? sessionGate);
    const sessData = {
      block,
      exercises,
      effort,
      location: overrides.location ?? location,
      duration: overrides.duration ?? duration,
      notes,
      trainingsart,
      sessionMode: nextSessionMode,
      slots,
    };
    if (nextSessionMode === 'cardio') sessData.activity = nextActivity;
    else if (nextHasActivity && nextActivity?.duration) sessData.activity = nextActivity;
    if (nextSessionGate.startedAt || nextSessionGate.endedAt) sessData.sessionGate = nextSessionGate;
    return sessData;
  }

  async function save(silent = false, overrides = {}) {
    if (!silent) setSaving(true);
    savingRef.current = true;
    const savedDate = date;
    const savedSessionId = sessionId;
    const sessData = buildSessionPayload(overrides);
    try {
      saveSessionRuntimeDraft(savedDate, sessData, savedSessionId, { syncState: 'saving' });
      setAutoSaveLabel(silent ? 'Auto…' : 'Speichert…');
      const result = await saveSession(savedDate, sessData, savedSessionId);
      setDirty(false);
      if (result?.queued || result?.offline) {
        saveSessionRuntimeDraft(savedDate, sessData, savedSessionId, { syncState: 'queued' });
      } else {
        clearSessionRuntimeDraft(savedDate, savedSessionId);
      }
      if (silent) {
        if (result?.queued || result?.offline) setAutoSaveLabel('Offline ✓');
        else setAutoSaveLabel(result?.sqliteSync === false ? 'Auto ⚠' : 'Auto ✓');
        setTimeout(() => setAutoSaveLabel(''), 2000);
      } else {
        setAutoSaveLabel('');
        // JSON-Save war in jedem Fall erfolgreich (sonst wäre saveSession()
        // geworfen) — sqliteSync:false meldet nur eine verzögerte SQLite-
        // Spiegelung (Python-Backend kurzzeitig nicht erreichbar), kein
        // Datenverlust. Kein Fehler-Toast, nur ein schwächerer Hinweis.
        if (result?.queued || result?.offline) showToast('Offline gespeichert ✓ · Sync ausstehend');
        else showToast(result?.sqliteSync === false ? 'Gespeichert ✓ (Sync verzögert)' : 'Gespeichert ✓');
      }
    } catch (e) {
      // Silent Auto-Saves zeigten bislang gar keine Fehlermeldung — ein
      // fehlgeschlagener Save (z.B. Firestore-Constraint-Fehler) verschwand
      // komplett unbemerkt. Wenigstens in der Konsole sichtbar machen.
      console.error('Session-Save fehlgeschlagen:', e);
      saveSessionRuntimeDraft(savedDate, sessData, savedSessionId, { syncState: 'error' });
      if (!silent) showToast('Fehler beim Speichern');
      setAutoSaveLabel('');
    } finally {
      if (!silent) setSaving(false);
      savingRef.current = false;
    }
    // Nur übernehmen, wenn der User nicht inzwischen das Datum gewechselt hat —
    // sonst überschreibt der Nachlauf eines Flush-Saves die frische Tagesliste.
    listSessionsForDate(savedDate).then(list => {
      const hydratedList = mergeSessionRuntimeDrafts(savedDate, list);
      if (dateRef.current === savedDate) {
        setDaySessions(hydratedList);
        setRecentSessions(prev => {
          const next = { ...prev };
          const primary = hydratedList.find(item => item.id === null) || hydratedList[0] || null;
          if (primary && sessionHasLoggedWorkout(primary)) next[savedDate] = primary;
          else delete next[savedDate];
          return next;
        });
      }
    }).catch(() => {});
    getCoverageGaps(recentDays, coverageThreshold).then(setGaps).catch(() => {});
  }

  saveRef.current = save;
  dirtyRef.current = dirty;
  dateRef.current = date;

  // Flush on tab-hide / page-unload / unmount (Haupt-Tab-Wechsel)
  useEffect(() => {
    function flush() {
      if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }
      if (dirtyRef.current) { saveRef.current?.(true); setDirty(false); }
    }
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

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

  return {
    // State
    date, setDate: changeDate,
    sessionMode, setSessionMode,
    block, setBlock,
    exercises,
    effort, setEffort,
    location, setLocation,
    duration, setDuration,
    trainingsart, setTrainingsart,
    notes, setNotes,
    coachFeedback,
    saving,
    toast, showToast,
    quickInput, setQuickInput,
    restHours,
    activity, setActivity,
    hasActivity, setHasActivity,
    activityAddons, removeActivityAddon,
    slots, addSlot, removeSlot, updateSlot, reorderSlots,
    sessionGate, setSessionGate,
    recentSessions,
    hasMoreHistory, loadMoreHistory,
    hint, gaps,
    prevMap,
    daySessions,
    sessionId,
    autoSaveLabel,
    dirty,
    showMap, setShowMap,
    showSidebar, setShowSidebar,
    showTabSettings, setShowTabSettings,
    reDateEntry, setReDateEntry,
    draggedDate, setDraggedDate,
    dragOverDate, setDragOverDate,
    rollingDays,
    // Handlers
    save, selectSession, handleNewSession, handleDeleteSession,
    startSessionGate, stopSessionGate,
    addEx, addQuick, updateEx, addSet, replaceSets, removeSet, moveEx, moveExercise, removeEx,
    exportObsidian, handleDownload, moveSessionToDate,
    scheduleAutoSave,
    // Gebündelte Übungs-Mutations-Handler + Quick-Input-State für
    // ExerciseList/SessionSlots (vorher 11 einzeln durchgereichte Props,
    // siehe PHASE3_TODO.md Stück 2). Einzel-Exports oben bleiben bestehen,
    // falls andere Aufrufer sie direkt brauchen.
    exerciseOps: {
      updateEx, addSet, removeSet, removeEx, replaceSets, moveEx,
      addEx, quickInput, setQuickInput, addQuick, onToast: showToast,
    },
  };
}
