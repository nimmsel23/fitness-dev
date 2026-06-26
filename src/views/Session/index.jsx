import { useState, useEffect, useRef } from 'react';
import {
  saveSession, getSessionHistory, listSessionsForDate, deleteSession,
  parseQuick, getExercise,
  getCoverageGaps, getPlanSuggestion, exportFitnessData, queueForEnrichment,
} from '@db';
import { localToday } from '@utils';
import { buildSessionCoachSheet } from '../../lib/exerciseInsights.js';

import { Save, Zap, Trash2, Dumbbell, Activity, History, Timer, ChevronRight, Calendar, Check, X as XIcon } from 'lucide-react';
import DateHeader from './DateHeader';
import ExerciseSection from './ExerciseSection';
import ActivitySection from './ActivitySection';
import ActivityAddon from './ActivityAddon';
import SidebarSheet from './SidebarSheet';
import MuscleMapModal from './MuscleMapModal';
import SourceSettingsModal from './SourceSettingsModal';
import { getRollingDays, blockColor } from './utils';
import { ACTIVITY_LABELS, ACTIVITY_ICONS, ACTIVITY_EMOJI } from '../../constants/ActivityConstants';

// Session mode: 'strength' (Krafttraining) or 'cardio' (Ausdauer/Activity)
const SESSION_MODES = [
  { value: 'strength', label: 'Krafttraining', icon: Dumbbell, color: 'accent' },
  { value: 'cardio',   label: 'Ausdauer',      icon: Activity,  color: 'orange' },
];

