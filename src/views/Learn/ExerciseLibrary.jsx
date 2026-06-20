import { Search, ChevronRight, Activity } from "lucide-react";

export default function ExerciseLibrary({ exercises, selected, setSelected, q, setQ, recent, loading }) {
  const safeExercises = Array.isArray(exercises) ? exercises : [];
  const safeRecent = Array.isArray(recent) ? recent : [];
  const filtered = q.length >= 2
    ? safeExercises.filter(ex => (ex.display_name || ex.name || "").toLowerCase().includes(q.toLowerCase()))
    : safeExercises;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl border bg-fit-card border-fit-line flex items-center gap-3 focus-within:border-accent transition-colors shadow-inner">
        <Search size={18} className="text-fit-dim" />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Übung suchen…"
          className="w-full bg-transparent border-none outline-none text-sm text-fit-ink font-bold placeholder:opacity-30"
        />
      </div>

      {safeRecent.length > 0 && !q && (
        <div className="space-y-3">
          <div className="label-caps px-1">Zuletzt Trainiert</div>
          <div className="flex flex-wrap gap-2">
            {safeRecent.slice(0, 6).map((ex, i) => {
              const found = safeExercises.find(e => e.exercise_id === ex.exercise_id || (e.display_name || e.name) === (ex.name || ex.exercise_id));
              return (
                <button key={i} onClick={() => found && setSelected(found)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all ${selected?.exercise_id === found?.exercise_id ? 'bg-fit-accent text-black border-fit-accent shadow-lg shadow-accent/20' : 'bg-fit-bg2 border-fit-line text-fit-muted hover:text-ink'}`}>
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
          <span className="opacity-40 normal-case tracking-normal font-mono">{filtered.length}</span>
        </div>
        
        <div className="grid grid-cols-1 gap-2 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-2 hide-scrollbar">
          {loading ? (
            <div className="py-12 flex justify-center opacity-30">
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-fit-line rounded-2xl opacity-30">
               <Activity size={32} className="mx-auto mb-2" />
               <p className="text-xs font-black uppercase tracking-widest">Keine Übung gefunden</p>
            </div>
          ) : (
            filtered.slice(0, 80).map(ex => (
              <button key={ex.exercise_id} onClick={() => setSelected(ex)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${selected?.exercise_id === ex.exercise_id ? 'bg-fit-accent/10 border-fit-accent/40 shadow-md' : 'bg-fit-card border-fit-line hover:border-accent/30'}`}>
                <div className="flex items-center gap-4">
                  {(ex.gif_url || ex.image_url) && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-fit-line bg-fit-bg2 shrink-0">
                      <img src={ex.gif_url || ex.image_url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  <div>
                    <div className={`font-black text-sm transition-colors ${selected?.exercise_id === ex.exercise_id ? 'text-fit-accent' : 'text-fit-ink'}`}>
                      {ex.display_name || ex.name}
                    </div>
                    <div className="text-[10px] font-bold opacity-30 uppercase tracking-wider mt-1">
                      {(ex.primary_muscles || ex.primaryMuscles || []).slice(0, 3).join(", ")}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className={`transition-all ${selected?.exercise_id === ex.exercise_id ? 'text-fit-accent translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
