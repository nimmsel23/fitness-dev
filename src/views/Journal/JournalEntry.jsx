import { Target, Dumbbell, Clock, Brain, Edit } from "lucide-react";

export default function JournalEntry({ e, i, habits, setSelectedEntry, onEdit }) {
  const isHabit = e.type === 'habit';
  const isWorkout = e.type === 'workout';
  const habit = isHabit ? habits.find(h => h.uuid === e.habitId) : null;

  return (
    <div className="relative group">
      {/* Timeline Bullet */}
      <div className={`absolute -left-[37px] top-6 w-4 h-4 rounded-full border-4 border-[var(--bg)] shadow-sm z-10 transition-transform group-hover:scale-125 ${isHabit || isWorkout ? 'bg-[var(--accent)]' : 'bg-[var(--dim)]'}`} />
      
      <div 
        onClick={() => setSelectedEntry(e)}
        className={`p-6 rounded-[24px] border bg-[var(--card)] shadow-md transition-all hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer ${isHabit || isWorkout ? 'border-[var(--accent)]/10' : 'border-[var(--line)]'}`}>
        <div className="flex items-center justify-between mb-4">
           {(isHabit || isWorkout) ? (
             <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                   {isHabit ? <Target size={16} /> : <Dumbbell size={16} />}
                </div>
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                     {isHabit ? habit?.name : e.block}
                   </span>
                   <div className="text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5">Automatischer Log</div>
                </div>
             </div>
           ) : (
             <div className="flex items-center gap-2 text-[var(--dim)]">
                <Clock size={14} className="opacity-30" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Journal Eintrag</span>
             </div>
           )}

           {(e.time || e.updated_at) && (
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
                <span className="text-[10px] font-black font-mono opacity-20 bg-[var(--bg2)] px-2 py-1 rounded-md">
                  {e.time ? e.time.slice(11, 16) : (e.updated_at?.seconds ? new Date(e.updated_at.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "")}
                </span>
             </div>
           )}
        </div>

        <p className="text-sm leading-relaxed text-[var(--ink)]/90 font-medium whitespace-pre-wrap selection:bg-[var(--accent)]/30 line-clamp-3">
           {e.text}
        </p>

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
