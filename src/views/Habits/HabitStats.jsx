import { Target, TrendingUp } from "lucide-react";

export default function HabitStats({ todayCompletionPercentage, getMotivationalMessage }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
       <div className="card bg-[var(--accent)]/5 border-[var(--accent)]/20 p-6 flex flex-col justify-between border">
          <div>
             <div className="label-caps !mb-4 flex items-center gap-2 text-[var(--accent)]">
                <Target size={14} />
                Fokus heute
             </div>
             <p className="text-sm font-medium leading-relaxed opacity-70 text-[var(--ink)]">
                {getMotivationalMessage(todayCompletionPercentage)}
             </p>
          </div>
          <div className="mt-6 h-1.5 w-full bg-[var(--bg2)] rounded-full overflow-hidden border border-[var(--line)]">
             <div className="h-full bg-[var(--accent)] transition-all duration-1000" style={{ width: `${todayCompletionPercentage}%` }} />
          </div>
       </div>

       <div className="card p-6 border-dashed border-[var(--line)]/50 bg-[var(--card)] border">
          <div className="label-caps !mb-4 flex items-center gap-2 text-[var(--dim)]">
             <TrendingUp size={14} className="text-[var(--dim)]" />
             Psychologie
          </div>
          <p className="text-[11px] font-medium opacity-50 leading-relaxed italic text-[var(--dim)]">
             "Motivation bringt dich in Gang. Gewohnheit hält dich am Laufen." – Jim Ryun. 
             Konzentriere dich darauf, die Kette nicht zu unterbrechen.
          </p>
       </div>
    </div>
  );
}
