import { Target, Dumbbell, Clock, Brain, Edit, CheckCircle2, Activity } from "lucide-react";
import { EFFORT_LABELS, timeStr } from './journalUtils';

// Maps activity type to emoji — same set as ActivitySection
const ACTIVITY_EMOJI = {
  running:   '🏃',
  cycling:   '🚴',
  swimming:  '🏊',
  hiking:    '🥾',
  rowing:    '🚣',
  climbing:  '🧗',
  yoga:      '🧘',
  stretching:'🤸',
  hiit:      '⚡',
  walking:   '🚶',
};

const ACTIVITY_LABEL = {
  running:   'Laufen',
  cycling:   'Radfahren',
  swimming:  'Schwimmen',
  hiking:    'Wandern',
  rowing:    'Rudern',
  climbing:  'Klettern',
  yoga:      'Yoga',
  stretching:'Stretching',
  hiit:      'HIIT',
  walking:   'Spazieren',
};

export default function JournalEntry({ e, i, habits, setSelectedEntry, onEdit }) {
  const isHabit = e.type === 'habit';
  const isWorkout = e.type === 'workout';
  const isActivity = e.type === 'activity';
  const isHabitCompletion = e.type === 'habit-completion';
  const isAuto = isHabit || isWorkout || isActivity || isHabitCompletion;
  const habit = isHabit ? habits.find(h => h.uuid === e.habitId) : null;

  const activityEmoji = isActivity ? (ACTIVITY_EMOJI[e.activityType] || '🏃') : null;
  const activityLabel = isActivity ? (ACTIVITY_LABEL[e.activityType] || e.activityType || 'Ausdauer') : null;

  const bulletColor = isWorkout
    ? 'bg-blue-500'
    : isActivity
    ? 'bg-fit-orange'
    : (isHabit || isHabitCompletion)
    ? 'bg-fit-accent'
    : 'bg-fit-dim';

  const borderColor = isWorkout
    ? 'border-blue-500/15'
    : isActivity
    ? 'border-fit-orange/20'
    : isAuto
    ? 'border-fit-accent/10'
    : 'border-fit-line';

  return (
    <div className="relative group">
      <div className={`absolute -left-[37px] top-6 w-4 h-4 rounded-full border-4 border-fit-bg shadow-sm z-10 transition-transform group-hover:scale-125 ${bulletColor}`} />

      <div
        onClick={() => setSelectedEntry(e)}
        className={`p-6 rounded-[24px] border bg-fit-card shadow-md transition-all hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer ${borderColor}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          {isWorkout ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Dumbbell size={16} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{e.block}</span>
                <div className="text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5">Workout geloggt</div>
              </div>
            </div>
          ) : isActivity ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-fit-orange/10 flex items-center justify-center text-xl leading-none">
                {activityEmoji}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-orange">{activityLabel}</span>
                <div className="text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5">Ausdauer geloggt</div>
              </div>
            </div>
          ) : isHabitCompletion ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-fit-accent/10 flex items-center justify-center text-fit-accent">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-accent">{e.habitName}</span>
                <div className="text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5">Habit abgeschlossen</div>
              </div>
            </div>
          ) : isHabit ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-fit-accent/10 flex items-center justify-center text-fit-accent">
                <Target size={16} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-accent">{habit?.name}</span>
                <div className="text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5">Habit Journal</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-fit-dim">
              <Clock size={14} className="opacity-30" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Journal Eintrag</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {e.type === 'regular' && (
              <button
                onClick={(ev) => { ev.stopPropagation(); onEdit(e); }}
                className="p-1.5 rounded-lg hover:bg-fit-bg2 text-fit-dim hover:text-fit-accent transition-all"
                title="Eintrag bearbeiten"
              >
                <Edit size={12} />
              </button>
            )}
            {timeStr(e) && (
              <span className="text-[10px] font-black font-mono opacity-20 bg-fit-bg2 px-2 py-1 rounded-md">
                {timeStr(e)}
              </span>
            )}
          </div>
        </div>

        {/* Activity: Dauer-Badge */}
        {isActivity && e.activityDuration && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Dauer</span>
            <span className="text-[10px] font-black text-fit-orange bg-fit-orange/8 border border-fit-orange/20 px-2 py-0.5 rounded-md">
              {e.activityDuration} min
            </span>
          </div>
        )}

        {/* Workout: Übungsliste */}
        {isWorkout && e.exercises?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {e.exercises.map((ex, idx) => (
              <span key={idx} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/8 text-blue-400 border border-blue-500/15">
                {ex.name}
              </span>
            ))}
          </div>
        )}

        {/* Workout: Effort-Badge */}
        {isWorkout && e.effort > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Anstrengung</span>
            <span className="text-[10px] font-black text-blue-400 bg-blue-500/8 border border-blue-500/15 px-2 py-0.5 rounded-md">
              {e.effort}/10 {EFFORT_LABELS[e.effort] ? `· ${EFFORT_LABELS[e.effort]}` : ''}
            </span>
          </div>
        )}

        {/* Text (Notes oder Journal-Text) */}
        {e.text && (
          <p className="text-sm leading-relaxed text-fit-ink/90 font-medium whitespace-pre-wrap selection:bg-fit-accent/30 line-clamp-3">
            {e.text}
          </p>
        )}

        {isHabit && e.coachFeedback && (
          <div className="mt-6 p-4 rounded-2xl bg-fit-accent/5 border-l-4 border-fit-accent">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-fit-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-fit-accent">Coach Feedback</span>
            </div>
            <p className="text-xs font-bold italic text-fit-ink/80 leading-relaxed truncate">"{e.coachFeedback}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
