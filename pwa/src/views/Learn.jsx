import { useEffect, useState } from "react";
import { Search, Brain, BookOpen, Star, Info, ChevronRight } from "lucide-react";
import { getAllExercises, getAnatomy, getRecentSessions } from "../db.js";

function AnatDetail({ ex, onBack, isEmbedded }) {
  const [anatomy, setAnatomy] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ex?.exercise_id) { setAnatomy({}); return; }
    setLoading(true);
    getAnatomy(ex.exercise_id)
      .then(a => setAnatomy(a || {}))
      .catch(() => { setAnatomy({}); })
      .finally(() => setLoading(false));
  }, [ex?.exercise_id]);

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
          <span key={m} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20">{m}</span>
        ))}
        {(ex?.secondary_muscles || ex?.secondaryMuscles || []).map(m => (
          <span key={m} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 text-muted border border-line">{m}</span>
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
           {!anatomy?.trainer_explanation && !anatomy?.coaching_notes && (
             <div className="p-12 text-center rounded-2xl border border-dashed border-line opacity-20">
                <p className="text-sm">Keine detaillierten Infos verfügbar.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}

export default function Learn() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [q, setQ]                 = useState("");
  const [recent, setRecent]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getAllExercises()
      .then(exs => { setExercises(exs); setLoading(false); })
      .catch(() => setLoading(false));
    getRecentSessions(1)
      .then(ss => setRecent(ss[0]?.exercises || []))
      .catch(() => {});
  }, []);

  const filtered = q.length >= 2
    ? exercises.filter(ex => (ex.display_name || ex.name || "").toLowerCase().includes(q.toLowerCase()))
    : exercises;

  return (
    <div className="pb-20 lg:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-4 rounded-2xl border bg-card border-line flex items-center gap-3 focus-within:border-accent transition-colors">
            <Search size={18} className="text-dim" />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Übung suchen…"
              className="w-full bg-transparent border-none outline-none text-sm text-ink"
            />
          </div>

          {recent.length > 0 && !q && (
            <div className="space-y-3">
              <div className="label-caps px-1">Zuletzt Trainiert</div>
              <div className="flex flex-wrap gap-2">
                {recent.slice(0, 6).map((ex, i) => {
                  const found = exercises.find(e => e.exercise_id === ex.exercise_id || (e.display_name || e.name) === (ex.name || ex.exercise_id));
                  return (
                    <button key={i} onClick={() => found && setSelected(found)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${selected?.exercise_id === found?.exercise_id ? 'bg-accent text-black border-accent' : 'bg-bg2 border-line text-muted hover:text-ink'}`}>
                      {ex.name || ex.exercise_id}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="label-caps px-1 flex justify-between items-center">
              <span>Bibliothek</span>
              <span className="opacity-40 normal-case tracking-normal">{filtered.length} Übungen</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="py-12 flex justify-center opacity-30">
                  <div className="spinner" />
                </div>
              ) : (
                filtered.slice(0, 80).map(ex => (
                  <button key={ex.exercise_id} onClick={() => setSelected(ex)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${selected?.exercise_id === ex.exercise_id ? 'bg-accent/10 border-accent/40' : 'bg-card border-line hover:border-accent/30'}`}>
                    <div>
                      <div className={`font-black text-sm transition-colors ${selected?.exercise_id === ex.exercise_id ? 'text-accent' : 'text-ink'}`}>
                        {ex.display_name || ex.name}
                      </div>
                      <div className="text-[10px] font-bold opacity-30 uppercase tracking-wider mt-1">
                        {(ex.primary_muscles || ex.primaryMuscles || []).slice(0, 3).join(", ")}
                      </div>
                    </div>
                    <ChevronRight size={16} className={`transition-all ${selected?.exercise_id === ex.exercise_id ? 'text-accent translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="hidden lg:block sticky top-0 h-fit">
          <div className="card h-full min-h-[600px] border-accent/10">
            <AnatDetail ex={selected} isEmbedded={true} />
          </div>
        </div>
      </div>

      {/* Mobile Detail Modal Overlay */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-bg p-4 overflow-y-auto">
          <AnatDetail ex={selected} onBack={() => setSelected(null)} isEmbedded={false} />
        </div>
      )}
    </div>
  );
}
