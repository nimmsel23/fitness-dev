import { TrendingUp } from 'lucide-react';
import { translateMuscle } from '../../lib/translations';
import { getMuscleIcon } from '../../constants/MuscleIcons';

export default function ReviewMuscleImpact({ regionEntries, muscleLanguage = 'de', taxonomy = null }) {
  const maxScore = Math.max(...regionEntries.map(e => e[1]), 5);
  return (
    <section className="card mb-0 shadow-lg border-fit-line/50 p-5 sm:p-10">
      <div className="label-caps !mb-5 sm:!mb-9 flex items-center gap-2">
        <TrendingUp size={16} className="text-fit-accent" />
        Relative Muskelbelastung
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {regionEntries.length > 0 ? regionEntries.map(([name, score]) => {
          const pct = Math.min(100, (score / maxScore) * 100);
          const Icon = getMuscleIcon(name);
          return (
            <div key={name} className="flex flex-col p-4 sm:p-6 rounded-2xl border bg-fit-bg2 border-fit-line hover:border-accent/40 transition-all group shadow-sm min-w-0">
              <div className="flex items-center gap-2 mb-3 sm:mb-4 min-w-0">
                <Icon size={13} className="opacity-30 group-hover:text-accent group-hover:opacity-100 transition-all shrink-0" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.08em] sm:tracking-[0.2em] opacity-40 group-hover:text-accent group-hover:opacity-100 transition-colors truncate">
                  {translateMuscle(name, taxonomy, muscleLanguage)}
                </span>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <span className="text-3xl font-black text-fit-ink">{Number(score).toFixed(1)}</span>
                <div className="w-2 h-10 bg-fit-line rounded-full overflow-hidden flex flex-col justify-end">
                  <div className="w-full bg-fit-accent transition-all duration-1000" style={{ height: `${pct}%` }} />
                </div>
              </div>
            </div>
          )
        }) : (
          <div className="col-span-full py-8 text-center text-sm opacity-30 font-bold uppercase tracking-widest border border-dashed rounded-2xl">Keine Daten in diesem Zeitraum</div>
        )}
      </div>
    </section>
  );
}
