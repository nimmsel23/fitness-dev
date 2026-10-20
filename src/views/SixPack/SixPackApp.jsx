import BackHeader from './BackHeader.jsx';
import SelfiesScreen from './SelfiesScreen.jsx';
import ExerciseDetailScreen from './ExerciseDetailScreen.jsx';
import { loadVideoUrls, videoDescriptor, SIXPACK_VIDEO_URLS_KEY } from './exerciseMedia.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Dumbbell, Shuffle, Check, ChevronLeft, ListChecks, UtensilsCrossed, BookOpen, Star, Camera, Video, Lightbulb, ChevronRight } from 'lucide-react';
import { newRunId } from './workoutDoc.js';
import { SIXPACK_CATEGORIES, SIXPACK_EXERCISE_DETAILS, SIXPACK_EXERCISE_POOL, SIXPACK_EXERCISE_COACHING, SIXPACK_CALISTHENICS_SKILLS, SIXPACK_VERIFIED_WORKOUTS } from './sixpackData.js';

const SIXPACK_PROGRAM_KEY = 'fitness-sixpack-program-v1';
const SIXPACK_FAVORITES_KEY = 'fitness-sixpack-workout-favorites-v1';

export function getFuelUrl({ hostname, protocol } = window.location) {
  if (hostname.endsWith('.web.app') || hostname.endsWith('.firebaseapp.com')) {
    return 'https://fuel-vos.web.app/';
  }
  return `${protocol}//${hostname}:7000/`;
}

const EXERCISE_CATEGORIES = SIXPACK_CATEGORIES;
const EXERCISE_POOL = SIXPACK_EXERCISE_POOL;
const EXERCISE_VIDEOS_BY_NAME = Object.fromEntries(
  Object.values(SIXPACK_EXERCISE_DETAILS).map(exercise => [exercise.name, exercise.videoUrl || ''])
);

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

// Gleiches Hash-Query-Pattern wie SkillsCard.jsx (getSkillIdFromHash/
// setSkillIdInHash) — bewusst dupliziert statt importiert, damit Timer und
// Skills unabhängig bleiben. App.jsx überschreibt den Hash beim Subtab-
// Wechsel zwar wieder ohne den skill-Query-Param (buildHashRoute kennt ihn
// nicht), aber SkillsCard hat den Wert dann schon aus der useState-
// Initializer-Funktion gelesen, bevor dieser Overwrite greift.
function setSkillIdInHash(skillId) {
  if (typeof window === 'undefined') return;
  const [pathPart = '', queryPart = ''] = window.location.hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(queryPart);
  if (skillId) params.set('skill', skillId);
  else params.delete('skill');
  const query = params.toString();
  window.history.replaceState(null, '', `#${pathPart}${query ? `?${query}` : ''}`);
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

function getVerifiedWorkout(day) {
  const preset = SIXPACK_VERIFIED_WORKOUTS[day];
  if (!preset) return null;
  return {
    day,
    rest: false,
    items: preset.items.map((item) => ({ ...item })),
    source: preset.source,
  };
}

// Generiert einen Tagesplan im Format des Day-8-Screenshots: 4-6 Übungen
// à 30 oder 60 Sekunden, dazwischen normal ein kurzer 5s-Übergang (unsichtbar
// in der Liste), aber 1-2x pro Workout ein echter Rest-Block (30 oder 45s),
// der als eigene Zeile erscheint — exakt wie "Rest · 45 Seconds" im Screenshot.
function generateDayWorkout(day) {
  if (isRestDay(day)) return { day, rest: true, exercises: [] };

  const verifiedWorkout = getVerifiedWorkout(day);
  if (verifiedWorkout) return verifiedWorkout;

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

// Lokales Kalenderdatum als YYYY-MM-DD (String-Vergleich = Datumsvergleich).
function localDate(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + days));
}

const EMPTY_PROGRAM = { currentDay: 1, completedDays: [], completedOn: {}, lastCompletedOn: null, restDate: null, workouts: {} };

function loadProgram() {
  if (typeof window === 'undefined') return EMPTY_PROGRAM;
  try {
    const raw = window.localStorage.getItem(SIXPACK_PROGRAM_KEY);
    if (!raw) return EMPTY_PROGRAM;
    const parsed = JSON.parse(raw);
    return syncProgramToDate({
      currentDay: parsed.currentDay || 1,
      completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays : [],
      completedOn: parsed.completedOn || {},
      lastCompletedOn: parsed.lastCompletedOn || null,
      restDate: parsed.restDate || null,
      workouts: parsed.workouts || {},
    });
  } catch {
    return EMPTY_PROGRAM;
  }
}

// Ein Programm-Tag = ein Kalendertag. Ruhetage (Tag 3/7 jeder Woche) belegen
// den Kalendertag nach dem letzten Workout und gelten am Folgetag automatisch
// als erledigt — sonst bliebe das Programm auf dem Ruhetag stehen.
function syncProgramToDate(program, today = localDate()) {
  let p = program;
  while (isRestDay(p.currentDay)) {
    const restDate = p.restDate || (p.lastCompletedOn ? addDays(p.lastCompletedOn, 1) : today);
    if (restDate >= today) return p.restDate === restDate ? p : { ...p, restDate };
    p = {
      ...p,
      completedDays: p.completedDays.includes(p.currentDay) ? p.completedDays : [...p.completedDays, p.currentDay],
      completedOn: { ...p.completedOn, [p.currentDay]: restDate },
      currentDay: p.currentDay + 1,
      lastCompletedOn: restDate,
      restDate: null,
    };
  }
  return p;
}

