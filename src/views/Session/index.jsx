import { useState, useEffect, useMemo } from 'react';
import {
  getSession, saveSession, getSessionHistory,
  parseQuick, getExercise,
  getCoverageGaps, getPlanSuggestion, exportFitnessData, queueForEnrichment,
} from '@db';
import { localToday } from '@utils';
import { buildSessionCoachSheet } from '../../lib/exerciseInsights.js';

import { Save, Zap } from 'lucide-react';
import DateHeader from './DateHeader';
import ExerciseSection from './ExerciseSection';
import ActivitySection from './ActivitySection';
import SidebarSheet from './SidebarSheet';
import MuscleMapModal from './MuscleMapModal';
import SourceSettingsModal from './SourceSettingsModal';
import { getRollingDays } from './utils';

export default function Session({ initialDate, initialDraft, onInspectExercise }) {
  const [date, setDate]           = useState(initialDate || localToday());
  const [block, setBlock]         = useState('');
  const [exercises, setExercises] = useState([]);
  const [effort, setEffort]       = useState(5);
  const [location, setLocation]   = useState('');
  const [duration, setDuration]   = useState('');
  const [trainingsart, setTrainingsart] = useState('');
  const [notes, setNotes]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [restHours, setRestHours]   = useState(null);
  const [hasActivity, setHasActivity] = useState(false);
  const [activity, setActivity]   = useState({ type: 'hiking', duration: '', intensity: 5 });
  const [recentSessions, setRecentSessions] = useState({});
  const [hint, setHint]           = useState(null);
  const [gaps, setGaps]           = useState([]);
  const [showMap, setShowMap]         = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTabSettings, setShowTabSettings] = useState(false);

  const [prevMap, setPrevMap]       = useState({});

  const rollingDays = getRollingDays(30);

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
    getSession(date).then(d => {
      if (d) {
        setBlock(d.block || '');
        setExercises(d.exercises || []);
        setEffort(d.effort ?? 5);
        setLocation(d.location || '');
        setDuration(d.duration || '');
        setNotes(d.notes || '');
        setTrainingsart(d.trainingsart || '');
        if (d.activity) {
          setHasActivity(true);
          setActivity(d.activity);
        } else {
          setHasActivity(false);
        }
      } else {
        setBlock(initialDraft?.block || '');
        setExercises(initialDraft?.exercises || []);
        setEffort(5);
        setLocation('');
        setDuration('');
        setNotes('');
        setTrainingsart('');
        setHasActivity(false);
      }
    }).catch(() => {});
    
    // Local Intelligence: Fetch Plan and Gaps
    getPlanSuggestion(date).then(setHint).catch(() => {});
    getCoverageGaps(7).then(setGaps).catch(() => {});
  }, [date]);

  const doneExercises = useMemo(
    () => exercises.filter(ex => ex.done),
    [exercises]
  )

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
      note: '', done: true,
      source: ex.source
    }]);


    // Queue für Enrichment falls nicht expert
    if (ex.source !== 'expert') {
      queueForEnrichment(ex)
    }
    
    showToast(`+ ${ex.display_name || ex.name}`);
  }

  function addQuick() {
    if (!quickInput.trim()) return;
    const ex = parseQuick(quickInput);
    if (ex) { 
      setExercises(prev => [...prev, ex]);
      setQuickInput('');
      showToast(`+ ${ex.name}`); 
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
  }

  function addSet(i) {
    setExercises(prev => prev.map((ex, idx) => {
      if (idx !== i) return ex;
      return { ...ex, setsArray: [...ex.setsArray, {reps: '', weight: ''}] };
    }));
  }

  function removeSet(i, setIdx) {
    setExercises(prev => prev.map((ex, idx) => {
      if (idx !== i || ex.setsArray.length <= 1) return ex;
      return { ...ex, setsArray: ex.setsArray.filter((_, sIdx) => sIdx !== setIdx) };
    }));
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
  }

  function removeEx(i) {
    setExercises(prev => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    try {
      const sessData = { block, exercises, effort, location, duration, notes, trainingsart };
      if (hasActivity) sessData.activity = activity;
      await saveSession(date, sessData);
      showToast('Gespeichert ✓');
      // Update gaps after save
      const gaps = await getCoverageGaps(7);
      setGaps(gaps);
    } catch { showToast('Fehler beim Speichern'); }
    finally { setSaving(false); }
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

      <div className="px-2">
        <main className="space-y-8">
          {/* Plan hint */}
          {hint && (
            <div className="p-4 rounded-3xl bg-accent/5 border border-accent/20 flex items-center gap-4 text-sm">
              <Zap size={18} className="text-accent shrink-0" />
              <div>
                <span className="font-black text-accent uppercase tracking-widest mr-2">{hint.block}</span>
                <span className="text-muted">{(hint.exercises || []).slice(0, 3).join(', ')}</span>
              </div>
            </div>
          )}

          {/* Gap hints */}
          {gaps.length > 0 && (
            <div className="card p-6 border-red/20 bg-red/5">
              <div className="text-[10px] font-black uppercase tracking-widest text-red mb-4">Coverage-Lücken</div>
              <div className="flex flex-wrap gap-2">
                {gaps.map(g => (
                  <span key={g.name} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border bg-red/10 text-red border-red/20">{g.name}</span>
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

          <ActivitySection
            hasActivity={hasActivity}
            setHasActivity={setHasActivity}
            activity={activity}
            setActivity={setActivity}
          />
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-card text-accent border border-line animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}

      {/* Floating Save Button for Mobile */}
      <button 
        onClick={save} 
        disabled={saving}
        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 rounded-full bg-accent text-black shadow-2xl shadow-accent/40 flex items-center justify-center z-40 active:scale-95 transition-all disabled:opacity-50"
      >
        {saving ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save size={24} />}
      </button>

      {showSidebar && (
        <SidebarSheet
          onClose={() => setShowSidebar(false)}
          onShowMap={() => { setShowSidebar(false); setShowMap(true); }}
          location={location} setLocation={setLocation}
          duration={duration} setDuration={setDuration}
          hasActivity={hasActivity} setHasActivity={setHasActivity}
          block={block} setBlock={setBlock}
          effort={effort} setEffort={setEffort}
          notes={notes} setNotes={setNotes}
          onDownload={handleDownload}
          onExportObsidian={exportObsidian}
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
