import { useState, useEffect, useRef } from 'react';
import {
  saveSession, getSessionHistory, listSessionsForDate, deleteSession,
  parseQuick, getExercise,
  getCoverageGaps, getPlanSuggestion, exportFitnessData, queueForEnrichment,
} from '@db';
import { localToday } from '@utils';
import { buildSessionCoachSheet } from '../../lib/exerciseInsights.js';

import { Save, Zap, Trash2, Dumbbell, Activity, ChevronRight, History } from 'lucide-react';
import DateHeader from './DateHeader';
import ExerciseSection from './ExerciseSection';
import ActivitySection from './ActivitySection';
import ActivityAddon from './ActivityAddon';
import SidebarSheet from './SidebarSheet';
import MuscleMapModal from './MuscleMapModal';
import SourceSettingsModal from './SourceSettingsModal';
import { getRollingDays, blockColor } from './utils';
import { ACTIVITY_LABELS } from '../../constants/ActivityConstants';

// Session mode: 'strength' (Krafttraining) or 'cardio' (Ausdauer/Activity)
const SESSION_MODES = [
  { value: 'strength', label: 'Krafttraining', icon: Dumbbell, color: 'accent' },
  { value: 'cardio',   label: 'Ausdauer',      icon: Activity,  color: 'orange' },
];

export default function Session({ initialDate, initialDraft, onInspectExercise, recentDays = 7, coverageThreshold = 1.0 }) {
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
  const [sessionId, setSessionId] = useState(null);
  const [autoSaveLabel, setAutoSaveLabel] = useState('');
  const [viewMode, setViewMode] = useState('heute');

  const autoSaveTimer = useRef(null);
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
    scheduleAutoSave();
  }

  function addQuick() {
    if (!quickInput.trim()) return;
    const ex = parseQuick(quickInput);
    if (ex) {
      setExercises(prev => [...prev, ex]);
      setQuickInput('');
      showToast(`+ ${ex.name}`);
      scheduleAutoSave();
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
      return { ...ex, setsArray: [...ex.setsArray, {reps: '', weight: ''}] };
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
    setSaving(true);
    try {
      const sessData = { block, exercises, effort, location, duration, notes, trainingsart, sessionMode };
      // Cardio mode: activity is the whole session
      // Strength mode: activity is an optional addon (only save if hasActivity)
      if (sessionMode === 'cardio') sessData.activity = activity;
      else if (hasActivity && activity.duration) sessData.activity = activity;
      await saveSession(date, sessData, sessionId);
      if (silent) {
        setAutoSaveLabel('Auto ✓');
        setTimeout(() => setAutoSaveLabel(''), 2000);
      } else {
        showToast('Gespeichert ✓');
      }
      const list = await listSessionsForDate(date);
      setDaySessions(list);
      // Update gaps after save
      const gaps = await getCoverageGaps(recentDays, coverageThreshold);
      setGaps(gaps);
    } catch { if (!silent) showToast('Fehler beim Speichern'); }
    finally { setSaving(false); }
  }

  // Always keep saveRef current so debounced auto-save uses fresh closures
  saveRef.current = save;

  function scheduleAutoSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveRef.current(true), 2500);
  }

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

      {/* View Mode Switcher */}
      <div className="px-2 mb-4">
        <div className="inline-flex gap-1 bg-fit-bg2 p-1 rounded-2xl border border-fit-line">
          <button
            onClick={() => setViewMode('heute')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'heute' ? 'bg-fit-accent text-black shadow-lg' : 'text-fit-dim hover:text-fit-ink'}`}
          >
            <Dumbbell size={12} />
            Heute
          </button>
          <button
            onClick={() => setViewMode('verlauf')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'verlauf' ? 'bg-fit-accent text-black shadow-lg' : 'text-fit-dim hover:text-fit-ink'}`}
          >
            <History size={12} />
            Verlauf
          </button>
        </div>
      </div>

      {/* Verlauf */}
      {viewMode === 'verlauf' && (
        <div className="px-2 space-y-2 mb-8">
          {Object.entries(recentSessions)
            .sort(([a], [b]) => b.localeCompare(a))
            .filter(([, s]) => s?.exercises?.length > 0 || s?.activity)
            .map(([d, s]) => {
              const color = blockColor(s.block, s.activity);
              const label = s.block || ACTIVITY_LABELS[s.activity?.type] || '—';
              return (
                <button
                  key={d}
                  onClick={() => { setDate(d); setViewMode('heute'); }}
                  className="w-full text-left card p-5 hover:border-fit-accent/30 transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color || 'var(--accent)' }} />
                    <div>
                      <div className="font-black text-fit-ink text-sm" style={{ color: color || 'inherit' }}>{label}</div>
                      <div className="text-[10px] font-mono text-fit-dim/50 mt-0.5">{d}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-fit-dim">
                    {s.exercises?.length > 0 && (
                      <div className="text-right">
                        <div className="text-base font-black text-fit-ink">{s.exercises.length}</div>
                        <div className="text-[9px] uppercase tracking-widest opacity-40">Übungen</div>
                      </div>
                    )}
                    {s.effort && (
                      <div className="text-right">
                        <div className="text-base font-black text-fit-ink">{s.effort}</div>
                        <div className="text-[9px] uppercase tracking-widest opacity-40">Effort</div>
                      </div>
                    )}
                    <ChevronRight size={16} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                  </div>
                </button>
              );
            })
          }
          {Object.values(recentSessions).filter(s => s?.exercises?.length > 0 || s?.activity).length === 0 && (
            <div className="card p-10 text-center opacity-30 border-dashed">
              <History size={32} className="mx-auto mb-3" />
              <p className="text-[11px] font-black uppercase tracking-[0.3em]">Noch kein Verlauf</p>
            </div>
          )}
        </div>
      )}

      {/* Session Switcher Bar + Content — nur im Heute-Modus */}
      {viewMode === 'heute' && <><div className="px-2 mb-8">
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
      </>}

      {toast && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-fit-card text-fit-accent border border-fit-line animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}

      {/* Floating Save Button for Mobile */}
      <div className="lg:hidden fixed bottom-24 right-6 z-40 flex flex-col items-end gap-1.5">
        {autoSaveLabel && (
          <span className="text-[9px] font-black uppercase tracking-widest text-fit-accent/60 animate-in fade-in duration-300">
            {autoSaveLabel}
          </span>
        )}
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
