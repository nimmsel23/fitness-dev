import { useEffect, useMemo, useState } from 'react';
import { Play, Pause, Dumbbell, Shuffle, Check, ChevronLeft, ListChecks, UtensilsCrossed, BookOpen, Star, Camera, Video } from 'lucide-react';

const SIXPACK_PROGRAM_KEY = 'fitness-sixpack-program-v1';
const SIXPACK_FAVORITES_KEY = 'fitness-sixpack-favorites-v1';
const SIXPACK_SELFIES_KEY = 'fitness-sixpack-selfies-v1';

// Verifizierte, echte Übungsnamen aus der 6 Pack Promise App (App-Reviews +
// Day-8-Screenshot des Nutzers) — keine erfundenen Namen. Kategorisierung
// (Lower/Bottom-up/Top-down/Upper) ist eigene fachliche Einordnung, nicht aus
// der App verifiziert — vom Nutzer als Vitaltrainer korrigierbar.
const EXERCISE_CATEGORIES = [
  { id: 'lower', label: 'Lower Abs', exercises: ['Heels to the Heavens', 'Hanging Bat Crunch', 'Hands Back Raises'] },
  { id: 'bottom-up', label: 'Bottom-up Rotation', exercises: ['Rolling Jackknifes', 'Drunken Mountain Climbers'] },
  { id: 'top-down', label: 'Top-down Rotation', exercises: ['Crucifix', 'Canoe Crunches', 'Seated Ab Circles'] },
  { id: 'upper', label: 'Upper Abs', exercises: ['Rib Crushers', 'Starfish Crunch'] },
];

const EXERCISE_POOL = EXERCISE_CATEGORIES.flatMap(cat => cat.exercises);

