import { Sparkles } from 'lucide-react';
import { translateMuscle } from '../../lib/translations';
import { getMuscleIcon } from '../../constants/MuscleIcons';

export default function ReviewInsights({ recommendations, missingRegions, muscleLanguage = 'de', taxonomy = null }) {
  return (
    <section className="card mb-0 bg-accent/5 border-accent/20 shadow-xl p-8">
      <div className="label-caps !mb-6 flex items-center gap-2 text-accent">
        <Sparkles size={16} />
        Insights & Tipps
      </div>
      <div className="space-y-4">
        {(recommendations || []).map((rec, i) => (
          <div key={i} className="flex gap-4 text-sm font-medium leading-relaxed text-ink/80 bg-card/50 p-4 rounded-xl border border-accent/10">
            <span className="text-accent font-black mt-0.5">→</span>
            {rec}
          </div>
        ))}
        {missingRegions.length > 0 ? (
          <div className="pt-4 border-t border-accent/10">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red mb-3 flex items-center gap-2">
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
          <div className="pt-4 border-t border-accent/10">
             <div className="flex items-center gap-3 p-3 bg-green/10 rounded-xl border border-green/20">
               <div className="w-8 h-8 rounded-full bg-green text-black flex items-center justify-center font-black">✓</div>
               <span className="text-xs font-bold text-green">Perfekte Abdeckung! Alle Regionen trainiert.</span>
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
