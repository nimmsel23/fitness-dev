import { Sparkles, Trophy } from 'lucide-react';
import { translateMuscle } from '../../lib/translations';
import { getMuscleIcon } from '../../constants/MuscleIcons';

export default function ReviewInsights({ recommendations, missingRegions, muscleLanguage = 'de', taxonomy = null }) {
  return (
    <section className="card mb-0 bg-fit-accent/5 border-fit-accent/20 shadow-xl p-6 sm:p-9">
      <div className="label-caps !mb-6 flex items-center gap-2 text-fit-accent">
        <Sparkles size={16} />
        Insights & Tipps
      </div>
      <div className="space-y-4">
        {(recommendations || []).map((rec, i) => (
          <div key={i} className="flex gap-4 text-sm sm:text-base font-medium leading-relaxed text-fit-ink/80 bg-fit-card/50 p-5 rounded-xl border border-fit-accent/10">
            <span className="text-fit-accent font-black mt-0.5">→</span>
            {rec}
          </div>
        ))}
        {missingRegions.length > 0 ? (
          <div className="pt-4 border-t border-fit-accent/10">
             <div className="text-xs font-black uppercase tracking-[0.2em] text-fit-red mb-3 flex items-center gap-2">
                <Trophy size={13} />
                Coverage Gaps
             </div>
             <div className="flex flex-wrap gap-2.5">
               {missingRegions.map(region => {
                 const Icon = getMuscleIcon(region);
                 return (
                   <span key={region} className="text-xs font-black uppercase tracking-widest px-3.5 py-2 rounded-lg border transition-all flex items-center gap-1.5"
                     style={{ background: 'rgba(239,68,68,0.05)', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }}>
                     <Icon size={13} />
                     {translateMuscle(region, taxonomy, muscleLanguage)}
                   </span>
                 );
               })}
             </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-fit-accent/10">
             <div className="flex items-center gap-3 p-4 bg-fit-green/10 rounded-xl border border-fit-green/20">
               <div className="w-9 h-9 rounded-full bg-fit-green text-black flex items-center justify-center font-black">✓</div>
               <span className="text-sm font-bold text-fit-green">Perfekte Abdeckung! Alle Regionen trainiert.</span>
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
