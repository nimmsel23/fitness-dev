import { Search, ChevronRight, Activity } from "lucide-react";
import { useMuscleMap } from "@fitness/lib/muscleMap.js";

export default function ExerciseLibrary({ exercises, selected, setSelected, q, setQ, recent, loading }) {
  const muscleMap = useMuscleMap();
  const muscleLabel = (id) => muscleMap?.labels?.[id] || id;
  const safeExercises = Array.isArray(exercises) ? exercises : [];
  const safeRecent = Array.isArray(recent) ? recent : [];
  const filtered = q.length >= 2
    ? safeExercises.filter(ex => (ex.display_name || ex.name || "").toLowerCase().includes(q.toLowerCase()))
    : safeExercises;

  return (
    <div className="space-y-5">
      <div className="px-4 py-3 rounded-2xl border bg-fit-card border-fit-line flex items-center gap-3 focus-within:border-fit-accent transition-colors">
        <Search size={16} className="text-fit-dim" />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Übung suchen…"
          className="w-full bg-transparent border-none outline-none text-sm text-fit-ink font-medium placeholder:opacity-40"
        />
      </div>

      {safeRecent.length > 0 && !q && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold px-1" style={{ color: 'var(--dim)', opacity: 0.7 }}>Zuletzt trainiert</div>
          <div className="flex flex-wrap gap-1.5">
            {safeRecent.slice(0, 6).map((ex, i) => {
              const found = safeExercises.find(e => e.exercise_id === ex.exercise_id || (e.display_name || e.name) === (ex.name || ex.exercise_id));
              const active = !!found && selected?.exercise_id === found.exercise_id;
              return (
                <button key={i} disabled={!found} onClick={() => found && setSelected(found)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${active ? 'bg-fit-accent text-black border-fit-accent' : 'bg-fit-bg2 border-fit-line text-fit-muted hover:text-fit-ink'} ${found ? '' : 'opacity-40 cursor-default'}`}>
                  {ex.name || ex.exercise_id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="px-1 flex justify-between items-center text-[11px] font-semibold" style={{ color: 'var(--dim)', opacity: 0.7 }}>
          <span>Bibliothek</span>
          <span className="opacity-60 font-mono">{filtered.length}</span>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-2 hide-scrollbar">
          {loading ? (
            <div className="py-12 flex justify-center opacity-30">
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-fit-line rounded-2xl">
               <Activity size={20} className="mx-auto mb-2 opacity-40" />
               <p className="text-sm font-semibold" style={{ color: 'var(--dim)' }}>Keine Übung gefunden</p>
            </div>
          ) : (
            filtered.slice(0, 80).map(ex => (
              <button key={ex.exercise_id} onClick={() => setSelected(ex)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${selected?.exercise_id === ex.exercise_id ? 'bg-fit-accent/10 border-fit-accent/40' : 'bg-fit-card border-fit-line hover:border-fit-accent/30'}`}>
                <div className="flex items-center gap-3.5">
                  {(ex.gif_url || ex.image_url) && (
                    <div className="w-11 h-11 rounded-lg overflow-hidden border border-fit-line bg-fit-bg2 shrink-0">
                      <img src={ex.gif_url || ex.image_url} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                  <div>
                    <div className={`font-semibold text-sm transition-colors ${selected?.exercise_id === ex.exercise_id ? 'text-fit-accent' : 'text-fit-ink'}`}>
                      {ex.display_name || ex.name}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--dim)', opacity: 0.65 }}>
                      {(ex.primary_muscles || ex.primaryMuscles || []).slice(0, 3).map(muscleLabel).join(" · ")}
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
