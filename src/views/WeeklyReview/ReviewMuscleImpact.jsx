import { TrendingUp } from 'lucide-react';
import { translateMuscle } from '../../lib/translations';
import { getMuscleIcon } from '../../constants/MuscleIcons';

export default function ReviewMuscleImpact({ regionEntries, muscleLanguage = 'de', taxonomy = null }) {
  return (
    <section className="card mb-0 shadow-lg border-fit-line/50 p-8">
      <div className="label-caps !mb-8 flex items-center gap-2">
        <TrendingUp size={16} className="text-fit-accent" />
        Relative Muskelbelastung
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {regionEntries.length > 0 ? regionEntries.map(([name, score]) => {
          const maxScore = Math.max(...regionEntries.map(e => e[1]), 5);
          const pct = Math.min(100, (score / maxScore) * 100);
          const Icon = getMuscleIcon(name);
          return (
            <div key={name} className="flex flex-col p-5 rounded-2xl border bg-fit-bg2 border-fit-line hover:border-accent/40 transition-all group shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={12} className="opacity-30 group-hover:text-accent group-hover:opacity-100 transition-all" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:text-accent group-hover:opacity-100 transition-colors">
                  {translateMuscle(name, taxonomy, muscleLanguage)}
                </span>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <span className="text-2xl font-black text-fit-ink">{Number(score).toFixed(1)}</span>
                <div className="w-1.5 h-8 bg-fit-line rounded-full overflow-hidden flex flex-col justify-end">
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
