import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const TIMER_STORAGE_KEY = 'fitness-workout-timer-v1';
const ACCENT = '#c8ff00';

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function createInitialStopwatchState() {
  return { running: false, startedAt: null, elapsedMs: 0 };
}

function hydrateStopwatchState() {
  if (typeof window === 'undefined') return createInitialStopwatchState();
  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return createInitialStopwatchState();
    const parsed = JSON.parse(raw);
    const base = { ...createInitialStopwatchState(), ...parsed };
    if (!base.running || !base.startedAt) return base;
    const delta = Math.max(0, Date.now() - Date.parse(base.startedAt));
    return { ...base, startedAt: new Date().toISOString(), elapsedMs: base.elapsedMs + delta };
  } catch {
    return createInitialStopwatchState();
  }
}

export default function WorkoutTimerCard() {
  const [state, setState] = useState(() => hydrateStopwatchState());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    return undefined;
  }, [state]);

  useEffect(() => {
    if (!state.running) return undefined;
    const interval = window.setInterval(() => {
      setState(current => ({ ...current, elapsedMs: current.elapsedMs + 1000 }));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [state.running]);

  function toggle() {
    setState(current => ({ ...current, running: !current.running, startedAt: new Date().toISOString() }));
  }

  function reset() {
    setState(createInitialStopwatchState());
  }

  return (
    <section
      className="rounded-[2rem] p-5 sm:p-6"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid var(--line)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: 'var(--dim)', opacity: 0.7 }}>Workout Timer</div>
          <h3 className="text-xl sm:text-2xl font-black text-fit-ink mt-1">Stoppuhr</h3>
        </div>
        <div
          className="rounded-2xl px-4 py-3 min-w-[9rem] text-right"
          style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}33` }}
        >
          <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Freie Zeit</div>
          <div className="text-3xl font-black tabular-nums text-fit-ink mt-1">{formatSeconds(Math.floor(state.elapsedMs / 1000))}</div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--dim)', opacity: 0.8 }}>{state.running ? 'Stoppuhr läuft.' : 'Bereit zum Start.'}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={toggle} className="min-h-12 px-5 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: ACCENT, color: '#000', boxShadow: `0 16px 32px -16px ${ACCENT}` }}>
          {state.running ? <Pause size={16} strokeWidth={3} /> : <Play size={16} strokeWidth={3} />}
          {state.running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="min-h-12 px-5 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'var(--bg2)', color: 'var(--ink)', border: '1px solid var(--line)' }}>
          <RotateCcw size={16} strokeWidth={2.7} />
          Reset
        </button>
      </div>
    </section>
  );
}
