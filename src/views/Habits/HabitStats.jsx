import { Target, TrendingUp } from "lucide-react";

export default function HabitStats({ todayCompletionPercentage, getMotivationalMessage }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
       <div className="card bg-fit-accent/5 border-fit-accent/20 p-6 flex flex-col justify-between border">
          <div>
             <div className="label-caps !mb-4 flex items-center gap-2 text-fit-accent">
                <Target size={14} />
                Fokus heute
             </div>
             <p className="text-sm font-medium leading-relaxed opacity-70 text-fit-ink">
                {getMotivationalMessage(todayCompletionPercentage)}
             </p>
          </div>
          <div className="mt-6 h-1.5 w-full bg-fit-bg2 rounded-full overflow-hidden border border-fit-line">
             <div className="h-full bg-fit-accent transition-all duration-1000" style={{ width: `${todayCompletionPercentage}%` }} />
          </div>
       </div>

       <div className="card p-6 border-dashed border-fit-line/50 bg-fit-card border">
          <div className="label-caps !mb-4 flex items-center gap-2 text-fit-dim">
             <TrendingUp size={14} className="text-fit-dim" />
             Psychologie
          </div>
          <p className="text-[11px] font-medium opacity-50 leading-relaxed italic text-fit-dim">
             "Motivation bringt dich in Gang. Gewohnheit hält dich am Laufen." – Jim Ryun. 
             Konzentriere dich darauf, die Kette nicht zu unterbrechen.
          </p>
       </div>
    </div>
  );
}
