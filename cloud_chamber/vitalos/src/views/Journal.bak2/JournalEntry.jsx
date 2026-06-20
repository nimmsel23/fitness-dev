import { Target, Dumbbell, Clock, Brain, Edit, CheckCircle2 } from "lucide-react";
import { EFFORT_LABELS, timeStr } from './journalUtils';

export default function JournalEntry({ e, i, habits, setSelectedEntry, onEdit }) {
  const isHabit = e.type === 'habit';
  const isWorkout = e.type === 'workout';
  const isHabitCompletion = e.type === 'habit-completion';
  const isAuto = isHabit || isWorkout || isHabitCompletion;
  const habit = isHabit ? habits.find(h => h.uuid === e.habitId) : null;

  const bulletColor = isWorkout
    ? 'bg-blue-500'
    : (isHabit || isHabitCompletion)
    ? 'bg-[var(--accent)]'
    : 'bg-[var(--dim)]';

  const borderColor = isWorkout
    ? 'border-blue-500/15'
    : isAuto
    ? 'border-[var(--accent)]/10'
    : 'border-[var(--line)]';

  return (
    <div className="relative group">
      <div className={`absolute -left-[37px] top-6 w-4 h-4 rounded-full border-4 border-[var(--bg)] shadow-sm z-10 transition-transform group-hover:scale-125 ${bulletColor}`} />

      <div
        onClick={() => setSelectedEntry(e)}
        className={`p-6 rounded-[24px] border bg-[var(--card)] shadow-md transition-all hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer ${borderColor}`}
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
          ) : isHabitCompletion ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">{e.habitName}</span>
                <div className="text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5">Habit abgeschlossen</div>
              </div>
            </div>
          ) : isHabit ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <Target size={16} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">{habit?.name}</span>
                <div className="text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5">Habit Journal</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[var(--dim)]">
              <Clock size={14} className="opacity-30" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Journal Eintrag</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            {e.type === 'regular' && (
              <button
                onClick={(ev) => { ev.stopPropagation(); onEdit(e); }}
                className="p-1.5 rounded-lg hover:bg-[var(--bg2)] text-[var(--dim)] hover:text-[var(--accent)] transition-all"
                title="Eintrag bearbeiten"
              >
                <Edit size={12} />
              </button>
            )}
            {timeStr(e) && (
              <span className="text-[10px] font-black font-mono opacity-20 bg-[var(--bg2)] px-2 py-1 rounded-md">
                {timeStr(e)}
              </span>
            )}
          </div>
        </div>

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
          <p className="text-sm leading-relaxed text-[var(--ink)]/90 font-medium whitespace-pre-wrap selection:bg-[var(--accent)]/30 line-clamp-3">
            {e.text}
          </p>
        )}

        {isHabit && e.coachFeedback && (
          <div className="mt-6 p-4 rounded-2xl bg-[var(--accent)]/5 border-l-4 border-[var(--accent)]">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-[var(--accent)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Coach Feedback</span>
            </div>
            <p className="text-xs font-bold italic text-[var(--ink)]/80 leading-relaxed truncate">"{e.coachFeedback}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
