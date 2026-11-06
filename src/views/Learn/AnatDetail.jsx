import { Brain, Star, Info, Target, Video } from "lucide-react";
import { useMuscleMap } from "@fitness/lib/muscleMap.js";

export default function AnatDetail({ anatomy, ex, onBack, isEmbedded, loading }) {
  const muscleMap = useMuscleMap();
  const muscleLabel = (id) => muscleMap?.labels?.[id] || id;
  const name = ex?.display_name || ex?.name || "Übung wählen";
  const gif = ex?.gif_url || ex?.gifUrl || anatomy?.gif_url || anatomy?.gifUrl;
  const img = ex?.image_url || ex?.imageUrl || anatomy?.image_url || anatomy?.imageUrl;
  const media = gif || img;
  // Ohne Teaching-Lesson greifen wir auf die Katalogdaten der Übung selbst zurück
  // (bei Bulk-Importen sind das die wger-Originaltexte).
  const lessonNotes = Array.isArray(anatomy?.coaching_notes) ? anatomy.coaching_notes : [];
  const exNotes = Array.isArray(ex?.coaching_notes) ? ex.coaching_notes : [];
  const notes = lessonNotes.length > 0 ? lessonNotes : exNotes;
  const notesFromCatalog = lessonNotes.length === 0 && exNotes.length > 0;
  const fromWger = notesFromCatalog && (ex?.wger_id || (ex?.tags || []).includes("wger"));
  const equipment = Array.isArray(ex?.equipment) ? ex.equipment : [];

  if (!ex && isEmbedded) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-8">
        <Brain size={32} className="mb-3" />
        <p className="text-sm font-semibold">Wähle eine Übung aus der Liste</p>
      </div>
    );
  }

  return (
    <div className={isEmbedded ? "h-full overflow-y-auto" : "pb-20"}>
      <div className="flex items-center gap-3 mb-5">
        {!isEmbedded && (
          <button onClick={onBack} className="p-2 rounded-xl border font-semibold bg-fit-card border-fit-line text-fit-ink">
            ←
          </button>
        )}
        <h2 className="text-lg font-bold">{name}</h2>
      </div>

      {media && (
        <div className="mb-5 rounded-2xl overflow-hidden border border-fit-line bg-fit-bg2 relative group">
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

      <div className="p-4 rounded-2xl border mb-5 flex flex-wrap gap-1.5 bg-fit-bg2 border-fit-line">
        <div className="w-full text-[11px] font-semibold mb-1" style={{ color: 'var(--dim)', opacity: 0.7 }}>Muskelgruppen</div>
        {(ex?.primary_muscles || ex?.primaryMuscles || []).map(m => (
          <span key={m} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-fit-accent/10 text-fit-accent border border-fit-accent/20">
            <Target size={10} className="inline mr-1" /> {muscleLabel(m)}
          </span>
        ))}
        {(ex?.secondary_muscles || ex?.secondaryMuscles || []).map(m => (
          <span key={m} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-fit-muted border border-fit-line">
            {muscleLabel(m)}
          </span>
        ))}
        {equipment.length > 0 && (
          <div className="w-full text-[11px] mt-1" style={{ color: 'var(--dim)' }}>
            Equipment: {equipment.join(", ")}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 opacity-40">
          <div className="spinner mb-3" />
          <p className="text-xs font-medium">Analysiere Anatomie…</p>
        </div>
      ) : (
        <div className="space-y-3">
           {anatomy?.trainer_explanation?.client_friendly && (
             <div className="p-4 rounded-2xl border bg-fit-card border-fit-line">
               <div className="text-[11px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--dim)', opacity: 0.7 }}>
                 <Info size={13} className="text-fit-accent" />
                 Erklärung
               </div>
               <p className="text-sm leading-relaxed text-fit-ink/80">{anatomy.trainer_explanation.client_friendly}</p>
             </div>
           )}
           {notes.length > 0 && (
             <div className="p-4 rounded-2xl border bg-fit-card border-fit-line">
               <div className="text-[11px] font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: 'var(--dim)', opacity: 0.7 }}>
                 <Star size={13} className="text-fit-accent" />
                 {notesFromCatalog ? (fromWger ? "Beschreibung (wger)" : "Beschreibung") : "Coaching-Hinweise"}
               </div>
               <ul className="space-y-2.5">
                 {notes.map((c, i) => (
                   <li key={i} className="text-sm flex gap-2.5 text-fit-ink/80 leading-relaxed">
                     <span className="text-fit-accent font-bold mt-0.5">·</span>
                     <span>{c}</span>
                   </li>
                 ))}
               </ul>
             </div>
           )}

           {anatomy?.muscle_anatomy && Object.entries(anatomy.muscle_anatomy).length > 0 && (
              <div className="p-4 rounded-2xl border bg-fit-card border-fit-line space-y-3">
                <div className="text-[11px] font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'var(--dim)', opacity: 0.7 }}>
                  <Brain size={13} className="text-fit-accent" />
                  Biomechanische Details
                </div>
                {Object.entries(anatomy.muscle_anatomy).map(([id, m]) => (
                  <div key={id} className="p-3.5 rounded-xl bg-fit-bg2 border border-fit-line/50 space-y-1.5">
                    <div className="text-xs font-semibold text-fit-accent">{m.latin || muscleLabel(id)}</div>
                    {m.origin && <div className="text-[11px] leading-relaxed"><span className="opacity-50 font-semibold mr-1">Ursprung:</span> {m.origin}</div>}
                    {m.insertion && <div className="text-[11px] leading-relaxed"><span className="opacity-50 font-semibold mr-1">Ansatz:</span> {m.insertion}</div>}
                    {m.function_in_exercise && <div className="text-[11px] leading-relaxed italic border-t border-fit-line/30 pt-2 mt-2">{m.function_in_exercise}</div>}
                  </div>
                ))}
              </div>
           )}

           {!anatomy?.trainer_explanation && notes.length === 0 && !anatomy?.muscle_anatomy && (
             <div className="p-10 text-center rounded-2xl border border-dashed border-fit-line">
                <p className="text-sm" style={{ color: 'var(--dim)' }}>Keine detaillierten Infos verfügbar.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
