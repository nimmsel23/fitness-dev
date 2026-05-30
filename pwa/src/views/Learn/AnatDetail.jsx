import { Brain, Star, Info, Target, Dumbbell } from "lucide-react";

export default function AnatDetail({ anatomy, ex, onBack, isEmbedded, loading }) {
  const name = ex?.display_name || ex?.name || "Übung wählen";

  if (!ex && isEmbedded) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-8">
        <Brain size={48} className="mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Wähle eine Übung aus der Liste</p>
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "h-full overflow-y-auto" : "pb-20"}>
      <div className="flex items-center gap-4 mb-6">
        {!isEmbedded && (
          <button onClick={onBack} className="p-2 rounded-xl border font-bold bg-card border-line text-ink">
            ←
          </button>
        )}
        <h2 className="text-xl font-black">{name}</h2>
      </div>

      <div className="p-5 rounded-2xl border mb-6 flex flex-wrap gap-2 bg-bg2 border-line">
        <div className="w-full text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Muskelgruppen</div>
        {(ex?.primary_muscles || ex?.primaryMuscles || []).map(m => (
          <span key={m} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
            <Target size={10} className="inline mr-1" /> {m}
          </span>
        ))}
        {(ex?.secondary_muscles || ex?.secondaryMuscles || []).map(m => (
          <span key={m} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 text-muted border border-line">
            {m}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 opacity-30">
          <div className="spinner mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">Analysiere Anatomie…</p>
        </div>
      ) : (
        <div className="space-y-4">
           {anatomy?.trainer_explanation?.client_friendly && (
             <div className="p-5 rounded-2xl border bg-card border-line">
               <div className="label-caps !mb-3 flex items-center gap-2">
                 <Info size={14} className="text-accent" />
                 Erklärung
               </div>
               <p className="text-sm leading-relaxed text-ink/80">{anatomy.trainer_explanation.client_friendly}</p>
             </div>
           )}
           {Array.isArray(anatomy?.coaching_notes) && anatomy.coaching_notes.length > 0 && (
             <div className="p-5 rounded-2xl border bg-card border-line">
               <div className="label-caps !mb-4 flex items-center gap-2">
                 <Star size={14} className="text-accent" />
                 Coaching Notes
               </div>
               <ul className="space-y-3">
                 {anatomy.coaching_notes.map((c, i) => (
                   <li key={i} className="text-sm flex gap-3 text-ink/80 leading-relaxed">
                     <span className="text-accent font-bold mt-1">/</span>
                     <span>{c}</span>
                   </li>
                 ))}
               </ul>
             </div>
           )}
           
           {/* Biomechanical Details Section */}
           {anatomy?.muscle_anatomy && Object.entries(anatomy.muscle_anatomy).length > 0 && (
              <div className="p-5 rounded-2xl border bg-card border-line space-y-4">
                <div className="label-caps !mb-4 flex items-center gap-2">
                  <Brain size={14} className="text-accent" />
                  Biometrische Daten
                </div>
                {Object.entries(anatomy.muscle_anatomy).map(([id, m]) => (
                  <div key={id} className="p-4 rounded-xl bg-bg2 border border-line/50 space-y-2">
                    <div className="text-xs font-black text-accent uppercase tracking-wider">{m.latin || id}</div>
                    {m.origin && <div className="text-[11px] leading-relaxed"><span className="opacity-40 uppercase font-black text-[9px] mr-1">Ursprung:</span> {m.origin}</div>}
                    {m.insertion && <div className="text-[11px] leading-relaxed"><span className="opacity-40 uppercase font-black text-[9px] mr-1">Ansatz:</span> {m.insertion}</div>}
                    {m.function_in_exercise && <div className="text-[11px] leading-relaxed italic border-t border-line/30 pt-2 mt-2">{m.function_in_exercise}</div>}
                  </div>
                ))}
              </div>
           )}

           {!anatomy?.trainer_explanation && !anatomy?.coaching_notes && !anatomy?.muscle_anatomy && (
             <div className="p-12 text-center rounded-2xl border border-dashed border-line opacity-20">
                <p className="text-sm">Keine detaillierten Infos verfügbar.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
