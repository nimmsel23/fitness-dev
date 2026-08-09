import { useEffect, useMemo, useState } from 'react';
import { Play, Pause, RotateCcw, TimerReset, Waves, Flame, Dumbbell } from 'lucide-react';

const TIMER_STORAGE_KEY = 'fitness-workout-timer-v1';

const TIMER_MODES = [
  {
    id: 'stopwatch',
    label: 'Stoppuhr',
    Icon: TimerReset,
    kind: 'stopwatch',
    accent: '#c8ff00',
    description: 'Freie Zeitmessung ohne Intervalle.',
  },
  {
    id: 'tabata',
    label: 'Tabata',
    Icon: Flame,
    kind: 'interval',
    accent: '#fb7185',
    description: '20s Arbeit · 10s Pause · 8 Runden',
    workSeconds: 20,
    restSeconds: 10,
    rounds: 8,
  },
  {
    id: 'hiit',
    label: 'HIIT',
    Icon: Waves,
    kind: 'interval',
    accent: '#38bdf8',
    description: '45s Arbeit · 15s Pause · 10 Runden',
    workSeconds: 45,
    restSeconds: 15,
    rounds: 10,
  },
  {
    id: 'sixpack',
    label: '6Pack',
    Icon: Dumbbell,
    kind: 'interval',
    accent: '#f59e0b',
    description: '40s Arbeit · 20s Pause · 6 Runden',
    workSeconds: 40,
    restSeconds: 20,
    rounds: 6,
  },
];

function getMode(modeId) {
  return TIMER_MODES.find(mode => mode.id === modeId) || TIMER_MODES[0];
}

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function createInitialState(modeId = 'stopwatch') {
  const mode = getMode(modeId);
  return {
    modeId: mode.id,
    running: false,
    startedAt: null,
    elapsedMs: 0,
    phase: 'work',
    phaseRemainingMs: (mode.workSeconds || 0) * 1000,
    roundsCompleted: 0,
  };
}

function hydrateTimerState() {
  if (typeof window === 'undefined') return createInitialState();
  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    const base = { ...createInitialState(parsed.modeId), ...parsed };
    if (!base.running || !base.startedAt) return base;

    const now = Date.now();
    const delta = Math.max(0, now - Date.parse(base.startedAt));
    return advanceTimerState({
      ...base,
      startedAt: now,
      elapsedMs: (parsed.elapsedMs || 0) + delta,
    }, 0);
  } catch {
    return createInitialState();
  }
}

function advanceIntervalState(state, deltaMs) {
  let remaining = (state.phaseRemainingMs || 0) - deltaMs;
  let phase = state.phase || 'work';
  let roundsCompleted = state.roundsCompleted || 0;
  const mode = getMode(state.modeId);
  const workMs = (mode.workSeconds || 0) * 1000;
  const restMs = (mode.restSeconds || 0) * 1000;
  const rounds = mode.rounds || 0;
  let running = state.running;

  while (running && remaining <= 0) {
    if (phase === 'work') {
      roundsCompleted += 1;
      if (roundsCompleted >= rounds) {
        running = false;
        phase = 'done';
        remaining = 0;
        break;
      }
      phase = 'rest';
      remaining += restMs;
    } else if (phase === 'rest') {
      phase = 'work';
      remaining += workMs;
    } else {
      running = false;
      remaining = 0;
      break;
    }
  }

  return {
    ...state,
    running,
    phase,
    phaseRemainingMs: Math.max(0, remaining),
    roundsCompleted,
  };
}

function advanceTimerState(state, deltaMs) {
  const next = {
    ...state,
    elapsedMs: Math.max(0, (state.elapsedMs || 0) + deltaMs),
  };
  const mode = getMode(state.modeId);
  if (mode.kind !== 'interval') return next;
  return advanceIntervalState(next, deltaMs);
}

function getSummary(mode, state) {
  if (mode.kind === 'stopwatch') {
    return {
      eyebrow: 'Freie Zeit',
      detail: state.running ? 'Stoppuhr läuft.' : 'Bereit zum Start.',
    };
  }
  if (state.phase === 'done') {
    return {
      eyebrow: 'Abgeschlossen',
      detail: `${mode.rounds} Runden erledigt.`,
    };
  }
  return {
    eyebrow: state.phase === 'rest' ? 'Pause' : 'Arbeit',
    detail: `Runde ${Math.min((state.roundsCompleted || 0) + 1, mode.rounds)} von ${mode.rounds}`,
  };
}