function HomeScreen({ program, onOpenToday, onNav }) {
  const today = localDate();
  // Heute schon trainiert → für den Rest des Tages Rest anzeigen.
  const trainedToday = program.lastCompletedOn === today;
  const restDayToday = !trainedToday && isRestDay(program.currentDay);
  const lastDone = program.currentDay - 1;
  const menuButtons = [
    { id: 'eat', label: 'Eat', Icon: UtensilsCrossed, href: getFuelUrl() },
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
          {trainedToday
            ? `Woche ${weekOf(lastDone)} · Tag ${dayInWeek(lastDone)} ✓`
            : `Woche ${weekOf(program.currentDay)} · Tag ${dayInWeek(program.currentDay)}`}
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
          {trainedToday ? 'Rest' : restDayToday ? 'Rest Day' : "Today's Workout"}
        </div>
        {(trainedToday || restDayToday) && (
          <div className="px-4 py-2 text-center text-[11px] font-bold" style={{ background: '#111', color: 'var(--dim)' }}>
            {trainedToday
              ? `Tag ${dayInWeek(lastDone)} erledigt ✓ · Morgen: ${isRestDay(program.currentDay) ? 'Rest Day' : `Tag ${dayInWeek(program.currentDay)}`}`
              : `Erholung · Morgen: Tag ${dayInWeek(program.currentDay + 1)}`}
          </div>
        )}
      </button>

      <div className="grid grid-cols-3 gap-px mt-px" style={{ background: 'var(--line)' }}>
        {menuButtons.map(({ id, label, Icon, href }) => {
          const Element = href ? 'a' : 'button';
          return (
            <Element key={id} href={href} onClick={href ? undefined : () => onNav(id)} className="py-5 flex flex-col items-center gap-2" style={{ background: '#141414' }}>
              <Icon size={18} color="#e2001a" />
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-fit-ink">{label}</span>
            </Element>
          );
        })}
      </div>
    </div>
  );
}


