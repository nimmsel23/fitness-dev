import { Sparkles, Trophy } from 'lucide-react';
import { translateMuscle } from '../../lib/translations';
import { getMuscleIcon } from '../../constants/MuscleIcons';

export default function ReviewInsights({ recommendations, missingRegions, muscleLanguage = 'de', taxonomy = null }) {
  return (
    <section className="card mb-0 bg-fit-accent/5 border-fit-accent/20 shadow-xl p-8">
      <div className="label-caps !mb-6 flex items-center gap-2 text-fit-accent">
        <Sparkles size={16} />
        Insights & Tipps
      </div>
      <div className="space-y-4">
        {(recommendations || []).map((rec, i) => (
          <div key={i} className="flex gap-4 text-sm font-medium leading-relaxed text-fit-ink/80 bg-fit-card/50 p-4 rounded-xl border border-fit-accent/10">
            <span className="text-fit-accent font-black mt-0.5">→</span>
            {rec}
          </div>
        ))}
        {missingRegions.length > 0 ? (
          <div className="pt-4 border-t border-fit-accent/10">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-red mb-3 flex items-center gap-2">
                <Trophy size={12} />
                Coverage Gaps
             </div>
             <div className="flex flex-wrap gap-2">
               {missingRegions.map(region => {
                 const Icon = getMuscleIcon(region);
                 return (
                   <span key={region} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5" 
                     style={{ background: 'rgba(239,68,68,0.05)', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }}>
                     <Icon size={12} />
                     {translateMuscle(region, taxonomy, muscleLanguage)}
                   </span>
                 );
               })}
             </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-fit-accent/10">
             <div className="flex items-center gap-3 p-3 bg-fit-green/10 rounded-xl border border-fit-green/20">
               <div className="w-8 h-8 rounded-full bg-fit-green text-black flex items-center justify-center font-black">✓</div>
               <span className="text-xs font-bold text-fit-green">Perfekte Abdeckung! Alle Regionen trainiert.</span>
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
