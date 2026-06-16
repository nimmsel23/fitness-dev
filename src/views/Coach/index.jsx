import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Trash2, Info, AlertTriangle, User } from "lucide-react";
import { getGlobalInbox, approveInbox, deleteInbox } from "@db";

export default function Coach({ onInspectExercise }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    fetchInbox();
  }, []);

  async function fetchInbox() {
    setLoading(true);
    try {
      // getGlobalInbox would use collectionGroup('inbox')
      const data = await getGlobalInbox();
      setExercises(data);
    } catch (e) {
      console.error("Failed to fetch global inbox:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(fileId, userId) {
    setActioning(fileId);
    try {
      await approveInbox(fileId, userId);
      setExercises(prev => prev.filter(ex => ex.file_id !== fileId));
    } catch (e) {
      alert("Fehler beim Freigeben");
    } finally {
      setActioning(null);
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="spinner" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-ink mb-1">Hidden Chamber</h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Coach Administration & Approval</p>
        </div>
        <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
          <Sparkles size={16} className="text-accent" />
          <span className="text-[10px] font-black uppercase text-accent">{exercises.length} Tasks</span>
        </div>
      </header>

      <div className="grid gap-4">
        {exercises.map((ex) => {
          const data = ex.enriched || ex;
          const userId = ex.userId || "unknown";
          
          return (
            <div key={ex.file_id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-accent/30 transition-all group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <User size={12} className="text-dim" />
                  <span className="text-[10px] font-bold text-dim uppercase tracking-widest">{userId}</span>
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-black text-ink truncate">{data.display_name || data.name}</h3>
                  <span className="text-[9px] font-black px-2 py-0.5 bg-bg2 rounded-full border border-line text-dim uppercase tracking-tighter">
                    {data.category}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {data.primary_muscles?.map(m => (
                    <span key={m} className="text-[9px] font-bold px-2 py-0.5 bg-accent/5 text-accent rounded-md border border-accent/10">
                      {m}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-dim line-clamp-2 leading-relaxed opacity-70 italic">
                  "{data.coaching_notes?.[0] || 'Keine Notizen generiert.'}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button 
                  onClick={() => onInspectExercise?.(data)}
                  className="p-3 bg-bg2 text-dim hover:text-ink rounded-xl border border-line transition-all active:scale-95"
                >
                  <Info size={18} />
                </button>
                <button 
                  onClick={() => handleApprove(ex.file_id, userId)}
                  disabled={actioning === ex.file_id}
                  className="flex items-center gap-2 px-6 py-3 bg-accent text-black rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-accent/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                >
                  {actioning === ex.file_id ? 'Wait...' : <><CheckCircle2 size={16} /> Approve</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