export default function Session({ initialDate, initialDraft, onInspectExercise, onOpenSession, recentDays = 7, coverageThreshold = 1.0, subTab }) {
  const [date, setDate]           = useState(initialDate || localToday());
  const [sessionMode, setSessionMode] = useState('strength');
  const [block, setBlock]         = useState('');
  const [exercises, setExercises] = useState([]);
  const [effort, setEffort]       = useState(5);
  const [location, setLocation]   = useState('');
  const [duration, setDuration]   = useState('');
  const [trainingsart, setTrainingsart] = useState('');
  const [notes, setNotes]         = useState('');
  const [coachFeedback, setCoachFeedback] = useState('');
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [restHours, setRestHours]   = useState(null);
  const [activity, setActivity]   = useState({ type: 'running', duration: '', notes: '', muscleTarget: 'legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] });
  // hasActivity: true when a cardio ADDON is attached to a strength session
  // (different from sessionMode==='cardio' where activity IS the session)
  const [hasActivity, setHasActivity] = useState(false);
  const [recentSessions, setRecentSessions] = useState({});
  const [hint, setHint]           = useState(null);
  const [gaps, setGaps]           = useState([]);
  const [showMap, setShowMap]         = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTabSettings, setShowTabSettings] = useState(false);

  const [prevMap, setPrevMap]       = useState({});
  const [daySessions, setDaySessions] = useState([]);
  const [reDateEntry, setReDateEntry]   = useState(null);  // { d, value } while picker is open
  const [draggedDate, setDraggedDate]   = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [autoSaveLabel, setAutoSaveLabel] = useState('');

  const saveRef = useRef(null);

  const rollingDays = getRollingDays(30);

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
      // Legacy: session has activity but no exercises → was pure cardio
      setSessionMode('cardio');
    } else {
      setSessionMode('strength');
    }
    if (d.activity) {
      setActivity({ type: 'hiit', duration: '', notes: '', muscleTarget: 'core', muscles: ['core'], ...d.activity });
      // In strength mode, activity is an addon → set hasActivity
      if (d.sessionMode !== 'cardio') setHasActivity(true);
      else setHasActivity(false);
    } else {
      setActivity({ type: 'hiit', duration: '', notes: '', muscleTarget: 'core', muscles: ['core'] });
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
    setActivity({ type: 'hiit', duration: '', notes: '', muscleTarget: 'core', muscles: ['core'] });
    setHasActivity(false);
  };

  const selectSession = (id) => {
    setSessionId(id);
    const d = daySessions.find(s => s.id === id);
    if (d) {
      loadSessionData(d);
    } else {
      resetSessionData();
    }
  };

  useEffect(() => {
    getSessionHistory(60).then(sessions => {
      const sessByDate = {};
      const pMap = {};
      
      sessions.forEach(s => { 
        sessByDate[s.date] = s;
        // Build prevMap for exercises
        if (s.date !== date) {
          (s.exercises || []).forEach(ex => {
            if (ex.name && !pMap[ex.name]) {
              pMap[ex.name] = { 
                date: s.date, 
                sets: ex.sets, 
                reps: ex.reps, 
                weight: ex.weight,
                setsArray: ex.setsArray // Support modular sessions too
              };
            }
          });
        }
      });
      
      setRecentSessions(sessByDate);
      setPrevMap(pMap);
      
      if (block) {
        const lastSameBlock = sessions.find(s => s.date < date && (s.block === block || s.trainingsart === block));
        if (lastSameBlock) {
          const d1 = new Date(date);
          const d2 = new Date(lastSameBlock.date);
          const hours = Math.round((d1 - d2) / (1000 * 60 * 60));
          setRestHours(hours);
        } else {
          setRestHours(null);
        }
      }
    }).catch(() => {});
  }, [block, date]);

  useEffect(() => {
    const listSessions = async () => {
      try {
        const list = await listSessionsForDate(date);
        setDaySessions(list);
        if (list.length > 0) {
          const found = list.find(s => s.id === sessionId);
          if (found) {
            setSessionId(found.id);
            loadSessionData(found);
          } else {
            setSessionId(list[0].id);
            loadSessionData(list[0]);
          }
        } else {
          setSessionId(null);
          resetSessionData();
        }
      } catch (e) {
        console.error("Failed to load sessions for date", e);
      }
    };
    listSessions();
    
    // Local Intelligence: Fetch Plan and Gaps
    getPlanSuggestion(date).then(setHint).catch(() => {});
    getCoverageGaps(recentDays, coverageThreshold).then(setGaps).catch(() => {});
  }, [date, recentDays, coverageThreshold]);

  const doneExercises = exercises;

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2200); }

  async function addEx(ex) {
    let primary = ex.primaryMuscles || ex.primary_muscles || [];
    let secondary = ex.secondaryMuscles || ex.secondary_muscles || [];

    if (primary.length === 0 && secondary.length === 0) {
      try {
        const kbEx = await getExercise(ex.id || ex.name);
        if (kbEx) {
          primary = kbEx.primaryMuscles || kbEx.primary_muscles || [];
          secondary = kbEx.secondaryMuscles || kbEx.secondary_muscles || [];
        }
      } catch (e) {
        console.warn("Could not fetch KB data for muscle tags:", e);
      }
    }

    setExercises(prev => [...prev, {
      id: ex.id || ex.exercise_id,
      name: ex.display_name || ex.name,
      primaryMuscles: primary,
      secondaryMuscles: secondary,
      setsArray: [{reps: '', weight: ''}],
      note: '',
      source: ex.source
    }]);

    if (ex.source !== 'expert') queueForEnrichment(ex);
    showToast(`+ ${ex.display_name || ex.name}`);
    // Übung hinzufügen → sofort persistieren (nicht warten bis Tab-Hide)
    setTimeout(() => { saveRef.current(true); setDirty(false); }, 0);
  }

  function addQuick() {
    if (!quickInput.trim()) return;
    const ex = parseQuick(quickInput);
    if (ex) {
      setExercises(prev => [...prev, ex]);
      setQuickInput('');
      showToast(`+ ${ex.name}`);
      setTimeout(() => { saveRef.current(true); setDirty(false); }, 0);
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
    setExercises(prev => prev.map((ex, idx) => {
      if (idx !== i) return ex;
      return { ...ex, setsArray: newSets };
    }));
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
      const temp = next[i];
      next[i] = next[i + direction];
      next[i + direction] = temp;
      return next;
    });
    scheduleAutoSave();
  }

  function removeEx(i) {
    setExercises(prev => prev.filter((_, idx) => idx !== i));
    scheduleAutoSave();
  }

  async function save(silent = false) {
    // Auto-saves laufen lautlos im Hintergrund — der Save-Button-Spinner ist
    // nur für manuelle Klicks. Sonst bleibt er bei jeder Tastatureingabe an
    // und wirkt wie ein permanenter Lade-Zustand.
    if (!silent) setSaving(true);
    try {
      const sessData = { block, exercises, effort, location, duration, notes, trainingsart, sessionMode };
      // Cardio mode: activity is the whole session
      // Strength mode: activity is an optional addon (only save if hasActivity)
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
    } catch { if (!silent) showToast('Fehler beim Speichern'); setAutoSaveLabel(''); }
    finally { if (!silent) setSaving(false); }

    // Reload nach Save — out of try, damit ein hängender Firestore-Read
    // (listSessionsForDate / getCoverageGaps) den Save-Button nicht blockiert.
    listSessionsForDate(date).then(setDaySessions).catch(() => {});
    getCoverageGaps(recentDays, coverageThreshold).then(setGaps).catch(() => {});
  }

  // Always keep saveRef current so debounced auto-save uses fresh closures
  saveRef.current = save;

  // Dirty-State: True wenn Änderungen ungespeichert sind. Auto-Save schreibt
  // nur einmal pro Tab-Hide / Page-Unload statt nach jedem Tastendruck —
  // schont Firestore-Quota (Free-Tier 20k Writes/Tag).
  const [dirty, setDirty] = useState(false);

  function scheduleAutoSave() {
    setDirty(true);
  }

  // Save beim Tab-Wechsel / Tab-Hide
  useEffect(() => {
    function flush() {
      if (dirty) { saveRef.current(true); setDirty(false); }
    }
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, [dirty]);

  async function handleDeleteSession() {
    if (!window.confirm("Dieses Workout wirklich löschen?")) return;
    try {
      await deleteSession(date, sessionId);
      showToast('Gelöscht ✓');
      const list = await listSessionsForDate(date);
      setDaySessions(list);
      if (list.length > 0) {
        setSessionId(list[0].id);
        loadSessionData(list[0]);
      } else {
        setSessionId(null);
        resetSessionData();
      }
    } catch {
      showToast('Fehler beim Löschen');
    }
  }

  function handleNewSession() {
    const newSuffix = String(Date.now());
    setSessionId(newSuffix);
    resetSessionData();
    setDaySessions(prev => [
      ...prev,
      {
        id: newSuffix,
        block: 'Neues Workout',
        exercises: [],
        saved_at: new Date().toISOString()
      }
    ]);
  }

  async function exportObsidian() {
    try {
      const result = await exportFitnessData({
        kind: 'session',
        session: { date, block, exercises, effort, location, duration, notes },
        force: true,
      })
      showToast(result?.path ? `Export: ${result.path}` : 'Exportiert')
    } catch {
      showToast('Export fehlgeschlagen')
    }
  }

  function handleDownload() {
    const md = buildSessionCoachSheet({ date, block, exercises, effort, location, duration, notes });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-session-${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

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

  if (subTab === 'history') {
    const today_ = localToday();
    const DAY_SHORT = ['So','Mo','Di','Mi','Do','Fr','Sa'];
    const MON_SHORT = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

    // Build 10 calendar weeks (newest first), Mon–Sun per week
    const todayObj = new Date(today_ + 'T12:00:00');
    const dow0 = todayObj.getDay();
    const thisMonday = new Date(todayObj);
    thisMonday.setDate(todayObj.getDate() - (dow0 === 0 ? 6 : dow0 - 1));
    thisMonday.setHours(0, 0, 0, 0);

    const weekGroups = Array.from({ length: 10 }, (_, w) => {
      const monday = new Date(thisMonday);
      monday.setDate(thisMonday.getDate() - w * 7);
      // Mon–Sun, filter out future days, newest first
      const allDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d.toISOString().slice(0, 10);
      }).filter(d => d <= today_).reverse();

      const hasSessions = allDays.some(d => recentSessions[d]?.exercises?.length > 0 || recentSessions[d]?.activity);

      // Streak: days to show = all days between first and last session of the week
      // (rest days in between are included; days after last session are hidden unless current week)
      let visibleDays;
      if (w === 0) {
        // Current week: always show all days up to today (drop targets for today/yesterday)
        visibleDays = allDays;
      } else if (hasSessions) {
        const sessionDays = allDays.filter(d => recentSessions[d]?.exercises?.length > 0 || recentSessions[d]?.activity);
        const oldest = sessionDays[sessionDays.length - 1];
        const newest = sessionDays[0];
        // Include all days in the streak window (oldest..newest within week)
        visibleDays = allDays.filter(d => d >= oldest && d <= newest);
      } else {
        visibleDays = []; // empty week: no day rows
      }

      // KW label
      const jan4 = new Date(monday.getFullYear(), 0, 4);
      const kw = Math.max(1, Math.floor(((monday - jan4) / 86400000 + jan4.getDay() + 1) / 7));
      const label = w === 0 ? 'Diese Woche' : w === 1 ? 'Letzte Woche' : `KW ${kw} · ${monday.getFullYear()}`;

      return { label, kw, allDays, visibleDays, hasSessions };
    });

    const hasAnything = weekGroups.some(wg => wg.hasSessions);

    const renderSessionCard = (d, s) => {
      const isActivity = s.sessionMode === 'cardio' || !!s.activity;
      const actType = s.activity?.type;
      const emoji = actType ? ACTIVITY_EMOJI[actType] : null;
      const ActivityIcon = (!emoji && actType) ? (ACTIVITY_ICONS[actType] || Activity) : null;
      const label = isActivity ? (ACTIVITY_LABELS[actType] || 'Ausdauer') : s.block;
      const color = blockColor(s.block, s.activity, s.sessionMode);
      const isReDate = reDateEntry?.d === d;
      const isDragging = draggedDate === d;
      return (
        <div className={`rounded-2xl bg-fit-card border border-fit-line overflow-hidden transition-all ${isDragging ? 'opacity-30 scale-95' : ''}`}
          draggable onDragStart={e => { setDraggedDate(d); e.dataTransfer.effectAllowed = 'move'; }}
          onDragEnd={() => { setDraggedDate(null); setDragOverDate(null); }}>
          <div className="flex items-center gap-2 px-3 py-3">
            <div className="text-fit-dim/20 cursor-grab active:cursor-grabbing select-none text-lg leading-none shrink-0 px-0.5" title="Ziehen um Datum zu verschieben">⠿</div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
              style={{ background: color + '15', color }}>
              {isActivity && emoji ? emoji : isActivity && ActivityIcon ? <ActivityIcon size={15} /> : <Dumbbell size={15} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-fit-ink truncate">{label || <span className="text-fit-dim/30 italic">–</span>}</div>
              {isActivity
                ? <div className="text-[9px] font-bold text-fit-dim/40 flex items-center gap-1"><Timer size={9} />{s.activity?.duration}m</div>
                : <div className="text-[9px] font-bold text-fit-dim/40">{Array.isArray(s.exercises) ? s.exercises.length : 0} Übungen</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={e => { e.stopPropagation(); setReDateEntry(isReDate ? null : { d, value: d }); }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isReDate ? 'bg-fit-accent text-black' : 'text-fit-dim/30 hover:text-fit-accent hover:bg-fit-accent/10'}`}
                title="Datum verschieben">
                <Calendar size={12} />
              </button>
              <button onClick={() => onOpenSession ? onOpenSession(d) : setDate(d)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-fit-accent text-black text-[8px] font-black uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-all"
                title="Im Session-Editor öffnen">
                <ChevronRight size={11} strokeWidth={3} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
          </div>
          {isReDate && (
            <div className="px-3 pb-3 flex items-center gap-2 border-t border-fit-line/30 pt-2.5 animate-in slide-in-from-top-1 duration-150">
              <span className="text-[8px] font-black uppercase tracking-widest text-fit-dim/40 shrink-0">→</span>
              <input type="date" value={reDateEntry.value} max={localToday()}
                onChange={e => setReDateEntry({ d, value: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') moveSessionToDate(d, reDateEntry.value); if (e.key === 'Escape') setReDateEntry(null); }}
                className="flex-1 px-2 py-1 rounded-lg border border-fit-accent/40 bg-fit-bg2 text-[10px] font-black text-fit-ink outline-none focus:border-accent"
                autoFocus />
              <button onClick={() => moveSessionToDate(d, reDateEntry.value)}
                className="w-7 h-7 rounded-lg bg-fit-accent text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                <Check size={12} strokeWidth={3} />
              </button>
              <button onClick={() => setReDateEntry(null)}
                className="w-7 h-7 rounded-lg bg-fit-bg2 border border-fit-line text-fit-dim flex items-center justify-center">
                <XIcon size={12} />
              </button>
            </div>
          )}
        </div>
      );
    };

    const renderDayRow = (d, showEmpty) => {
      const s = recentSessions[d];
      const hasSession = s?.exercises?.length > 0 || s?.activity;
      if (!hasSession && !showEmpty) return null;
      const isToday = d === today_;
      const dateObj = new Date(d + 'T12:00:00');
      const dayName = DAY_SHORT[dateObj.getDay()];
      const dayNum = dateObj.getDate();
      const mon = MON_SHORT[dateObj.getMonth()];
      const isDropTarget = !!draggedDate && draggedDate !== d && !hasSession;
      const isDragOver = dragOverDate === d && isDropTarget;
      const dotColor = hasSession ? blockColor(s?.block, s?.activity, s?.sessionMode) : null;

      return (
        <div key={d} className={`flex items-start transition-all ${isDragOver ? 'scale-[1.01]' : ''}`}
          onDragOver={isDropTarget ? e => { e.preventDefault(); setDragOverDate(d); } : undefined}
          onDragLeave={isDropTarget ? () => setDragOverDate(prev => prev === d ? null : prev) : undefined}
          onDrop={isDropTarget ? e => { e.preventDefault(); setDragOverDate(null); moveSessionToDate(draggedDate, d); setDraggedDate(null); } : undefined}>
          {/* Date sidebar */}
          <div className="w-14 text-right pr-3 shrink-0 pt-2.5">
            <div className="text-[8px] font-black uppercase text-fit-dim/25">{dayName}</div>
            <div className={`text-[13px] font-black leading-tight ${isToday ? 'text-fit-accent' : 'text-fit-dim/50'}`}>{dayNum}</div>
            {!hasSession && <div className="text-[7px] font-bold text-fit-dim/20 uppercase">{mon}</div>}
          </div>
          {/* Node */}
          <div className="w-6 flex flex-col items-center shrink-0 mt-[13px]">
            <div className={`w-3 h-3 rounded-full border-2 z-10 relative transition-all ${
              hasSession ? 'scale-100' : isDropTarget ? 'border-fit-accent/50 bg-fit-accent/20 scale-125' : 'border-fit-line/40 bg-fit-bg scale-75 opacity-40'
            }`} style={dotColor ? { borderColor: dotColor, background: dotColor + '30' } : {}} />
          </div>
          {/* Content */}
          <div className="flex-1 pl-2 pb-3 min-w-0">
            {hasSession ? renderSessionCard(d, s) : (
              <div className={`h-9 rounded-xl border transition-all flex items-center justify-center ${isDropTarget ? 'border-dashed border-fit-accent/40 bg-fit-accent/5' : 'border-transparent'}`}>
                {isDragOver && <span className="text-[8px] font-black uppercase tracking-[0.2em] text-fit-accent animate-pulse">Hierher verschieben</span>}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="pb-32">
        {!hasAnything ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-30">
            <History size={40} className="mb-4" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Noch keine Sessions</p>
          </div>
        ) : (
          <div>
            {weekGroups.map(wg => (
              <div key={wg.label} className="mb-1">
                <div className="flex items-center gap-3 px-2 pt-4 pb-1">
                  <div className="text-[9px] font-black uppercase tracking-[0.3em] text-fit-dim/30">{wg.label}</div>
                  {!wg.hasSessions && (
                    <div className="text-[8px] font-bold text-fit-dim/20 uppercase tracking-widest italic">Keine Session</div>
                  )}
                  {wg.hasSessions && (
                    <div className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-fit-bg2 text-fit-dim/30 border border-fit-line/30 uppercase tracking-widest">
                      {wg.allDays.filter(d => recentSessions[d]?.exercises?.length > 0 || recentSessions[d]?.activity).length}×
                    </div>
                  )}
                </div>
                {wg.visibleDays.length > 0 && (
                  <div className="relative">
                    <div className="absolute left-[67px] top-0 bottom-0 w-px bg-fit-line/30 z-0" />
                    {wg.visibleDays.map(d => renderDayRow(d, true))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-32">
      <DateHeader
        date={date}
        setDate={setDate}
        rollingDays={rollingDays}
        recentSessions={recentSessions}
        localToday={localToday()}
        onSave={save}
        saving={saving}
        onOpenSettings={() => setShowTabSettings(true)}
        onOpenSidebar={() => setShowSidebar(true)}
      />

      {/* Session Switcher Bar */}
      <div className="px-2 mb-8">
        <div className="card p-6 shadow-xl rounded-[30px] border-fit-line/40 bg-fit-card/60 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-dim/40 mr-2">Workouts:</div>
            {daySessions.length === 0 ? (
              <span className="text-[10px] font-black uppercase tracking-wider text-fit-dim/60">Keine Workouts eingetragen</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {/* Default session */}
                {(() => {
                  const defaultSess = daySessions.find(s => s.id === null);
                  const isSelected = sessionId === null;
                  if (!defaultSess && daySessions.length > 0 && sessionId !== null) {
                    // Let user also go back to null (default) if creating first suffix session
                  }
                  const label = defaultSess?.block || "Hauptsession";
                  return (
                    <button
                      onClick={() => selectSession(null)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        isSelected
                          ? "bg-fit-accent border-fit-accent text-black shadow-lg shadow-accent/20"
                          : "bg-fit-bg2 border-fit-line text-fit-dim hover:border-line-hover"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })()}

                {/* Suffix sessions */}
                {daySessions
                  .filter(s => s.id !== null)
                  .map(s => {
                    const isSelected = sessionId === s.id;
                    const label = s.block || `Workout (${s.id.slice(-4)})`;
                    return (
                      <button
                        key={s.id}
                        onClick={() => selectSession(s.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                          isSelected
                            ? "bg-fit-accent border-fit-accent text-black shadow-lg shadow-accent/20"
                            : "bg-fit-bg2 border-fit-line text-fit-dim hover:border-line-hover"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleNewSession}
              className="px-4 py-2 rounded-xl border border-dashed border-fit-line text-fit-dim hover:text-accent hover:border-accent/40 text-[10px] font-black uppercase tracking-wider transition-all"
            >
              + Neues Workout
            </button>
            {sessionId !== null && (
              <button
                onClick={handleDeleteSession}
                className="px-4 py-2 rounded-xl border border-fit-red/20 bg-fit-red/5 text-fit-red hover:bg-red/10 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Trash2 size={12} />
                Löschen
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-2">
        <main className="space-y-8">

          {/* ── Mode Switcher ── */}
          <div className="card p-2 shadow-xl rounded-[28px] border-fit-line/40 bg-fit-card/60 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-1">
              {SESSION_MODES.map(mode => {
                const isActive = sessionMode === mode.value;
                const Icon = mode.icon;
                const isCardio = mode.value === 'cardio';
                return (
                  <button
                    key={mode.value}
                    onClick={() => setSessionMode(mode.value)}
                    className={`flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-[22px] text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-200 ${
                      isActive
                        ? isCardio
                          ? 'bg-fit-orange text-black shadow-lg shadow-orange/30'
                          : 'bg-fit-accent text-black shadow-lg shadow-accent/30'
                        : 'text-fit-dim hover:text-fit-ink'
                    }`}
                  >
                    <Icon size={15} strokeWidth={2.5} />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Strength Mode: Plan hint + Gap hints + Exercises ── */}
          {sessionMode === 'strength' && (
            <>
              {hint && (
                <div className="p-4 rounded-3xl bg-fit-accent/5 border border-fit-accent/20 flex items-center gap-4 text-sm">
                  <Zap size={18} className="text-fit-accent shrink-0" />
                  <div>
                    <span className="font-black text-fit-accent uppercase tracking-widest mr-2">{hint.block}</span>
                    <span className="text-fit-muted">{(hint.exercises || []).slice(0, 3).join(', ')}</span>
                  </div>
                </div>
              )}

              {gaps.length > 0 && (
                <div className="card p-6 border-fit-red/20 bg-fit-red/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-fit-red mb-4">Coverage-Lücken</div>
                  <div className="flex flex-wrap gap-2">
                    {gaps.map(g => (
                      <span key={g.name} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border bg-fit-red/10 text-fit-red border-fit-red/20">{g.name}</span>
                    ))}
                  </div>
                </div>
              )}

              <ExerciseSection
                exercises={exercises}
                restHours={restHours}
                muscleRecovery={recentSessions[date]?.muscle_recovery || {}}
                updateEx={updateEx}
                addSet={addSet}
                removeSet={removeSet}
                removeEx={removeEx}
                replaceSets={replaceSets}
                moveEx={moveEx}
                date={date}
                addEx={addEx}
                quickInput={quickInput}
                setQuickInput={setQuickInput}
                addQuick={addQuick}
                prevMap={prevMap}
                onInspectExercise={onInspectExercise}
              />

              {/* ── Activity-Finisher Anhang ── */}
              <ActivityAddon
                hasActivity={hasActivity}
                setHasActivity={setHasActivity}
                activity={activity}
                setActivity={setActivity}
              />
            </>
          )}

          {/* ── Cardio Mode: Activity Logger ── */}
          {sessionMode === 'cardio' && (
            <div className="card p-6 shadow-xl rounded-[30px] border-fit-orange/20 bg-fit-orange/5 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-2xl bg-fit-orange/15 flex items-center justify-center text-fit-orange">
                  <Activity size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-fit-orange">Ausdauer-Session</div>
                  <div className="text-[10px] text-fit-dim/40 font-medium">Cardio · Endurance</div>
                </div>
              </div>
              <ActivitySection
                activity={activity}
                setActivity={setActivity}
              />
            </div>
          )}

        </main>
      </div>

      {toast && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-fit-card text-fit-accent border border-fit-line animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}

      {/* Floating Save Button for Mobile */}
      <div className="lg:hidden fixed bottom-24 right-6 z-40 flex flex-col items-end gap-1.5">
        {autoSaveLabel ? (
          <span className="text-[9px] font-black uppercase tracking-widest text-fit-accent/60 animate-in fade-in duration-300">
            {autoSaveLabel}
          </span>
        ) : dirty ? (
          <span className="text-[9px] font-black uppercase tracking-widest text-fit-red/70 animate-in fade-in duration-300">
            Ungespeichert
          </span>
        ) : null}
        <button
          onClick={() => save()}
          disabled={saving}
          className="w-14 h-14 rounded-full bg-fit-accent text-black shadow-2xl shadow-accent/40 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save size={24} />}
        </button>
      </div>

      {showSidebar && (
        <SidebarSheet
          onClose={() => setShowSidebar(false)}
          onShowMap={() => { setShowSidebar(false); setShowMap(true); }}
          location={location} setLocation={v => { setLocation(v); scheduleAutoSave(); }}
          duration={duration} setDuration={v => { setDuration(v); scheduleAutoSave(); }}
          sessionMode={sessionMode}
          block={block} setBlock={v => { setBlock(v); scheduleAutoSave(); }}
          effort={effort} setEffort={v => { setEffort(v); scheduleAutoSave(); }}
          notes={notes} setNotes={v => { setNotes(v); scheduleAutoSave(); }}
          onDownload={handleDownload}
          onExportObsidian={exportObsidian}
          coachFeedback={coachFeedback}
        />
      )}

      {showMap && (
        <MuscleMapModal
          exercises={doneExercises}
          onClose={() => setShowMap(false)}
        />
      )}

      {showTabSettings && (
        <SourceSettingsModal onClose={() => setShowTabSettings(false)} />
      )}
    </div>
  );
}
