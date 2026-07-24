/**
 * useSession — Custom hook for all Session state & handlers.
 *
 * Extracted from the 860-line index.jsx monolith.
 * Keeps the same external contract so SessionEditor can remain thin.
 */

import { useState, useEffect, useRef } from 'react';
import {
  saveSession, getSessionHistory, listSessionsForDate, deleteSession,
  parseQuick, getExercise,
  getCoverageGaps, getPlanSuggestion, exportFitnessData, queueForEnrichment,
} from '@db';
import { localToday } from '@utils';
import { buildSessionCoachSheet } from '../../lib/exerciseInsights.js';
import { getRollingDays } from './utils';

const DEFAULT_ACTIVITY = { type: 'hiit', duration: '', notes: '', muscleTarget: 'core', muscles: ['core'] };

function slugify(name) {
  return String(name || 'exercise')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // Umlaute/Akzente entfernen
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'exercise';
}

export function useSession({ initialDate, initialDraft, recentDays = 7, coverageThreshold = 1.0 }) {
  const [date, setDate]             = useState(initialDate || localToday());
  const [sessionMode, setSessionMode] = useState('strength');
  const [block, setBlock]           = useState('');
  const [exercises, setExercises]   = useState([]);
  const [effort, setEffort]         = useState(5);
  const [location, setLocation]     = useState('');
  const [duration, setDuration]     = useState('');
  const [trainingsart, setTrainingsart] = useState('');
  const [notes, setNotes]           = useState('');
  const [coachFeedback, setCoachFeedback] = useState('');
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [restHours, setRestHours]   = useState(null);
  const [activity, setActivity]     = useState({ ...DEFAULT_ACTIVITY });
  const [hasActivity, setHasActivity] = useState(false);
  const [recentSessions, setRecentSessions] = useState({});
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
  const rollingDays = getRollingDays(30);

  // Ungespeicherte Änderungen sichern, bevor der Editor-State neu geladen wird
  // (Datumswechsel, Session-Wechsel, neues Workout, Unmount). save() liest den
  // State der aktuellen Closure — muss also VOR setDate/loadSessionData laufen.
  function flushDirty() {
    if (autoSaveTimerRef.current) { clearTimeout(autoSaveTimerRef.current); autoSaveTimerRef.current = null; }
    if (dirtyRef.current) { saveRef.current?.(true); setDirty(false); }
  }

  function changeDate(d) {
    flushDirty();
    setDate(d);
  }

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
  };

  const selectSession = (id) => {
    flushDirty();
    setSessionId(id);
    const d = daySessions.find(s => s.id === id);
    if (d) loadSessionData(d);
    else resetSessionData();
  };

  // ── History / prevMap ─────────────────────────────────────────
  useEffect(() => {
    getSessionHistory(60).then(sessions => {
      const sessByDate = {};
      const pMap = {};
      sessions.forEach(s => {
        const existing = sessByDate[s.date];
        if (existing) {
          // mehrere Docs am selben Tag (z.B. Legs + HIIT-Finisher) mergen statt überschreiben
          sessByDate[s.date] = {
            ...existing,
            exercises: [...(existing.exercises || []), ...(s.exercises || [])],
            activity: existing.activity || s.activity,
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
  }, [block, date]);

  // ── Day sessions + hints ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const list = await listSessionsForDate(date);
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

  // ── Toast ─────────────────────────────────────────────────────
  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2200); }

  // ── Exercise handlers ─────────────────────────────────────────
  async function addEx(ex) {
    let primary = ex.primaryMuscles || ex.primary_muscles || [];
    let secondary = ex.secondaryMuscles || ex.secondary_muscles || [];
    if (primary.length === 0 && secondary.length === 0 && !ex.isNew) {
      try {
        const kbEx = await getExercise(ex.id || ex.name);
        if (kbEx) {
          primary = kbEx.primaryMuscles || kbEx.primary_muscles || [];
          secondary = kbEx.secondaryMuscles || kbEx.secondaryMuscles || [];
        }
      } catch (e) { console.warn('Could not fetch KB data:', e); }
    }
    const displayName = ex.display_name || ex.name;
    // Firestore lehnt undefined-Feldwerte ab (setDoc crasht sonst still im
    // Auto-Save) — bei manuell hinzugefügten, noch nicht im Katalog
    // geführten Übungen (isNew) fehlt id/exercise_id, daher slug-Fallback.
    const id = ex.id || ex.exercise_id || `inbox_${slugify(displayName)}`;
    setExercises(prev => [...prev, {
      id,
      name: displayName,
      primaryMuscles: primary,
      secondaryMuscles: secondary,
      setsArray: [{ reps: '', weight: '' }],
      note: '',
      source: ex.source || (ex.isNew ? 'inbox' : 'unknown'),
    }]);
    if (ex.source !== 'expert') queueForEnrichment({ ...ex, id, name: displayName });
    showToast(`+ ${displayName}`);
    setTimeout(() => { saveRef.current?.(true); setDirty(false); }, 0);
  }

  function addQuick() {
    if (!quickInput.trim()) return;
    const ex = parseQuick(quickInput);
    if (ex) {
      setExercises(prev => [...prev, ex]);
      setQuickInput('');
      showToast(`+ ${ex.name}`);
      setTimeout(() => { saveRef.current?.(true); setDirty(false); }, 0);
    }
  }

  function updateEx(i, field, value, setIdx = null) {
    setExercises(prev => prev.map((ex, idx) => {
      if (idx !== i) return ex;
      if (setIdx !== null) {
        const newSets = [...ex.setsArray];
        newSets[setIdx] = { ...newSets[setIdx], [field]: value };
        return { ...ex, setsArray: newSets };
      }
      return { ...ex, [field]: value };
    }));
    scheduleAutoSave();
  }

  function addSet(i) {
    setExercises(prev => prev.map((ex, idx) => {
      if (idx !== i) return ex;
      const last = ex.setsArray[ex.setsArray.length - 1] || {};
      return { ...ex, setsArray: [...ex.setsArray, { reps: last.reps || '', weight: last.weight || '' }] };
    }));
    scheduleAutoSave();
  }

  function replaceSets(i, newSets) {
    setExercises(prev => prev.map((ex, idx) => idx !== i ? ex : { ...ex, setsArray: newSets }));
    scheduleAutoSave();
  }

  function removeSet(i, setIdx) {
    setExercises(prev => prev.map((ex, idx) => {
      if (idx !== i || ex.setsArray.length <= 1) return ex;
      return { ...ex, setsArray: ex.setsArray.filter((_, sIdx) => sIdx !== setIdx) };
    }));
    scheduleAutoSave();
  }

  function moveEx(i, direction) {
    if (i + direction < 0 || i + direction >= exercises.length) return;
    setExercises(prev => {
      const next = [...prev];
      [next[i], next[i + direction]] = [next[i + direction], next[i]];
      return next;
    });
    scheduleAutoSave();
  }

  function removeEx(i) {
    setExercises(prev => prev.filter((_, idx) => idx !== i));
    scheduleAutoSave();
  }

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

  // ── Save ──────────────────────────────────────────────────────
  async function save(silent = false) {
    if (!silent) setSaving(true);
    try {
      const sessData = { block, exercises, effort, location, duration, notes, trainingsart, sessionMode };
      if (sessionMode === 'cardio') sessData.activity = activity;
      else if (hasActivity && activity.duration) sessData.activity = activity;
      setAutoSaveLabel(silent ? 'Auto…' : 'Speichert…');
      await saveSession(date, sessData, sessionId);
      setDirty(false);
      if (silent) {
        setAutoSaveLabel('Auto ✓');
        setTimeout(() => setAutoSaveLabel(''), 2000);
      } else {
        setAutoSaveLabel('');
        showToast('Gespeichert ✓');
      }
    } catch (e) {
      // Silent Auto-Saves zeigten bislang gar keine Fehlermeldung — ein
      // fehlgeschlagener Save (z.B. Firestore-Constraint-Fehler) verschwand
      // komplett unbemerkt. Wenigstens in der Konsole sichtbar machen.
      console.error('Session-Save fehlgeschlagen:', e);
      if (!silent) showToast('Fehler beim Speichern');
      setAutoSaveLabel('');
    } finally {
      if (!silent) setSaving(false);
    }
    // Nur übernehmen, wenn der User nicht inzwischen das Datum gewechselt hat —
    // sonst überschreibt der Nachlauf eines Flush-Saves die frische Tagesliste.
    const savedDate = date;
    listSessionsForDate(savedDate).then(list => {
      if (dateRef.current === savedDate) setDaySessions(list);
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
      // Dirty-Flag löschen, sonst würde der nächste Flush (Tab-/Datumswechsel)
      // die gerade gelöschte Session als leere Datei wieder anlegen.
      setDirty(false);
      showToast('Gelöscht ✓');
      const list = await listSessionsForDate(date);
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
    const newSuffix = String(Date.now());
    setSessionId(newSuffix);
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
    notes, setNotes,
    coachFeedback,
    saving,
    toast,
    quickInput, setQuickInput,
    restHours,
    activity, setActivity,
    hasActivity, setHasActivity,
    recentSessions,
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
    addEx, addQuick, updateEx, addSet, replaceSets, removeSet, moveEx, removeEx,
    exportObsidian, handleDownload, moveSessionToDate,
    scheduleAutoSave,
  };
}
