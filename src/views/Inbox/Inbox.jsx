import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, Trash2, Info, AlertTriangle, ExternalLink } from "lucide-react";
import { api } from "../../db.js";

export default function Inbox({ onInspectExercise }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    fetchInbox();
  }, []);

  async function fetchInbox() {
    setLoading(true);
    try {
      const data = await api.get("/fitness/inbox");
      setExercises(data.exercises || []);
    } catch (e) {
      console.error("Failed to fetch inbox:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(fileId) {
    setActioning(fileId);
    try {
      await api.post(`/fitness/inbox/${fileId}/approve`, {});
      setExercises(prev => prev.filter(ex => ex.file_id !== fileId));
    } catch (e) {
      alert("Fehler beim Freigeben");
    } finally {
      setActioning(null);
    }
  }

  async function handleDelete(fileId) {
    if (!confirm("Diese Übung wirklich löschen?")) return;
    setActioning(fileId);
    try {
      await api.delete(`/fitness/inbox/${fileId}`);
      setExercises(prev => prev.filter(ex => ex.file_id !== fileId));
    } catch (e) {
      alert("Fehler beim Löschen");
    } finally {
      setActioning(null);
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="spinner" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-ink mb-1">Exercise Inbox</h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">KI-angereicherte Neuanfragen</p>
        </div>
        <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
          <Sparkles size={16} className="text-accent" />
          <span className="text-[10px] font-black uppercase text-accent">{exercises.length} Ausstehend</span>
        </div>
      </header>

      {exercises.length === 0 ? (
        <div className="card py-20 flex flex-col items-center justify-center text-center opacity-30 border-dashed">
          <CheckCircle2 size={48} className="mb-4 text-green" />
          <h3 className="text-lg font-black">Alle Anfragen bearbeitet</h3>
          <p className="text-xs font-bold uppercase tracking-widest mt-1">Keine neuen Übungen in der Inbox</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exercises.map((ex) => {
            const data = ex.exercises?.[0] || {};
            const isProactive = ex.description?.toLowerCase().includes("proactively");
            const warnings = data.biomechanical_warnings || [];

            return (
              <div key={ex.file_id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-accent/30 transition-all group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-black text-ink truncate">{data.display_name || data.name}</h3>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-bg2 rounded-full border border-line text-dim uppercase tracking-tighter">
                      {data.category}
                    </span>
                    {isProactive ? (
                      <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 bg-blue/10 text-blue rounded-full border border-blue/20 uppercase tracking-tighter">
                        <Sparkles size={10} /> Proaktiv
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 bg-green/10 text-green rounded-full border border-green/20 uppercase tracking-tighter">
                        Klient
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {data.primary_muscles?.map(m => (
                      <span key={m} className="text-[9px] font-bold px-2 py-0.5 bg-accent/5 text-accent rounded-md border border-accent/10">
                        {m}
                      </span>
                    ))}
                  </div>

                  {warnings.length > 0 && (
                    <div className="mb-4 p-3 bg-red/5 border border-red/10 rounded-xl space-y-1">
                      {warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 text-red text-[10px] font-bold uppercase leading-tight">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-dim line-clamp-2 leading-relaxed opacity-70 italic">
                    "{data.coaching_notes?.[0] || 'Keine Notizen generiert.'}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button 
                    onClick={() => onInspectExercise?.(data)}
                    className="p-3 bg-bg2 text-dim hover:text-ink rounded-xl border border-line transition-all active:scale-95"
                    title="Details ansehen"
                  >
                    <Info size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(ex.file_id)}
                    disabled={actioning === ex.file_id}
                    className="p-3 bg-red/5 text-red hover:bg-red/10 rounded-xl border border-red/10 transition-all active:scale-95 disabled:opacity-50"
                    title="Löschen"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleApprove(ex.file_id)}
                    disabled={actioning === ex.file_id}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-black rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-accent/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {actioning === ex.file_id ? 'Wait...' : <><CheckCircle2 size={16} /> Freigeben</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <section className="mt-12 p-8 rounded-3xl bg-blue/5 border border-blue/10">
        <div className="flex items-start gap-4 text-blue">
          <Info size={20} className="shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-2">Workflow Info</h4>
            <p className="text-xs font-medium leading-relaxed opacity-80">
              Übungen in dieser Liste wurden von Klienten angefragt und automatisch durch die KI angereichert. 
              Durch <strong>Freigeben</strong> wird die Übung dauerhaft in den Katalog aufgenommen und für alle 
              Klienten sichtbar gemacht. Überprüfe die Biomechanik und Coaching-Notes vor der Freigabe.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
