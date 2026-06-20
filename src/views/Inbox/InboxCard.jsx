import { CheckCircle2, Trash2, Info, AlertTriangle, Sparkles, User } from 'lucide-react';

export default function InboxCard({ ex, actioning, onApprove, onDelete, onInspect, showUserId = false }) {
  // Unterstützt beide Backend-Shapes: { exercises: [data] } und { enriched: data } und flach
  const data     = ex.exercises?.[0] || ex.enriched || ex;
  const fileId   = ex.file_id;
  const userId   = ex.userId || null;
  const warnings = data.biomechanical_warnings || [];
  const isProactive = ex.description?.toLowerCase().includes('proactively');
  const busy = actioning === fileId;

  return (
    <div className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-accent/30 transition-all">
      <div className="flex-1 min-w-0">
        {showUserId && userId && (
          <div className="flex items-center gap-2 mb-2">
            <User size={12} className="text-fit-dim" />
            <span className="text-[10px] font-bold text-fit-dim uppercase tracking-widest">{userId}</span>
          </div>
        )}

        <div className="flex items-center flex-wrap gap-2 mb-2">
          <h3 className="text-lg font-black text-fit-ink truncate">{data.display_name || data.name}</h3>
          {data.category && (
            <span className="text-[9px] font-black px-2 py-0.5 bg-fit-bg2 rounded-full border border-fit-line text-fit-dim uppercase tracking-tighter">
              {data.category}
            </span>
          )}
          {!showUserId && (
            isProactive
              ? <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 bg-blue/10 text-blue rounded-full border border-blue/20 uppercase tracking-tighter"><Sparkles size={10} /> Proaktiv</span>
              : <span className="text-[9px] font-black px-2 py-0.5 bg-fit-green/10 text-fit-green rounded-full border border-fit-green/20 uppercase tracking-tighter">Klient</span>
          )}
          {ex.status === 'pending' && (
            <span className="text-[9px] font-black px-2 py-0.5 bg-fit-orange/15 text-fit-orange rounded-full border border-fit-orange/25 uppercase tracking-tighter animate-pulse">
              Wartet auf KI-Anreicherung
            </span>
          )}
          {ex.status === 'ai_enriched' && (
            <span className="text-[9px] font-black px-2 py-0.5 bg-fit-accent/15 text-fit-accent rounded-full border border-fit-accent/25 uppercase tracking-tighter">
              Wartet auf Freigabe
            </span>
          )}
          {ex.status === 'failed_enrichment' && (
            <span className="text-[9px] font-black px-2 py-0.5 bg-fit-red/15 text-fit-red rounded-full border border-fit-red/25 uppercase tracking-tighter">
              KI-Fehler
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {data.primary_muscles?.map(m => (
            <span key={m} className="text-[9px] font-bold px-2 py-0.5 bg-fit-accent/5 text-fit-accent rounded-md border border-fit-accent/10">{m}</span>
          ))}
        </div>

        {warnings.length > 0 && (
          <div className="mb-3 p-3 bg-fit-red/5 border border-fit-red/10 rounded-xl space-y-1">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-fit-red text-[10px] font-bold uppercase leading-tight">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-fit-dim line-clamp-2 leading-relaxed opacity-70 italic">
          "{data.coaching_notes?.[0] || 'Keine Notizen generiert.'}"
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
        <button
          onClick={() => onInspect?.(data)}
          className="p-3 bg-fit-bg2 text-fit-dim hover:text-ink rounded-xl border border-fit-line transition-all active:scale-95"
          title="Details"
        >
          <Info size={18} />
        </button>
        <button
          onClick={() => onDelete(fileId)}
          disabled={busy}
          className="p-3 bg-fit-red/5 text-fit-red hover:bg-red/10 rounded-xl border border-fit-red/10 transition-all active:scale-95 disabled:opacity-50"
          title="Löschen"
        >
          <Trash2 size={18} />
        </button>
        {onApprove && (
          <button
            onClick={() => onApprove(fileId)}
            disabled={busy}
            className="flex items-center gap-2 px-6 py-3 bg-fit-accent text-black rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-accent/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
          >
            {busy ? 'Warte…' : <><CheckCircle2 size={16} /> Freigeben</>}
          </button>
        )}
      </div>
    </div>
  );
}
