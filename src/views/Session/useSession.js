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
  normalizeExerciseRecord,
} from '@db';
import { localToday } from '@utils';
import { buildSessionCoachSheet } from '../../lib/exerciseInsights.js';
import {
  normalizeSessionGate,
  estimateDurationMinutes,
  sessionHasLoggedWorkout,
} from '../../lib/sessionGate.js';
import { resolveGeoLocation } from '../../lib/geoLocate.js';
import { getRollingDays } from './utils';

const DEFAULT_ACTIVITY = { type: 'hiit', duration: '', notes: '', muscleTarget: 'core', muscles: ['core'] };

// GPS-Fix drinnen (Gym, Beton/Stahl) dauert oft länger als ein knapper
// Timeout erlaubt — jeder Fehler (Timeout, Denial, Unavailable) lief bisher
// still in `resolve(null)`, ohne dass man es je bemerkt hätte (Bug-Fund
// 2026-08-09: sessionGate.gps blieb trotz erteilter Berechtigung null).
// enableHighAccuracy:true + 15s Timeout, Fehlergrund wird zurückgegeben statt
// verschluckt, damit startSessionGate() sichtbares Feedback geben kann.
function getCurrentPosition() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve({ position: null, errorReason: 'unsupported' });
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        position: {
          lat: position.coords?.latitude ?? null,
          lng: position.coords?.longitude ?? null,
          accuracy: position.coords?.accuracy ?? null,
          capturedAt: new Date().toISOString(),
        },
        errorReason: null,
      }),
      (err) => {
        const reason = err?.code === 1 ? 'denied' : err?.code === 3 ? 'timeout' : 'unavailable';
        resolve({ position: null, errorReason: reason });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

const GPS_ERROR_LABELS = {
  denied: 'Standort-Zugriff verweigert',
  timeout: 'Standort-Fix hat zu lange gedauert (drinnen oft schwach)',
  unavailable: 'Standort nicht verfügbar',
  unsupported: 'Standort wird nicht unterstützt',
};


function slugify(name) {
  return String(name || 'exercise')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // Umlaute/Akzente entfernen
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'exercise';
}

export function useSession({ initialDate, initialDraft, recentDays = 7, coverageThreshold = 1.0, onDateChange = null }) {
  const [date, setDateState]        = useState(initialDate || localToday());
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
  const [sessionGate, setSessionGate] = useState(() => normalizeSessionGate(null));
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
  // War fix 30 — Date-Picker konnte nie weiter als 30 Tage zurück, unabhängig
  // von tatsächlich vorhandenen älteren Sessions (Klienten-Bug: Matthias
  // konnte alte Workouts nicht nachloggen). 365 Tage sind nur Datums-Strings,
  // keine Fetches — billig genug, um das Fenster einfach großzügig zu machen.
  const rollingDays = getRollingDays(365);

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
      setHasMoreHistory(sessions.length >= historyLimit);
      const sessByDate = {};
      const pMap = {};
      sessions.forEach(s => {
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
    let normalized = normalizeExerciseRecord(ex);
    let primary = normalized.primaryMuscles;
    let secondary = normalized.secondaryMuscles;
    if (primary.length === 0 && secondary.length === 0 && !ex.isNew) {
      try {
        const kbEx = await getExercise(ex.id || ex.name);
        if (kbEx) {
          normalized = normalizeExerciseRecord({ ...kbEx, ...normalized });
          primary = normalized.primaryMuscles;
          secondary = normalized.secondaryMuscles;
        }
      } catch (e) { console.warn('Could not fetch KB data:', e); }
    }
    const displayName = normalized.displayName;
    // Firestore lehnt undefined-Feldwerte ab (setDoc crasht sonst still im
    // Auto-Save) — bei manuell hinzugefügten, noch nicht im Katalog
    // geführten Übungen (isNew) fehlt id/exercise_id, daher slug-Fallback.
    const id = normalized.id || `inbox_${slugify(displayName)}`;
    setExercises(prev => [...prev, {
      id,
      name: displayName,
      primaryMuscles: primary,
      secondaryMuscles: secondary,
      stabilizers: normalized.stabilizers || [],
      setsArray: [{ reps: '', weight: '' }],
      note: '',
      source: normalized.source || (ex.isNew ? 'inbox' : 'unknown'),
    }]);
    if (normalized.source !== 'expert') queueForEnrichment({ ...normalized, id, name: displayName });
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
    };
    if (nextSessionMode === 'cardio') sessData.activity = nextActivity;
    else if (nextHasActivity && nextActivity?.duration) sessData.activity = nextActivity;
    if (nextSessionGate.startedAt || nextSessionGate.endedAt) sessData.sessionGate = nextSessionGate;
    return sessData;
  }

  async function save(silent = false, overrides = {}) {
    if (!silent) setSaving(true);
    const sessData = buildSessionPayload(overrides);
    try {
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
      if (dateRef.current === savedDate) {
        setDaySessions(list);
        setRecentSessions(prev => {
          const next = { ...prev };
          const primary = list.find(item => item.id === null) || list[0] || null;
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

  async function startSessionGate() {
    const { position: gps, errorReason } = await getCurrentPosition();
    const geo = gps ? await resolveGeoLocation(gps.lat, gps.lng) : null;
    const nextGate = normalizeSessionGate({
      status: 'active',
      startedAt: new Date().toISOString(),
      endedAt: null,
      gps: gps && geo ? { ...gps, label: geo.label, mapsUrl: geo.mapsUrl, source: geo.source } : gps,
    });
    // Vorhandenen manuellen Location-Text nie überschreiben — nur befüllen, wenn leer.
    const nextLocation = (!location.trim() && geo?.label) ? geo.label : undefined;
    setSessionGate(nextGate);
    if (nextLocation) setLocation(nextLocation);
    setDirty(false);
    await save(false, { sessionGate: nextGate, location: nextLocation });
    if (errorReason) {
      showToast(`Workout gestartet · ${GPS_ERROR_LABELS[errorReason] || 'Standort nicht erfasst'}`);
    } else {
      showToast('Workout gestartet');
    }
  }

  async function stopSessionGate() {
    const baseGate = normalizeSessionGate(sessionGate);
    if (!baseGate.startedAt) return;
    const nextGate = normalizeSessionGate({
      status: 'completed',
      startedAt: baseGate.startedAt,
      endedAt: new Date().toISOString(),
    });
    const nextDuration = duration || estimateDurationMinutes(nextGate);
    setSessionGate(nextGate);
    if (nextDuration && nextDuration !== duration) setDuration(nextDuration);
    setDirty(false);
    await save(false, { sessionGate: nextGate, duration: nextDuration });
    showToast('Workout beendet');
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
    trainingsart, setTrainingsart,
    notes, setNotes,
    coachFeedback,
    saving,
    toast,
    quickInput, setQuickInput,
    restHours,
    activity, setActivity,
    hasActivity, setHasActivity,
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
    addEx, addQuick, updateEx, addSet, replaceSets, removeSet, moveEx, removeEx,
    exportObsidian, handleDownload, moveSessionToDate,
    scheduleAutoSave,
  };
}
