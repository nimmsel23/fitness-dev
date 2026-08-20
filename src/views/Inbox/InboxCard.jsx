import { CheckCircle2, Trash2, Info, AlertTriangle, Sparkles, User, RefreshCw, MessageSquare, Brain } from 'lucide-react';

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value === null || value === undefined || value === '') return [];
  return [String(value)];
}

function sourceRefs(data) {
  const snapshot = data?.source_snapshot || {};
  const external = data?.external_ids || {};
  return {
    wger: asList(snapshot?.wger?.wger_id || external?.wger || data?.wger_id),
    yuhonas: asList(snapshot?.yuhonas?.yuhonas_id || external?.yuhonas || data?.yuhonas_id),
  };
}

function buildInspectPayload(ex, data) {
  return {
    ...ex,
    ...data,
    file_id: ex.file_id || data.file_id || null,
    userId: ex.userId || data.userId || null,
    status: ex.status || data.status || null,
    inbox_status: ex.status || data.status || null,
    coachFeedback: ex.coachFeedback || ex.feedback || data.coachFeedback || data.feedback || '',
    inbox_entry: ex,
    enriched: ex.enriched || data.enriched || null,
  };
}

export default function InboxCard({ ex, actioning, onApprove, onDelete, onReenrich, onInspect, showUserId = false, asMessage = false }) {
  // Unterstützt beide Backend-Shapes: { exercises: [data] } und { enriched: data } und flach
  const data     = ex.exercises?.[0] || ex.enriched || ex;
  const fileId   = ex.file_id;
  const userId   = ex.userId || null;
  const warnings = data.biomechanical_warnings || [];
  const isProactive = ex.description?.toLowerCase().includes('proactively');
  const isPendingEnrichment = ex.status === 'pending' || ex.status === 'pending_review';
  const busy = actioning === fileId;
  const refs = sourceRefs(data);

  if (asMessage) {
    let icon = <MessageSquare className="text-fit-dim" size={20} />;
    let title = `Anfrage: ${data.display_name || data.name}`;
    let body = "Deine Übungsanfrage wurde erfasst.";
    let iconBg = "bg-fit-bg2";
    let iconColor = "text-fit-dim";

    if (ex.type === 'coach_feedback') {
      icon = <Brain className="text-fit-accent animate-pulse" size={20} />;
      title = ex.title || "Neues Coach-Feedback 💬";
      body = ex.text || "Dein Coach hat einen Kommentar hinterlassen.";
      iconBg = "bg-fit-accent/10";
      iconColor = "text-fit-accent";
    } else if (isPendingEnrichment) {
      icon = <RefreshCw className="animate-spin text-fit-orange" size={20} />;
      title = `Anfrage gesendet: ${data.display_name || data.name}`;
      body = "Die Übungsanfrage wurde registriert. Die KI analysiert nun die biomechanischen Details...";
      iconBg = "bg-fit-orange/10";
      iconColor = "text-fit-orange";
    } else if (ex.status === 'ai_enriched') {
      icon = <Sparkles className="text-fit-accent animate-pulse" size={20} />;
      title = `KI-Entwurf bereit: ${data.display_name || data.name}`;
      body = "Die KI hat die Übung angereichert. Sie wartet nun auf die Freigabe durch den Coach.";
      iconBg = "bg-fit-accent/10";
      iconColor = "text-fit-accent";
    } else if (ex.status === 'approved') {
      icon = <CheckCircle2 className="text-fit-green" size={20} />;
      title = `Übung freigegeben: ${data.display_name || data.name} 🎉`;
      body = "Dein Coach hat die Übung freigegeben! Sie steht dir ab sofort im Katalog zur Verfügung.";
      iconBg = "bg-fit-green/10";
      iconColor = "text-fit-green";
    } else if (ex.status === 'rejected') {
      icon = <AlertTriangle className="text-fit-red" size={20} />;
      title = `Anfrage abgelehnt: ${data.display_name || data.name}`;
      body = "Der Coach hat die Übung nicht freigegeben. Bei Fragen wende dich direkt an deinen Coach.";
      iconBg = "bg-fit-red/10";
      iconColor = "text-fit-red";
    }

    return (
      <div className="card p-5 flex items-center justify-between gap-4 hover:border-fit-line transition-all">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-10 h-10 shrink-0 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-fit-ink truncate">{title}</h4>
            <p className="text-xs text-fit-dim mt-0.5 leading-relaxed truncate md:line-clamp-2 md:whitespace-normal">
              {body}
            </p>
            {ex.received_at && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-fit-muted block mt-1">
                {new Date(ex.received_at.seconds ? ex.received_at.seconds * 1000 : ex.received_at).toLocaleDateString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {ex.status === 'approved' && (
            <button
              onClick={() => onInspect?.(buildInspectPayload(ex, data))}
              className="p-2.5 bg-fit-bg2 text-fit-dim hover:text-ink rounded-lg border border-fit-line transition-all active:scale-95"
              title="Übung anzeigen"
            >
              <Info size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete(fileId)}
            disabled={busy}
            className="p-2.5 bg-fit-red/5 text-fit-red hover:bg-red/10 rounded-lg border border-fit-red/10 transition-all active:scale-95 disabled:opacity-50"
            title="Löschen"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

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
          {isPendingEnrichment && (
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

        {(refs.wger.length > 0 || refs.yuhonas.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {refs.wger.map((id) => (
              <span key={`wger-${id}`} className="text-[9px] font-black px-2 py-0.5 bg-fit-bg2 rounded-full border border-fit-line text-fit-dim uppercase tracking-tighter">
                wger {id}
              </span>
            ))}
            {refs.yuhonas.map((id) => (
              <span key={`yuhonas-${id}`} className="text-[9px] font-black px-2 py-0.5 bg-fit-bg2 rounded-full border border-fit-line text-fit-dim uppercase tracking-tighter">
                yuhonas {id}
              </span>
            ))}
          </div>
        )}

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
          onClick={() => onInspect?.(buildInspectPayload(ex, data))}
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
        {onReenrich && (
          <button
            onClick={() => onReenrich(fileId)}
            disabled={busy}
            className="p-3 bg-fit-bg2 text-fit-dim hover:text-fit-accent rounded-xl border border-fit-line transition-all active:scale-95 disabled:opacity-50"
            title="Neu anreichern (Gemini)"
          >
            <RefreshCw size={18} className={busy ? 'animate-spin' : ''} />
          </button>
        )}
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
