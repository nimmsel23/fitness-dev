import { Brain, Star, Info, Target, Video } from "lucide-react";

export default function AnatDetail({ anatomy, ex, onBack, isEmbedded, loading }) {
  const name = ex?.display_name || ex?.name || "Übung wählen";
  const gif = ex?.gif_url || ex?.gifUrl || anatomy?.gif_url || anatomy?.gifUrl;
  const img = ex?.image_url || ex?.imageUrl || anatomy?.image_url || anatomy?.imageUrl;
  const media = gif || img;

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
          <button onClick={onBack} className="p-2 rounded-xl border font-bold bg-fit-card border-fit-line text-fit-ink">
            ←
          </button>
        )}
        <h2 className="text-xl font-black">{name}</h2>
      </div>

      {media && (
        <div className="mb-6 rounded-3xl overflow-hidden border border-fit-line shadow-2xl bg-fit-bg2 relative group">
           <img 
             src={media} 
             alt={name} 
             className="w-full h-auto aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
             loading="lazy"
           />
           <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {gif ? <Video size={14} /> : <Info size={14} />}
           </div>
        </div>
      )}

      <div className="p-5 rounded-2xl border mb-6 flex flex-wrap gap-2 bg-fit-bg2 border-fit-line">
        <div className="w-full text-[9px] font-black uppercase tracking-widest opacity-30 mb-2">Muskelgruppen</div>
        {(ex?.primary_muscles || ex?.primaryMuscles || []).map(m => (
          <span key={m} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-fit-accent/10 text-fit-accent border border-fit-accent/20">
            <Target size={10} className="inline mr-1" /> {m}
          </span>
        ))}
        {(ex?.secondary_muscles || ex?.secondaryMuscles || []).map(m => (
          <span key={m} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 text-fit-muted border border-fit-line">
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
             <div className="p-5 rounded-2xl border bg-fit-card border-fit-line">
               <div className="label-caps !mb-3 flex items-center gap-2">
                 <Info size={14} className="text-fit-accent" />
                 Erklärung
               </div>
               <p className="text-sm leading-relaxed text-fit-ink/80">{anatomy.trainer_explanation.client_friendly}</p>
             </div>
           )}
           {Array.isArray(anatomy?.coaching_notes) && anatomy.coaching_notes.length > 0 && (
             <div className="p-5 rounded-2xl border bg-fit-card border-fit-line">
               <div className="label-caps !mb-4 flex items-center gap-2">
                 <Star size={14} className="text-fit-accent" />
                 Coaching Notes
               </div>
               <ul className="space-y-3">
                 {anatomy.coaching_notes.map((c, i) => (
                   <li key={i} className="text-sm flex gap-3 text-fit-ink/80 leading-relaxed">
                     <span className="text-fit-accent font-bold mt-1">/</span>
                     <span>{c}</span>
                   </li>
                 ))}
               </ul>
             </div>
           )}
           
           {/* Biomechanical Details Section */}
           {anatomy?.muscle_anatomy && Object.entries(anatomy.muscle_anatomy).length > 0 && (
              <div className="p-5 rounded-2xl border bg-fit-card border-fit-line space-y-4">
                <div className="label-caps !mb-4 flex items-center gap-2">
                  <Brain size={14} className="text-fit-accent" />
                  Biometrische Daten
                </div>
                {Object.entries(anatomy.muscle_anatomy).map(([id, m]) => (
                  <div key={id} className="p-4 rounded-xl bg-fit-bg2 border border-fit-line/50 space-y-2">
                    <div className="text-xs font-black text-fit-accent uppercase tracking-wider">{m.latin || id}</div>
                    {m.origin && <div className="text-[11px] leading-relaxed"><span className="opacity-40 uppercase font-black text-[9px] mr-1">Ursprung:</span> {m.origin}</div>}
                    {m.insertion && <div className="text-[11px] leading-relaxed"><span className="opacity-40 uppercase font-black text-[9px] mr-1">Ansatz:</span> {m.insertion}</div>}
                    {m.function_in_exercise && <div className="text-[11px] leading-relaxed italic border-t border-fit-line/30 pt-2 mt-2">{m.function_in_exercise}</div>}
                  </div>
                ))}
              </div>
           )}

           {!anatomy?.trainer_explanation && !anatomy?.coaching_notes && !anatomy?.muscle_anatomy && (
             <div className="p-12 text-center rounded-2xl border border-dashed border-fit-line opacity-20">
                <p className="text-sm">Keine detaillierten Infos verfügbar.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