export default function WorkoutTimerCard() {
  const [timerState, setTimerState] = useState(() => hydrateTimerState());

  const mode = useMemo(() => getMode(timerState.modeId), [timerState.modeId]);
  const summary = useMemo(() => getSummary(mode, timerState), [mode, timerState]);
  const displaySeconds = mode.kind === 'stopwatch'
    ? Math.floor((timerState.elapsedMs || 0) / 1000)
    : Math.ceil((timerState.phaseRemainingMs || 0) / 1000);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
    return undefined;
  }, [timerState]);

  useEffect(() => {
    if (!timerState.running) return undefined;
    const interval = window.setInterval(() => {
      setTimerState(current => advanceTimerState(current, 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerState.running]);

  function selectMode(modeId) {
    setTimerState(createInitialState(modeId));
  }

  function toggleRunning() {
    setTimerState(current => {
      if (current.phase === 'done') return createInitialState(current.modeId);
      return { ...current, running: !current.running, startedAt: new Date().toISOString() };
    });
  }

  function resetTimer() {
    setTimerState(current => createInitialState(current.modeId));
  }

  const progress = mode.kind === 'interval'
    ? (() => {
      const totalPhaseMs = timerState.phase === 'rest'
        ? (mode.restSeconds || 1) * 1000
        : (mode.workSeconds || 1) * 1000;
      if (!totalPhaseMs) return 0;
      return Math.max(0, Math.min(100, (1 - ((timerState.phaseRemainingMs || 0) / totalPhaseMs)) * 100));
    })()
    : 0;

  return (
    <section
      className="rounded-[2rem] p-5 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        border: '1px solid var(--line)',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: 'var(--dim)', opacity: 0.7 }}>
            Workout Timer
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-fit-ink mt-1">
            Stoppuhr, Tabata, HIIT und 6Pack
          </h3>
          <p className="text-sm mt-2 max-w-xl" style={{ color: 'var(--dim)', opacity: 0.8 }}>
            Direkter In-App-Timer für Session-Flows im Thenics-Stil. Erst Zeit, dann Details.
          </p>
        </div>

        <div
          className="rounded-2xl px-4 py-3 min-w-[9rem] text-right"
          style={{ background: `${mode.accent}14`, border: `1px solid ${mode.accent}33` }}
        >
          <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: mode.accent }}>
            {summary.eyebrow}
          </div>
          <div className="text-3xl font-black tabular-nums text-fit-ink mt-1">
            {formatSeconds(displaySeconds)}
          </div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--dim)', opacity: 0.8 }}>
            {summary.detail}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
        {TIMER_MODES.map(({ id, label, description, Icon, accent }) => {
          const selected = id === mode.id;
          return (
            <button
              key={id}
              onClick={() => selectMode(id)}
              className="text-left rounded-2xl p-3 transition-all active:scale-[0.98]"
              style={{
                background: selected ? `${accent}18` : 'var(--bg2)',
                border: selected ? `1px solid ${accent}66` : '1px solid var(--line)',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: selected ? accent : 'rgba(255,255,255,0.05)', color: selected ? '#000' : 'var(--dim)' }}
                >
                  <Icon size={15} />
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: selected ? accent : 'var(--ink)' }}>
                  {label}
                </div>
              </div>
              <div className="text-[11px] mt-2" style={{ color: 'var(--dim)', opacity: 0.75 }}>
                {description}
              </div>
            </button>
          );
        })}
      </div>

      {mode.kind === 'interval' && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-[11px] font-bold mb-2" style={{ color: 'var(--dim)' }}>
            <span>{timerState.phase === 'rest' ? 'Pause läuft' : timerState.phase === 'done' ? 'Workout fertig' : 'Arbeitsphase läuft'}</span>
            <span>{timerState.roundsCompleted}/{mode.rounds} Runden fertig</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${progress}%`, background: mode.accent }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggleRunning}
          className="min-h-12 px-5 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: mode.accent,
            color: '#000',
            boxShadow: `0 16px 32px -16px ${mode.accent}`,
          }}
        >
          {timerState.running ? <Pause size={16} strokeWidth={3} /> : <Play size={16} strokeWidth={3} />}
          {timerState.running ? 'Pause' : timerState.phase === 'done' ? 'Neu starten' : 'Start'}
        </button>

        <button
          onClick={resetTimer}
          className="min-h-12 px-5 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'var(--bg2)', color: 'var(--ink)', border: '1px solid var(--line)' }}
        >
          <RotateCcw size={16} strokeWidth={2.7} />
          Reset
        </button>

        <div className="text-[11px] font-bold" style={{ color: 'var(--dim)', opacity: 0.75 }}>
          {mode.kind === 'stopwatch'
            ? 'Für freie Sessions oder als klassische Stoppuhr.'
            : `${mode.workSeconds}s Work · ${mode.restSeconds}s Rest · ${mode.rounds} Runden`}
        </div>
      </div>
    </section>
  );
}