// Track-Screenshot des Nutzers: Tag 3 und Tag 7 jeder Woche sind REST-Tage.
const REST_DAYS_IN_WEEK = [3, 7];
const DAYS_PER_WEEK = 7;
const PROGRAM_WEEKS = 8;

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function shuffleIndices(count) {
  const arr = Array.from({ length: count }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function dayInWeek(day) {
  return ((day - 1) % DAYS_PER_WEEK) + 1;
}

function weekOf(day) {
  return Math.floor((day - 1) / DAYS_PER_WEEK) + 1;
}

function isRestDay(day) {
  return REST_DAYS_IN_WEEK.includes(dayInWeek(day));
}

// Generiert einen Tagesplan im Format des Day-8-Screenshots: 4-6 Übungen
// à 30 oder 60 Sekunden, dazwischen normal ein kurzer 5s-Übergang (unsichtbar
// in der Liste), aber 1-2x pro Workout ein echter Rest-Block (30 oder 45s),
// der als eigene Zeile erscheint — exakt wie "Rest · 45 Seconds" im Screenshot.
function generateDayWorkout(day) {
  if (isRestDay(day)) return { day, rest: true, exercises: [] };

  const exerciseCount = 4 + Math.floor(Math.random() * 3);
  const exercises = shuffleIndices(EXERCISE_POOL.length)
    .slice(0, exerciseCount)
    .map(i => ({ type: 'exercise', name: EXERCISE_POOL[i], seconds: Math.random() < 0.5 ? 30 : 60 }));

  const gapCount = exercises.length - 1;
  const longRestCount = Math.min(gapCount, 1 + Math.round(Math.random()));
  const longRestGaps = shuffleIndices(gapCount).slice(0, longRestCount);

  const items = [];
  exercises.forEach((ex, idx) => {
    items.push(ex);
    if (longRestGaps.includes(idx)) {
      items.push({ type: 'rest', name: 'Rest', seconds: Math.random() < 0.5 ? 30 : 45 });
    }
  });

  return { day, rest: false, items };
}

function loadProgram() {
  if (typeof window === 'undefined') return { currentDay: 1, completedDays: [], workouts: {} };
  try {
    const raw = window.localStorage.getItem(SIXPACK_PROGRAM_KEY);
    if (!raw) return { currentDay: 1, completedDays: [], workouts: {} };
    const parsed = JSON.parse(raw);
    return {
      currentDay: parsed.currentDay || 1,
      completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : [],
      workouts: parsed.workouts || {},
    };
  } catch {
    return { currentDay: 1, completedDays: [], workouts: {} };
  }
}

function HomeScreen({ program, onOpenToday, onNav }) {
  const todayDone = program.completedDays.includes(program.currentDay);
  const menuButtons = [
    { id: 'eat', label: 'Eat', Icon: UtensilsCrossed },
    { id: 'track', label: 'Track', Icon: ListChecks },
    { id: 'learn', label: 'Learn', Icon: BookOpen },
    { id: 'shuffle', label: 'Shuffle', Icon: Shuffle },
    { id: 'favorites', label: 'Favorites', Icon: Star },
    { id: 'selfies', label: 'Selfies', Icon: Camera },
  ];

  return (
    <div>
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#111' }}>
        <div className="text-xs font-black tracking-[0.3em]" style={{ color: '#e2001a' }}>6PP</div>
        <div className="text-[11px] font-bold" style={{ color: 'var(--dim)' }}>
          Woche {weekOf(program.currentDay)} · Tag {dayInWeek(program.currentDay)}
        </div>
      </div>

      <button
        onClick={onOpenToday}
        className="w-full text-left"
        style={{ background: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)' }}
      >
        <div className="h-28 flex items-center justify-center" style={{ background: 'radial-gradient(circle at 30% 30%, #2a2a2a, #0a0a0a)' }}>
          <Dumbbell size={40} color="#333" />
        </div>
        <div className="px-4 py-2.5 text-center text-sm font-black uppercase tracking-[0.12em]" style={{ background: '#e2001a', color: '#fff' }}>
          {todayDone ? `Tag ${program.currentDay} erledigt ✓` : "Today's Workout"}
        </div>
      </button>

      <div className="grid grid-cols-3 gap-px mt-px" style={{ background: 'var(--line)' }}>
        {menuButtons.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onNav(id)} className="py-5 flex flex-col items-center gap-2" style={{ background: '#141414' }}>
            <Icon size={18} color="#e2001a" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-fit-ink">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function BackHeader({ label, onBack }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#111' }}>
      <button onClick={onBack} className="text-[#e2001a] flex items-center gap-1 text-sm font-bold">
        <ChevronLeft size={18} /> Home
      </button>
      <div className="flex-1 text-center text-sm font-black text-fit-ink">{label}</div>
      <div style={{ width: 60 }} />
    </div>
  );
}

function EatScreen({ onBack }) {
  return (
    <div>
      <BackHeader label="Eat" onBack={onBack} />
      <div className="p-6 text-center text-sm" style={{ color: 'var(--dim)' }}>
        Kein eigener Meal-Plan-Content — nutz stattdessen Fuel für Ernährungs-Logging.
      </div>
    </div>
  );
}

function LearnScreen({ onBack }) {
  return (
    <div>
      <BackHeader label="Learn" onBack={onBack} />
      <div>
        {EXERCISE_CATEGORIES.map(cat => (
          <div key={cat.id}>
            <div className="px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em]" style={{ background: '#0e0e0e', color: '#e2001a' }}>
              {cat.label}
            </div>
            {cat.exercises.map(name => (
              <div key={name} className="px-4 py-3 flex items-center justify-between" style={{ background: '#1a1a1a', borderBottom: '1px solid #000' }}>
                <span className="text-sm font-bold" style={{ color: '#fff' }}>{name}</span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: 'var(--dim)' }}>
                  <Video size={13} />
                  Video folgt
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function loadFavorites() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(SIXPACK_FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

function FavoritesScreen({ onBack }) {
  const [favorites, setFavorites] = useState(() => loadFavorites());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.localStorage.setItem(SIXPACK_FAVORITES_KEY, JSON.stringify(favorites));
    return undefined;
  }, [favorites]);

  function toggle(name) {
    setFavorites(current => current.includes(name) ? current.filter(n => n !== name) : [...current, name]);
  }

  return (
    <div>
      <BackHeader label="Favorites" onBack={onBack} />
      <div>
        {EXERCISE_POOL.map(name => {
          const active = favorites.includes(name);
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className="w-full px-4 py-3 flex items-center justify-between"
              style={{ background: '#1a1a1a', borderBottom: '1px solid #000' }}
            >
              <span className="text-sm font-bold" style={{ color: '#fff' }}>{name}</span>
              <Star size={16} color={active ? '#e2001a' : '#444'} fill={active ? '#e2001a' : 'none'} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function loadSelfies() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(SIXPACK_SELFIES_KEY) || '[]');
  } catch {
    return [];
  }
}

function SelfiesScreen({ onBack }) {
  const [selfies, setSelfies] = useState(() => loadSelfies());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.localStorage.setItem(SIXPACK_SELFIES_KEY, JSON.stringify(selfies));
    return undefined;
  }, [selfies]);

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelfies(current => [{ date: new Date().toISOString(), dataUrl: reader.result }, ...current]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div>
      <BackHeader label="Selfies" onBack={onBack} />
      <label className="block px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em]" style={{ background: '#e2001a', color: '#fff' }}>
        Foto aufnehmen
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
      </label>
      {selfies.length === 0 ? (
        <div className="p-6 text-center text-sm" style={{ color: 'var(--dim)' }}>Noch keine Fortschrittsfotos.</div>
      ) : (
        <div className="grid grid-cols-3 gap-px p-px" style={{ background: 'var(--line)' }}>
          {selfies.map((s, i) => (
            <div key={i} className="aspect-square" style={{ background: '#000' }}>
              <img src={s.dataUrl} alt={new Date(s.date).toLocaleDateString('de-AT')} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShuffleScreen({ onBack, onStart }) {
  const [categoryRoutine] = useState(() => EXERCISE_CATEGORIES.map(cat => ({
    categoryId: cat.id,
    category: cat.label,
    name: cat.exercises[Math.floor(Math.random() * cat.exercises.length)],
    seconds: Math.random() < 0.5 ? 30 : 60,
  })));

  const workout = useMemo(() => {
    const items = [];
    categoryRoutine.forEach((ex, i) => {
      items.push({ type: 'exercise', name: ex.name, seconds: ex.seconds });
      if (i < categoryRoutine.length - 1 && Math.random() < 0.5) {
        items.push({ type: 'rest', name: 'Rest', seconds: Math.random() < 0.5 ? 30 : 45 });
      }
    });
    return { rest: false, items };
  }, [categoryRoutine]);

  return (
    <div>
      <BackHeader label="Shuffle" onBack={onBack} />
      <div className="px-4 py-2 text-[11px] font-bold" style={{ color: 'var(--dim)' }}>
        Ein Übung je Kategorie: Lower Abs → Bottom-up Rotation → Top-down Rotation → Upper Abs.
      </div>
      {categoryRoutine.map(ex => (
        <div key={ex.categoryId} className="px-4 py-3 flex items-center justify-between" style={{ background: '#1a1a1a', borderBottom: '1px solid #000' }}>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: '#e2001a' }}>{ex.category}</div>
            <div className="text-sm font-bold" style={{ color: '#fff' }}>{ex.name}</div>
          </div>
          <span className="text-xs font-bold" style={{ color: 'var(--dim)' }}>{ex.seconds}s</span>
        </div>
      ))}
      <button
        onClick={() => onStart(workout)}
        className="w-full py-4 text-center text-sm font-black uppercase tracking-[0.16em]"
        style={{ background: '#e2001a', color: '#fff' }}
      >
        Start Workout
      </button>
    </div>
  );
}

function TrackScreen({ program, onBack, onOpenDay }) {
  const [week, setWeek] = useState(weekOf(program.currentDay));
  const days = Array.from({ length: DAYS_PER_WEEK }, (_, i) => (week - 1) * DAYS_PER_WEEK + i + 1);

  return (
    <div>
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#111' }}>
        <button onClick={onBack} className="text-[#e2001a] flex items-center gap-1 text-sm font-bold">
          <ChevronLeft size={18} /> Home
        </button>
        <div className="flex-1 text-center text-sm font-black text-fit-ink">Track</div>
        <div style={{ width: 60 }} />
      </div>

      <div className="flex" style={{ background: '#0e0e0e' }}>
        {Array.from({ length: PROGRAM_WEEKS }, (_, i) => i + 1).slice(0, 4).map(w => (
          <button
            key={w}
            onClick={() => setWeek(w)}
            className="flex-1 py-2.5 text-xs font-black uppercase tracking-[0.08em]"
            style={{ color: w === week ? '#e2001a' : 'var(--dim)', borderBottom: w === week ? '2px solid #e2001a' : '2px solid transparent' }}
          >
            Week {w}
          </button>
        ))}
      </div>

      <div>
        {days.map(day => {
          const rest = isRestDay(day);
          const done = program.completedDays.includes(day);
          const current = day === program.currentDay;
          return (
            <button
              key={day}
              onClick={() => !rest && onOpenDay(day)}
              disabled={rest}
              className="w-full px-4 py-3.5 flex items-center justify-between disabled:cursor-default"
              style={{ background: current ? '#e2001a' : '#1a1a1a', borderBottom: '1px solid #000' }}
            >
              <span className="text-sm font-bold" style={{ color: '#fff' }}>Day {dayInWeek(day)}</span>
              {rest ? (
                <span className="text-xs font-black uppercase tracking-[0.1em]" style={{ color: '#fff', opacity: 0.7 }}>Rest</span>
              ) : (
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ border: '2px solid #fff', background: done ? '#fff' : 'transparent' }}
                >
                  {done && <Check size={13} color="#e2001a" strokeWidth={4} />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayScreen({ day, workout, onBack, onStart }) {
  const totalSeconds = workout.items.reduce((sum, item) => sum + item.seconds, 0);

  return (
    <div>
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#111' }}>
        <button onClick={onBack} className="text-[#e2001a] flex items-center gap-1 text-sm font-bold">
          <ChevronLeft size={18} /> Train
        </button>
        <div className="flex-1 text-center text-sm font-black text-fit-ink">Day {dayInWeek(day)}</div>
        <div style={{ width: 60 }} />
      </div>

      <div className="py-3 text-center text-sm font-black" style={{ background: '#4a4a4a', color: '#fff' }}>
        Total Workout Time: {formatSeconds(totalSeconds)}
      </div>

      <div>
        {workout.items.map((item, i) => (
          <div
            key={i}
            className="px-4 py-3.5 flex items-center justify-between"
            style={{ background: item.type === 'rest' ? '#151515' : '#1e1e1e', borderBottom: '1px solid #000' }}
          >
            <div>
              <div className="text-sm font-bold" style={{ color: '#fff' }}>{item.name}</div>
              <div className="text-xs font-bold" style={{ color: '#e2001a' }}>{item.seconds} Seconds</div>
            </div>
            {item.type === 'exercise' && (
              <div className="w-10 h-10 rounded" style={{ background: '#2a2a2a' }} />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 text-center text-sm font-black uppercase tracking-[0.16em]"
        style={{ background: '#e2001a', color: '#fff' }}
      >
        Start Workout
      </button>
    </div>
  );
}

function createRunnerState(workout) {
  return {
    itemIndex: 0,
    remaining: workout.items[0]?.seconds || 0,
    running: false,
    done: workout.items.length === 0,
  };
}

function advanceRunnerState(state, workout) {
  if (!state.running || state.done) return state;
  const remaining = state.remaining - 1;
  if (remaining > 0) return { ...state, remaining };
  const nextIndex = state.itemIndex + 1;
  if (nextIndex >= workout.items.length) return { ...state, remaining: 0, running: false, done: true };
  return { ...state, itemIndex: nextIndex, remaining: workout.items[nextIndex].seconds };
}

function RunnerScreen({ workout, onFinish, onBack }) {
  const [state, setState] = useState(() => createRunnerState(workout));

  useEffect(() => {
    if (!state.running || state.done) return undefined;
    const interval = window.setInterval(() => setState(s => advanceRunnerState(s, workout)), 1000);
    return () => window.clearInterval(interval);
  }, [state.running, state.done, workout]);

  useEffect(() => {
    if (state.done) onFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.done]);

  const current = workout.items[state.itemIndex];
  const next = workout.items[state.itemIndex + 1];

  if (!current) {
    return (
      <div className="p-6 text-center">
        <Check size={32} color="#e2001a" className="mx-auto mb-3" />
        <div className="text-lg font-black text-fit-ink">Workout fertig</div>
      </div>
    );
  }

  const isRest = current.type === 'rest';

  return (
    <div className="p-6">
      <button onClick={onBack} className="text-[#e2001a] flex items-center gap-1 text-sm font-bold mb-6">
        <ChevronLeft size={18} /> Abbrechen
      </button>

      <div className="text-center">
        <div className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#e2001a' }}>
          {isRest ? 'Rest' : `Übung ${workout.items.slice(0, state.itemIndex + 1).filter(i => i.type === 'exercise').length}`}
        </div>
        <div className="text-2xl font-black text-fit-ink mt-2">{current.name}</div>
        <div className="text-5xl font-black tabular-nums text-fit-ink mt-4">{formatSeconds(state.remaining)}</div>
      </div>

      {next && (
        <div className="text-center text-[11px] font-bold mt-6" style={{ color: 'var(--dim)' }}>
          Als Nächstes: {next.name}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setState(s => ({ ...s, running: !s.running }))}
          className="min-h-12 px-6 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em]"
          style={{ background: '#e2001a', color: '#fff' }}
        >
          {state.running ? <Pause size={16} strokeWidth={3} /> : <Play size={16} strokeWidth={3} />}
          {state.running ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
}

export default function SixPackPromiseCard() {
  const [program, setProgram] = useState(() => loadProgram());
  const [screen, setScreen] = useState('home');
  const [viewDay, setViewDay] = useState(null);
  const [adhocWorkout, setAdhocWorkout] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.localStorage.setItem(SIXPACK_PROGRAM_KEY, JSON.stringify(program));
    return undefined;
  }, [program]);

  function getWorkout(day) {
    if (program.workouts[day]) return program.workouts[day];
    const workout = generateDayWorkout(day);
    setProgram(p => ({ ...p, workouts: { ...p.workouts, [day]: workout } }));
    return workout;
  }

  function openDay(day) {
    getWorkout(day);
    setViewDay(day);
    setAdhocWorkout(null);
    setScreen('day');
  }

  function goHome() {
    setScreen('home');
  }

  function startWorkout() {
    setScreen('runner');
  }

  function startAdhoc(workout) {
    setAdhocWorkout(workout);
    setViewDay(null);
    setScreen('runner');
  }

  function finishWorkout() {
    if (adhocWorkout) return;
    setProgram(p => ({
      ...p,
      completedDays: p.completedDays.includes(viewDay) ? p.completedDays : [...p.completedDays, viewDay],
      currentDay: viewDay === p.currentDay ? p.currentDay + 1 : p.currentDay,
    }));
  }

  const activeWorkout = adhocWorkout || (viewDay ? getWorkout(viewDay) : null);

  // Solange dieser SubTab offen ist, kippt die ganze App ins 6-Pack-Promise
  // Rot/Schwarz (data-theme-Attribut auf documentElement, gleiches Pattern
  // wie SettingsContext.jsx für normales Theme-Switching). Vorherigen Wert
  // beim Verlassen wiederherstellen statt hart zurückzusetzen.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'sixpack');
    return () => {
      if (previous) root.setAttribute('data-theme', previous);
      else root.removeAttribute('data-theme');
    };
  }, []);

  return (
    <section className="rounded-[1.5rem] overflow-hidden" style={{ border: '1px solid var(--line)' }}>
        {screen === 'home' && <HomeScreen program={program} onOpenToday={() => openDay(program.currentDay)} onNav={setScreen} />}
        {screen === 'track' && <TrackScreen program={program} onBack={goHome} onOpenDay={openDay} />}
        {screen === 'eat' && <EatScreen onBack={goHome} />}
        {screen === 'learn' && <LearnScreen onBack={goHome} />}
        {screen === 'favorites' && <FavoritesScreen onBack={goHome} />}
        {screen === 'selfies' && <SelfiesScreen onBack={goHome} />}
        {screen === 'shuffle' && <ShuffleScreen onBack={goHome} onStart={startAdhoc} />}
        {screen === 'day' && activeWorkout && (
          activeWorkout.rest ? (
            <div className="p-6 text-center">
              <button onClick={goHome} className="text-[#e2001a] flex items-center gap-1 text-sm font-bold mb-6">
                <ChevronLeft size={18} /> Home
              </button>
              <div className="text-lg font-black text-fit-ink">Rest Day</div>
            </div>
          ) : (
            <DayScreen day={viewDay} workout={activeWorkout} onBack={goHome} onStart={startWorkout} />
          )
        )}
        {screen === 'runner' && activeWorkout && (
          <RunnerScreen workout={activeWorkout} onBack={() => setScreen(adhocWorkout ? 'shuffle' : 'day')} onFinish={finishWorkout} />
        )}
    </section>
  );
}
