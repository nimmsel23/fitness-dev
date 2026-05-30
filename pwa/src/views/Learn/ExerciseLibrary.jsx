import { Search, ChevronRight, Activity } from "lucide-react";

export default function ExerciseLibrary({ exercises, selected, setSelected, q, setQ, recent, loading }) {
  const filtered = q.length >= 2
    ? exercises.filter(ex => (ex.display_name || ex.name || "").toLowerCase().includes(q.toLowerCase()))
    : exercises;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl border bg-card border-line flex items-center gap-3 focus-within:border-accent transition-colors shadow-inner">
        <Search size={18} className="text-dim" />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Übung suchen…"
          className="w-full bg-transparent border-none outline-none text-sm text-ink font-bold placeholder:opacity-30"
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
                  className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all ${selected?.exercise_id === found?.exercise_id ? 'bg-accent text-black border-accent shadow-lg shadow-accent/20' : 'bg-bg2 border-line text-muted hover:text-ink'}`}>
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
            <div className="p-12 text-center border border-dashed border-line rounded-2xl opacity-30">
               <Activity size={32} className="mx-auto mb-2" />
               <p className="text-xs font-black uppercase tracking-widest">Keine Übung gefunden</p>
            </div>
          ) : (
            filtered.slice(0, 80).map(ex => (
              <button key={ex.exercise_id} onClick={() => setSelected(ex)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${selected?.exercise_id === ex.exercise_id ? 'bg-accent/10 border-accent/40 shadow-md' : 'bg-card border-line hover:border-accent/30'}`}>
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
  );
}