function LearnScreen({ onBack, onOpenSkill, onOpenExercise, onOpenNote, coachingNotes }) {
  const [query, setQuery] = useState('');

  const visibleCore = useMemo(() => {
    const list = Object.values(SIXPACK_EXERCISE_DETAILS).sort((a, b) => a.name.localeCompare(b.name));
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((ex) => [ex.id, ex.name, ex.category, ex.focusLabel].join(' ').toLowerCase().includes(q));
  }, [query]);

  const visibleSkills = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SIXPACK_CALISTHENICS_SKILLS;
    return SIXPACK_CALISTHENICS_SKILLS.filter((skill) => [skill.id, skill.name, skill.tier, ...skill.progressions].join(' ').toLowerCase().includes(q));
  }, [query]);

  const visibleNotes = useMemo(() => {
    const list = coachingNotes;
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((n) => [n.id, n.title, ...(n.tags || [])].join(' ').toLowerCase().includes(q));
  }, [query, coachingNotes]);

  return (
    <div>
      <BackHeader label="Learn" onBack={onBack} />
      <div className="px-4 py-2 text-[11px] font-bold" style={{ color: 'var(--dim)' }}>
        Core-Übungen aus dem 6-Pack-Programm{onOpenSkill ? ' + Calisthenics-Skill-Progressionen.' : '.'}
      </div>
      <div className="px-4 pb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Exercise oder Skill suchen..."
          className="w-full rounded-xl px-3 py-2 text-sm"
          style={{ background: '#141414', color: '#fff', border: '1px solid #2a2a2a' }}
        />
      </div>

      <div className="px-4 pt-2 pb-1 text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: '#e2001a' }}>
        Core ({visibleCore.length})
      </div>
      <div>
        {visibleCore.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => onOpenExercise?.(exercise.id)}
            className="w-full px-4 py-3 text-left"
            style={{ background: '#1a1a1a', borderBottom: '1px solid #000' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold" style={{ color: '#fff' }}>{exercise.name}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.1em] mt-1" style={{ color: '#e2001a' }}>
                  {exercise.focusLabel}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold shrink-0" style={{ color: 'var(--dim)' }}>
                <BookOpen size={13} />
                {exercise.verifiedDays.length > 0 ? `Tag ${exercise.verifiedDays.join(', ')}` : 'Pool'}
              </div>
            </div>
          </button>
        ))}
      </div>

      {onOpenSkill && <>
        <div className="px-4 pt-4 pb-1 text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: '#e2001a' }}>
          Calisthenics Skills ({visibleSkills.length})
        </div>
        <div>{visibleSkills.map((skill) => (
          <button
            key={skill.id}
            onClick={() => onOpenSkill?.(skill.id)}
            className="w-full px-4 py-3 text-left"
            style={{ background: '#1a1a1a', borderBottom: '1px solid #000' }}
          >
            <div>
              <div className="text-sm font-bold" style={{ color: '#fff' }}>{skill.name}</div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--dim)' }}>
                {skill.progressions.join(' → ')}
              </div>
            </div>
          </button>
        ))}</div>
      </>}

      {visibleNotes.length > 0 && (
        <>
          <div className="px-4 pt-4 pb-1 text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: '#e2001a' }}>
            Wisdom ({visibleNotes.length})
          </div>
          <div>
            {visibleNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onOpenNote?.(note.id)}
                className="w-full px-4 py-3 text-left flex items-start gap-2.5"
                style={{ background: '#1a1a1a', borderBottom: '1px solid #000' }}
              >
                <Lightbulb size={15} color="#e2001a" className="mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-bold" style={{ color: '#fff' }}>{note.title}</div>
                  {note.summary && (
                    <div className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--dim)' }}>
                      {note.summary.trim()}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NoteDetailScreen({ note, onBack }) {
  if (!note) return null;
  return (
    <div>
      <BackHeader label={note.title} onBack={onBack} />
      <div className="px-4 py-3">
        {note.summary && (
          <div className="text-sm font-bold mb-4" style={{ color: '#fff', background: '#1a1a1a', borderRadius: '0.75rem', padding: '0.7rem 0.9rem' }}>
            {note.summary.trim()}
          </div>
        )}
        {note.body && (
          <div className="text-sm whitespace-pre-line mb-4" style={{ color: 'var(--dim)', lineHeight: 1.6 }}>
            {note.body.trim()}
          </div>
        )}
        {note.follow_up?.length > 0 && (
          <div className="pb-6">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] mb-2" style={{ color: '#e2001a' }}>
              Häufige Rückfragen
            </div>
            <ul className="space-y-2">
              {note.follow_up.map((fu, i) => (
                <li key={i} className="text-sm" style={{ background: '#1a1a1a', borderRadius: '0.75rem', padding: '0.6rem 0.8rem' }}>
                  <div className="font-bold" style={{ color: '#fff' }}>{fu.question}</div>
                  <div className="mt-1" style={{ color: 'var(--dim)' }}>{fu.answer?.trim?.() || fu.answer}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function loadFavorites() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(SIXPACK_FAVORITES_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(favorite =>
      typeof favorite?.id === 'string' && typeof favorite?.label === 'string' &&
      Array.isArray(favorite.workout?.items) && favorite.workout.items.length > 0 &&
      favorite.workout.items.every(item => item && ['exercise', 'rest'].includes(item.type) &&
        typeof item.name === 'string' && Number.isFinite(item.seconds) && item.seconds > 0)
    ) : [];
  } catch {
    return [];
  }
}

function workoutFavoriteId(workout) {
  return JSON.stringify([workout.day ?? null, workout.items.map(({ type, name, seconds }) => [type, name, seconds])]);
}

function FavoriteWorkoutButton({ active, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className="w-full px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold"
      style={{ background: '#1a1a1a', color: '#fff' }}>
      <Star size={18} color="#e2001a" fill={active ? '#e2001a' : 'none'} />
      {active ? 'Workout aus Favoriten entfernen' : 'Workout favorisieren'}
    </button>
  );
}

function WorkoutExerciseRow({ item, onOpen }) {
  const content = <>
    <div>
      {item.category && <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#e2001a' }}>{item.category}</div>}
      <div className="text-sm font-bold" style={{ color: '#fff' }}>{item.name}</div>
      <div className="text-xs font-bold" style={{ color: '#e2001a' }}>{item.seconds} Seconds</div>
    </div>
    {item.type === 'exercise' && <ChevronRight size={20} aria-hidden="true" style={{ color: '#e2001a' }} />}
  </>;
  const className = 'w-full px-4 py-3.5 flex items-center justify-between text-left';
  const style = { background: item.type === 'rest' ? '#151515' : '#1e1e1e', borderBottom: '1px solid #000' };
  return item.type === 'exercise'
    ? <button type="button" className={className} style={style} aria-label={`Details zu ${item.name}`} onClick={event => onOpen(item, event?.currentTarget)}>{content}</button>
    : <div className={className} style={style}>{content}</div>;
}

function FavoritesScreen({ favorites, onBack, onStart, onRemove, onOpenExercise }) {
  return (
    <div>
      <BackHeader label="Favorites" onBack={onBack} />
      <div>
        {favorites.length === 0 && (
          <div className="p-6 text-center text-sm" style={{ color: 'var(--dim)' }}>
            Noch keine Lieblingsworkouts. Markiere ein Workout bei Today’s Workout, Track oder Shuffle mit dem Stern.
          </div>
        )}
        {favorites.map(({ id, label, workout }) => (
          <div key={id} className="px-4 py-4" style={{ background: '#1a1a1a', borderBottom: '1px solid #000' }}>
            <details>
              <summary className="cursor-pointer text-sm font-bold" style={{ color: '#fff' }}>
                {label} · {workout.items.filter(item => item.type === 'exercise').length} Übungen · {formatSeconds(workoutTotalSeconds(workout.items))}
              </summary>
              <ol className="mt-3 space-y-1 text-sm" style={{ color: 'var(--dim)' }}>
                {workout.items.map((item, index) => <li key={index}><WorkoutExerciseRow item={item} onOpen={onOpenExercise} /></li>)}
              </ol>
            </details>
            <div className="flex gap-3 mt-3">
              <button onClick={() => onStart(workout)} className="flex-1 py-3 text-sm font-black" style={{ background: '#e2001a', color: '#fff' }}>Start Workout</button>
              <button onClick={() => onRemove(id)} aria-label={`${label} aus Favoriten entfernen`} className="px-3">
                <Star size={18} color="#e2001a" fill="#e2001a" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShuffleScreen({ onBack, onStart, favorites, onToggleFavorite, onOpenExercise }) {
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
      <FavoriteWorkoutButton active={favorites.some(favorite => favorite.id === workoutFavoriteId(workout))} onClick={() => onToggleFavorite(workout)} />
      <div className="px-4 py-2 text-[11px] font-bold" style={{ color: 'var(--dim)' }}>
        Ein Übung je Kategorie: Lower Abs → Bottom-up Rotation → Top-down Rotation → Upper Abs.
      </div>
      {categoryRoutine.map(ex => <WorkoutExerciseRow key={ex.categoryId} item={{ ...ex, type: 'exercise' }} onOpen={onOpenExercise} />)}
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

function DayScreen({ day, workout, onBack, onStart, isFavorite, onToggleFavorite, onOpenExercise }) {
  const totalSeconds = workoutTotalSeconds(workout.items);

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
      <FavoriteWorkoutButton active={isFavorite} onClick={() => onToggleFavorite(workout)} />

      <div>
        {workout.items.map((item, i) => <WorkoutExerciseRow key={i} item={item} onOpen={onOpenExercise} />)}
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

// Musik anderer Apps (Spotify etc.) darf NIE pausieren — weder beim Öffnen der App noch beim
// Start einer Übung. iOS: Kategorie "ambient" mischt mit laufender Musik; sie muss gesetzt sein,
// BEVOR irgendein Audio (AudioContext, Sprachausgabe) startet. Darum schon beim Laden des Moduls,
// vor jedem Audio-Start und nach jeder Rückkehr in die App (iOS setzt sie dabei gern zurück).
function keepMusicPlaying() {
  try {
    if (typeof navigator !== 'undefined' && navigator.audioSession) navigator.audioSession.type = 'ambient';
  } catch {
    // ältere Browser ohne Audio Session API: nichts zu tun
  }
}
keepMusicPlaying();
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') keepMusicPlaying();
  });
  window.addEventListener('pageshow', keepMusicPlaying);
}

// Kurzer Übergang zwischen zwei direkt aufeinanderfolgenden Übungen (Zeit zum
// Umpositionieren). Vor/nach einem echten Rest-Block entfällt er.
const TRANSITION_SECONDS = 5;

function needsTransition(items, index) {
  return items[index]?.type === 'exercise' && items[index + 1]?.type === 'exercise';
}

function workoutTotalSeconds(items) {
  return items.reduce((sum, item, i) => sum + item.seconds + (needsTransition(items, i) ? TRANSITION_SECONDS : 0), 0);
}

function createRunnerState(workout) {
  return {
    itemIndex: 0,
    remaining: workout.items[0]?.seconds || 0,
    transition: false,
    running: false,
    done: workout.items.length === 0,
  };
}

function advanceRunnerState(state, workout) {
  if (!state.running || state.done) return state;
  const remaining = state.remaining - 1;
  if (remaining > 0) return { ...state, remaining };
  if (!state.transition && needsTransition(workout.items, state.itemIndex)) {
    return { ...state, transition: true, remaining: TRANSITION_SECONDS };
  }
  const nextIndex = state.itemIndex + 1;
  if (nextIndex >= workout.items.length) return { ...state, remaining: 0, transition: false, running: false, done: true };
  return { ...state, itemIndex: nextIndex, transition: false, remaining: workout.items[nextIndex].seconds };
}

function RunnerScreen({ workout, onFinish, onBack }) {
  const [state, setState] = useState(() => createRunnerState(workout));
  const completionReported = useRef(false);
  const startedAtRef = useRef(Date.now());
  const runIdRef = useRef(newRunId());
  const announcedStep = useRef(null);
  const lastCountdownBeep = useRef(null);
  const audioContext = useRef(null);
  const speechUnlocked = useRef(false);
  // Start-Intro: Willkommen + erste Übung + "begin in 3, 2, 1" + langer Ton, danach läuft die Zeit.
  const [intro, setIntro] = useState(false);
  const introTimers = useRef([]);
  const introDone = useRef(false);
  const introToken = useRef(0); // macht abgebrochene Intros wirkungslos (speechSynthesis.cancel() feuert onend/onerror)
  const [videoUrls, setVideoUrls] = useState(loadVideoUrls);
  const [videoError, setVideoError] = useState(false);

  function beep(frequency = 880, { duration = 0.18, delay = 0 } = {}) {
    const context = audioContext.current;
    if (!context || context.state !== 'running') return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.2, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  // Start einer Übung/Pause: hoher, kurzer "Piep". Übungsende: klarer
  // zweistufiger "Piep-Tüt"-Ton, damit der Abschluss auch neben Sprache hörbar bleibt.
  const startBeep = (delay = 0) => beep(990, { delay });
  const endBeep = () => {
    beep(660, { duration: 0.16 });
    beep(440, { duration: 0.38, delay: 0.2 });
  };

  // Beste verfügbare Stimme je Sprache: Online-/Premium-Stimmen (Google
  // "Natural", Apple "Enhanced"/"Premium") klingen deutlich weniger blechern
  // als der mechanische Offline-Default. `getVoices()` liefert auf manchen
  // Plattformen erst nach dem `voiceschanged`-Event etwas — Cache einmalig
  // befüllen, nicht pro Ansage neu auflösen.
  const voicesCache = useRef(null);
  function bestVoice(lang) {
    if (!('speechSynthesis' in window)) return null;
    if (!voicesCache.current) voicesCache.current = window.speechSynthesis.getVoices();
    const voices = voicesCache.current.filter(v => v.lang === lang || v.lang.startsWith(lang.split('-')[0]));
    if (voices.length === 0) return null;
    const premium = voices.find(v => /natural|enhanced|premium/i.test(v.name));
    if (premium) return premium;
    const google = voices.find(v => /google/i.test(v.name));
    if (google) return google;
    return voices[0];
  }

  function speak(text, lang, { pitch = 1, rate = 1, onend } = {}) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.pitch = pitch;
    utterance.rate = rate;
    if (onend) {
      utterance.onend = onend;
      utterance.onerror = onend;
    }
    const voice = bestVoice(lang);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }

  // Zwei direkt aufeinanderfolgende Items mit gleichem Namen = dieselbe
  // Übung für die zweite Seite (z.B. "Side Plank Lifts" zweimal in Folge).
  function isSideSwitch(index) {
    const item = workout.items[index];
    const previous = workout.items[index - 1];
    return item?.type === 'exercise' && previous?.type === 'exercise' && previous.name === item.name;
  }

  // Alle Sprachansagen sind komplett Englisch (en-US).
  const secondsText = (n) => `${n} ${n === 1 ? 'second' : 'seconds'}`;

  // Name + Dauer, z.B. "Crunches" … "30 seconds" bzw. "Rest, 45 seconds".
  // Bei Seitenwechsel ("Side Plank Lifts" → "Side Plank Lifts") zusätzlich
  // explizit "Switch sides" ansagen, sonst wirkt die Wiederholung wie ein
  // Fehler in der Ansage statt wie der geplante zweite Durchgang.
  function announce(item, index) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (item.type === 'rest') {
      speak(`Rest, ${secondsText(item.seconds)}`, 'en-US');
    } else {
      if (index != null && isSideSwitch(index)) speak('Switch sides', 'en-US');
      speak(item.name, 'en-US');
      speak(secondsText(item.seconds), 'en-US');
    }
  }

  // Seite bei einseitigen Übungen (dieselbe Übung zweimal direkt hintereinander): erste Hälfte = linke Seite.
  function firstSideLabel(index) {
    const item = workout.items[index];
    const following = workout.items[index + 1];
    return item?.type === 'exercise' && following?.type === 'exercise' && following.name === item.name ? 'left side' : '';
  }

  function clearIntroTimers() {
    introTimers.current.forEach(window.clearTimeout);
    introTimers.current = [];
  }

  function cancelIntro() {
    introToken.current += 1;
    clearIntroTimers();
    window.speechSynthesis?.cancel();
    introDone.current = false; // beim nächsten Start wieder von vorn
    setIntro(false);
  }

  // "Welcome … <Übung>[, left side], begin in 3, 2, 1" + langer Ton ("tüüt"), dann startet die Zeit.
  function startIntro() {
    introDone.current = true;
    const token = (introToken.current += 1);
    const alive = () => token === introToken.current;
    setIntro(true);
    const first = workout.items[0];
    const label = first?.type === 'exercise' ? first.name : 'Rest';
    const side = firstSideLabel(0);
    const later = (fn, ms) => introTimers.current.push(window.setTimeout(fn, ms));

    const go = () => {
      if (!alive()) return;
      // Intro hat die erste Übung bereits angesagt → der normale Start-Effekt soll sie nicht doppelt ansagen.
      announcedStep.current = '0:false';
      lastCountdownBeep.current = null;
      beep(990, { duration: 0.6 });
      setIntro(false);
      setState(s => ({ ...s, running: true }));
    };
    const countdown = () => {
      if (!alive()) return;
      if ('speechSynthesis' in window) speak('3', 'en-US'); else beep(660);
      later(() => ('speechSynthesis' in window ? speak('2', 'en-US') : beep(660)), 1000);
      later(() => ('speechSynthesis' in window ? speak('1', 'en-US') : beep(660)), 2000);
      later(go, 3000);
    };

    if (!('speechSynthesis' in window)) {
      countdown();
      return;
    }
    window.speechSynthesis.cancel();
    speak("Welcome to 6Pack. Let's go.", 'en-US');
    let continued = false;
    const proceed = () => {
      if (continued || !alive()) return;
      continued = true;
      countdown();
    };
    speak(`${label}${side ? `, ${side}` : ''}. Begin in`, 'en-US', { onend: proceed });
    later(proceed, 12000); // Sicherung, falls onend nie feuert (manche iOS-Versionen)
  }

  useEffect(() => {
    if (!state.running && !state.done) return;
    const step = state.done ? 'done' : `${state.itemIndex}:${state.transition}`;
    if (announcedStep.current === step) return;
    const previousStep = announcedStep.current;
    announcedStep.current = step;
    lastCountdownBeep.current = null;
    setVideoError(false);
    // Eine Übung/Pause ist gerade zu Ende gegangen (nicht der 5s-Wechsel).
    const itemEnded = previousStep !== null && !previousStep.endsWith(':true');
    if (itemEnded) endBeep();
    if (state.done) {
      if ('speechSynthesis' in window) speak("Congratulations. You've completed today's workout.", 'en-US');
      return;
    }
    if (state.transition) {
      // Nächste Übung schon im Übergang ansagen, damit man sich in Position bringen kann.
      const nextIndex = state.itemIndex + 1;
      const nextItem = workout.items[nextIndex];
      if (nextItem) announce(nextItem, nextIndex);
      return;
    }
    const item = workout.items[state.itemIndex];
    if (!item) return;
    // Start-Piep nach dem End-Tüt versetzt, damit sich die Töne nicht überlagern.
    startBeep(itemEnded ? 0.55 : 0);
    // Nach einem Übergang wurde die Übung bereits angesagt — nur der Start-Piep.
    if (previousStep !== `${state.itemIndex - 1}:true`) announce(item, state.itemIndex);
  }, [state.itemIndex, state.transition, state.running, state.done, workout]);

  // Warnton + "30 seconds left" bei 30 s Restzeit einer laufenden Übung. Nur bei Übungen, die länger als
  // 30 s dauern (bei genau 30 s wäre es der Start) und nicht in Rest/Wechsel.
  const announcedThirtySecondsStep = useRef(null);
  useEffect(() => {
    const item = workout.items[state.itemIndex];
    const step = `${state.itemIndex}:${state.transition}`;
    if (!state.running || state.transition || item?.type !== 'exercise' || item.seconds <= 30) return;
    if (state.remaining !== 30) {
      if (state.remaining > 30) announcedThirtySecondsStep.current = null;
      return;
    }
    if (announcedThirtySecondsStep.current === step) return;
    announcedThirtySecondsStep.current = step;
    beep(660, { duration: 0.3 });
    speak('30 seconds left', 'en-US');
  }, [state.itemIndex, state.transition, state.remaining, state.running, workout]);

  // "10 seconds left" während einer laufenden Übung (nicht Rest/Wechsel) —
  // Zeit genug, den letzten Rep anzusetzen statt vom Pieps-Ende überrascht zu werden.
  const announcedTenSecondsStep = useRef(null);
  useEffect(() => {
    const item = workout.items[state.itemIndex];
    const step = `${state.itemIndex}:${state.transition}`;
    if (!state.running || state.transition || item?.type !== 'exercise') return;
    if (state.remaining !== 10) {
      if (state.remaining > 10) announcedTenSecondsStep.current = null;
      return;
    }
    if (announcedTenSecondsStep.current === step) return;
    announcedTenSecondsStep.current = step;
    speak('10 seconds left', 'en-US');
  }, [state.itemIndex, state.transition, state.remaining, state.running, workout]);

  useEffect(() => {
    const item = workout.items[state.itemIndex];
    const isPause = state.transition || item?.type === 'rest';
    if (!state.running || !isPause || state.remaining > 3 || state.remaining < 1) return;
    if (lastCountdownBeep.current === state.remaining) return;
    lastCountdownBeep.current = state.remaining;
    beep();
  }, [state.itemIndex, state.transition, state.remaining, state.running, workout]);

  useEffect(() => () => {
    introToken.current += 1;
    introTimers.current.forEach(window.clearTimeout);
    window.speechSynthesis?.cancel();
    audioContext.current?.close();
  }, []);

  // Bildschirm während des Workouts anlassen (Screen Wake Lock API). Der Lock
  // fällt bei App-/Tab-Wechsel automatisch weg → bei Rückkehr neu anfordern.
  useEffect(() => {
    if (state.done || !('wakeLock' in navigator)) return undefined;
    let lock = null;
    let cancelled = false;
    async function acquire() {
      if (document.visibilityState !== 'visible' || (lock && !lock.released)) return;
      try {
        const acquired = await navigator.wakeLock.request('screen');
        if (cancelled) acquired.release();
        else lock = acquired;
      } catch {
        // z.B. Energiesparmodus — dann geht der Screen eben nach System-Timeout aus.
      }
    }
    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', acquire);
      lock?.release();
    };
  }, [state.done, state.running]);

  useEffect(() => {
    if (!state.running || state.done) return undefined;
    const interval = window.setInterval(() => setState(s => advanceRunnerState(s, workout)), 1000);
    return () => window.clearInterval(interval);
  }, [state.running, state.done, workout]);

  useEffect(() => {
    if (state.done && !completionReported.current) {
      completionReported.current = true;
      onFinish({ startedAt: startedAtRef.current, runId: runIdRef.current });
    }
  }, [state.done, onFinish]);

  const current = workout.items[state.itemIndex];
  const next = workout.items[state.itemIndex + 1];
  const selectedVideoUrl = current?.type === 'exercise'
    ? (videoUrls[current.name] ?? current.videoUrl ?? EXERCISE_VIDEOS_BY_NAME[current.name] ?? '')
    : '';
  const video = videoDescriptor(selectedVideoUrl);
  const videoUrl = video?.src;

  function toggleRunning() {
    if (intro) {
      // Tippen während des Intros = abbrechen (wie Pause)
      cancelIntro();
      return;
    }
    if (!state.running) {
      // iOS Safari: Töne/Ansagen mit laufender Musik (Spotify etc.) mischen,
      // statt sie zu stoppen. Ohne das übernimmt Web Audio die Audio-Session.
      keepMusicPlaying();
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass && !audioContext.current) audioContext.current = new AudioContextClass();
      audioContext.current?.resume();
      // iOS Safari gibt Sprachausgabe erst frei, wenn speak() direkt im Tap
      // aufgerufen wurde — die eigentlichen Ansagen laufen aber im useEffect.
      if ('speechSynthesis' in window && !speechUnlocked.current) {
        const unlock = new SpeechSynthesisUtterance(' ');
        unlock.volume = 0;
        window.speechSynthesis.speak(unlock);
        speechUnlocked.current = true;
      }
    } else {
      window.speechSynthesis?.cancel();
    }
    // Erster Start des Workouts: erst das Intro (Willkommen, erste Übung, 3-2-1), dann läuft die Zeit.
    if (!state.running && !introDone.current && state.itemIndex === 0 && !state.transition) {
      startIntro();
      return;
    }
    setState(s => ({ ...s, running: !s.running }));
  }

  function updateVideoUrl(value) {
    setVideoError(false);
    setVideoUrls(previous => {
      const next = { ...previous, [current.name]: value };
      window.localStorage.setItem(SIXPACK_VIDEO_URLS_KEY, JSON.stringify(next));
      return next;
    });
  }

  if (state.done || !current) {
    return (
      <div className="p-6 text-center">
        <Check size={32} color="#e2001a" className="mx-auto mb-3" />
        <div className="text-lg font-black text-fit-ink">Workout fertig</div>
        <button onClick={onBack} className="mt-5 min-h-12 px-6 rounded-2xl text-sm font-black" style={{ background: '#e2001a', color: '#fff' }}>
          Zurück
        </button>
      </div>
    );
  }

  const isRest = current.type === 'rest';

  if (state.transition) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="text-[#e2001a] flex items-center gap-1 text-sm font-bold mb-6">
          <ChevronLeft size={18} /> Abbrechen
        </button>
        <div className="text-center">
          <div className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#e2001a' }}>Wechsel</div>
          <div className="text-sm font-bold mt-2" style={{ color: 'var(--dim)' }}>Als Nächstes</div>
          <div className="text-2xl font-black text-fit-ink mt-1">{next?.name}</div>
          <div className="text-5xl font-black tabular-nums text-fit-ink mt-4">{formatSeconds(state.remaining)}</div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={toggleRunning}
            className="min-h-12 px-6 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em]"
            style={{ background: '#e2001a', color: '#fff' }}
          >
            {state.running || intro ? <Pause size={16} strokeWidth={3} /> : <Play size={16} strokeWidth={3} />}
            {state.running || intro ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>
    );
  }

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

      {!isRest && (
        <div className="mt-6">
          <div className="aspect-video rounded-2xl overflow-hidden flex items-center justify-center text-center" style={{ background: '#111', border: '1px solid var(--line)' }}>
            {videoUrl && !videoError ? (
              video.kind === 'embed' ? <iframe key={videoUrl} src={videoUrl} title={`Übungsvideo: ${current.name}`} className="w-full h-full border-0" allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen /> : <video key={videoUrl} src={videoUrl} autoPlay muted loop playsInline controls className="w-full h-full object-contain" onError={() => setVideoError(true)} />
            ) : (
              <span className="text-xs px-4" style={{ color: 'var(--dim)' }}>
                {videoError ? 'Video konnte nicht geladen werden.' : 'Noch kein Video für diese Übung hinterlegt.'}
              </span>
            )}
          </div>
          <label className="block text-xs font-bold mt-3" style={{ color: 'var(--dim)' }}>
            Video-URL für {current.name}
            <input
              type="url"
              value={selectedVideoUrl}
              onChange={event => updateVideoUrl(event.target.value)}
              placeholder="https://…/uebung.mp4"
              className="block w-full min-h-12 px-3 mt-2 rounded-xl text-sm text-fit-ink"
              style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}
            />
          </label>
        </div>
      )}

      {next && (
        <div className="text-center text-[11px] font-bold mt-6" style={{ color: 'var(--dim)' }}>
          Als Nächstes: {next.name}
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={toggleRunning}
          className="min-h-12 px-6 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em]"
          style={{ background: '#e2001a', color: '#fff' }}
        >
          {state.running || intro ? <Pause size={16} strokeWidth={3} /> : <Play size={16} strokeWidth={3} />}
          {state.running || intro ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
}

// Activity Finisher: nach JEDEM abgeschlossenen 6Pack-Workout wird automatisch ein Core-HIIT-Finisher
// (5 Minuten) mitgeloggt — im Fitness-Activity-Format (type 'hiit', Muskelziel core), damit er in
// Coverage/Superkompensation wie ein manuell erfasstes HIIT zählt. Dauer hier anpassen.
const FINISHER_MINUTES = 5;
const CORE_HIIT_FINISHER = {
  type: 'hiit',
  muscleTarget: 'core',
  muscles: ['core'],
  primaryMuscles: [],
  duration: FINISHER_MINUTES,
  label: 'Activity Finisher · Core HIIT',
  finisher: true,
};

export default function SixPackPromiseCard({ onSubNav, coachingNotes = [], uid, onWorkoutComplete }) {
  const [program, setProgram] = useState(() => loadProgram());
  const [favorites, setFavorites] = useState(loadFavorites);
  const [adhocReturnScreen, setAdhocReturnScreen] = useState('shuffle');

  // App bleibt auf dem iPhone oft über Nacht offen → beim Zurückkehren und
  // jede Minute auf den neuen Kalendertag nachziehen (Ruhetag abschließen).
  useEffect(() => {
    const sync = () => setProgram(p => syncProgramToDate(p));
    document.addEventListener('visibilitychange', sync);
    const interval = window.setInterval(sync, 60_000);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      window.clearInterval(interval);
    };
  }, []);
  const [screen, setScreen] = useState('home');
  const [viewDay, setViewDay] = useState(null);
  const [adhocWorkout, setAdhocWorkout] = useState(null);
  const [viewExerciseId, setViewExerciseId] = useState(null);
  const [viewExerciseItem, setViewExerciseItem] = useState(null);
  const [exerciseReturnScreen, setExerciseReturnScreen] = useState('learn');
  const exerciseTrigger = useRef(null);
  const [viewNoteId, setViewNoteId] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.localStorage.setItem(SIXPACK_PROGRAM_KEY, JSON.stringify(program));
    return undefined;
  }, [program]);

  function toggleFavorite(workout) {
    const id = workoutFavoriteId(workout);
    const next = favorites.some(favorite => favorite.id === id)
      ? favorites.filter(favorite => favorite.id !== id)
      : [...favorites, {
        id,
        label: workout.day ? `Woche ${weekOf(workout.day)} · Tag ${dayInWeek(workout.day)}` : 'Shuffle Workout',
        workout: { ...workout, items: workout.items.map(item => ({ ...item })) },
      }];
    window.localStorage.setItem(SIXPACK_FAVORITES_KEY, JSON.stringify(next));
    setFavorites(next);
  }

  function removeFavorite(id) {
    const next = favorites.filter(favorite => favorite.id !== id);
    window.localStorage.setItem(SIXPACK_FAVORITES_KEY, JSON.stringify(next));
    setFavorites(next);
  }

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

  // Springt vom Timer-Learn-Screen in den Skills-Subtab und öffnet dort
  // direkt das SkillDetailScreen des angeklickten Skills (gleiche IDs wie
  // SkillsCard.jsx's SKILLS-Array, siehe sixpackData.js-Kommentar).
  function openSkill(skillId) {
    setSkillIdInHash(skillId);
    onSubNav?.('skills');
  }

  function openExercise(value, returnScreen = 'learn', trigger = null) {
    exerciseTrigger.current = trigger;
    const item = typeof value === 'string' ? { exerciseId: value } : value;
    const exercise = SIXPACK_EXERCISE_DETAILS[item.exerciseId] || Object.values(SIXPACK_EXERCISE_DETAILS).find(ex => ex.name === item.name);
    setViewExerciseId(exercise?.id || null);
    setViewExerciseItem(item);
    setExerciseReturnScreen(returnScreen);
    setScreen('exercise');
  }

  function closeExercise() {
    setScreen(exerciseReturnScreen);
    window.requestAnimationFrame?.(() => exerciseTrigger.current?.focus?.({ preventScroll: true }));
  }

  function openNote(noteId) {
    setViewNoteId(noteId);
    setScreen('note');
  }

  function startAdhoc(workout, returnScreen = 'shuffle') {
    setAdhocReturnScreen(returnScreen);
    setAdhocWorkout(workout);
    setViewDay(null);
    setScreen('runner');
  }

  function finishWorkout({ startedAt, runId } = {}) {
    const doneWorkout = adhocWorkout || (viewDay ? getWorkout(viewDay) : null);
    if (doneWorkout && onWorkoutComplete) {
      const byName = new Map();
      (doneWorkout.items || []).filter(i => i.type === 'exercise').forEach(i => {
        byName.set(i.name, [...(byName.get(i.name) || []), { seconds: i.seconds }]);
      });
      onWorkoutComplete({
        block: '6Pack',
        source: 'sixpack',
        modality: 'core',
        program: adhocWorkout ? { id: 'sixpack', adhoc: true } : { id: 'sixpack', day: viewDay },
        runId,
        startedAt: startedAt || Date.now(),
        endedAt: Date.now(),
        notes: `${adhocWorkout ? '6Pack · freies Workout' : `6Pack · Tag ${viewDay}`} · Finisher Core HIIT ${FINISHER_MINUTES} min`,
        activity: { ...CORE_HIIT_FINISHER },
        exercises: [...byName].map(([name, sets]) => ({ name, sets })),
      });
    }
    if (adhocWorkout) return;
    const today = localDate();
    setProgram(p => {
      const advances = viewDay === p.currentDay;
      return syncProgramToDate({
        ...p,
        completedDays: p.completedDays.includes(viewDay) ? p.completedDays : [...p.completedDays, viewDay],
        completedOn: { ...p.completedOn, [viewDay]: today },
        currentDay: advances ? p.currentDay + 1 : p.currentDay,
        lastCompletedOn: advances ? today : p.lastCompletedOn,
        restDate: null,
      }, today);
    });
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
        {screen === 'learn' && <LearnScreen onBack={goHome} onOpenSkill={onSubNav ? openSkill : null} onOpenExercise={openExercise} onOpenNote={openNote} coachingNotes={coachingNotes} />}
        {screen === 'exercise' && (
          <ExerciseDetailScreen
            exercise={SIXPACK_EXERCISE_DETAILS[viewExerciseId] || (viewExerciseItem?.name ? { name: viewExerciseItem.name, focusLabel: 'Core' } : null)}
            coaching={SIXPACK_EXERCISE_COACHING[viewExerciseId]}
            item={viewExerciseItem}
            backLabel={exerciseReturnScreen === 'learn' ? 'Learn' : 'Workout'}
            onBack={closeExercise}
          />
        )}
        {screen === 'note' && (
          <NoteDetailScreen
            note={coachingNotes.find((n) => n.id === viewNoteId)}
            onBack={() => setScreen('learn')}
          />
        )}
        {(screen === 'favorites' || (screen === 'exercise' && exerciseReturnScreen === 'favorites')) && <div hidden={screen !== 'favorites'}><FavoritesScreen favorites={favorites} onBack={goHome} onStart={workout => startAdhoc(workout, 'favorites')} onRemove={removeFavorite} onOpenExercise={(item, trigger) => openExercise(item, 'favorites', trigger)} /></div>}
        {screen === 'selfies' && <SelfiesScreen key={uid} onBack={goHome} uid={uid} />}
        {(screen === 'shuffle' || (screen === 'exercise' && exerciseReturnScreen === 'shuffle')) && <div hidden={screen !== 'shuffle'}><ShuffleScreen onBack={goHome} onStart={startAdhoc} favorites={favorites} onToggleFavorite={toggleFavorite} onOpenExercise={(item, trigger) => openExercise(item, 'shuffle', trigger)} /></div>}
        {(screen === 'day' || (screen === 'exercise' && exerciseReturnScreen === 'day')) && activeWorkout && (
          <div hidden={screen !== 'day'}>{
          activeWorkout.rest ? (
            <div className="p-6 text-center">
              <button onClick={goHome} className="text-[#e2001a] flex items-center gap-1 text-sm font-bold mb-6">
                <ChevronLeft size={18} /> Home
              </button>
              <div className="text-lg font-black text-fit-ink">Rest Day</div>
            </div>
          ) : (
            <DayScreen day={viewDay} workout={activeWorkout} onBack={goHome} onStart={startWorkout} onOpenExercise={(item, trigger) => openExercise(item, 'day', trigger)} isFavorite={favorites.some(favorite => favorite.id === workoutFavoriteId(activeWorkout))} onToggleFavorite={toggleFavorite} />
          )}</div>
        )}
        {screen === 'runner' && activeWorkout && (
          <RunnerScreen workout={activeWorkout} onBack={() => setScreen(adhocWorkout ? adhocReturnScreen : 'day')} onFinish={finishWorkout} />
        )}
    </section>
  );
}
