import { HardDriveDownload, RefreshCw, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { EXERCISE_DB_SOURCES } from '../../lib/exerciseDbs/sources.js'

function fmtBytes(n) {
  if (!n) return '—'
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function SourceRow({ source, status, busy, error, update, onDownload, onRemove }) {
  const updateAvailable = update?.available === true
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-center py-4 border-t border-fit-line first:border-t-0">
      <div className="min-w-0 space-y-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="xa-serif text-xl text-fit-ink">{source.label}</span>
          <span className="xa-label">{source.author}</span>
          <a href={source.repoUrl} target="_blank" rel="noopener noreferrer" className="xa-label inline-flex items-center gap-1 hover:text-fit-accent">
            git <ExternalLink size={10} />
          </a>
        </div>
        <p className="text-[12.5px] text-fit-muted m-0">{source.description}</p>
        <div className="xa-mono text-[10.5px] text-fit-dim">
          {status
            ? <>auf diesem Gerät · {status.count} Übungen · {fmtBytes(status.bytes)} · geladen {fmtDate(status.fetchedAt)}{status.version ? ` · ${status.version.slice(0, 7)}` : ''} · {source.license}</>
            : <>nicht geladen · {source.license}</>}
        </div>
        {updateAvailable && (
          <div className="xa-mono text-[10.5px] text-fit-accent">neuer Stand upstream{update?.latest?.versionDate ? ` (${fmtDate(update.latest.versionDate)})` : ''}</div>
        )}
        {error && <div className="xa-mono text-[10.5px] text-fit-red">{error}</div>}
      </div>
      <div className="flex gap-2">
        <button
          type="button" disabled={busy} onClick={() => onDownload(source.id)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-60 ${status && !updateAvailable ? 'border border-fit-line text-fit-muted hover:text-fit-ink' : 'bg-fit-accent text-fit-bg'}`}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : status ? <RefreshCw size={14} /> : <HardDriveDownload size={14} />}
          {status ? (updateAvailable ? 'Aktualisieren' : 'Neu laden') : 'Auf Gerät laden'}
        </button>
        {status && (
          <button
            type="button" disabled={busy} onClick={() => onRemove(source.id)}
            aria-label={`${source.label} vom Gerät entfernen`}
            className="p-2 rounded-xl border border-fit-line text-fit-dim hover:text-fit-red disabled:opacity-60"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function SourcePanel({ mirrors }) {
  return (
    <section className="rounded-3xl border border-fit-line bg-fit-card px-5">
      {EXERCISE_DB_SOURCES.map((source) => (
        <SourceRow
          key={source.id}
          source={source}
          status={mirrors.statuses[source.id]}
          busy={!!mirrors.busy[source.id]}
          error={mirrors.errors[source.id]}
          update={mirrors.updates[source.id]}
          onDownload={mirrors.download}
          onRemove={mirrors.remove}
        />
      ))}
    </section>
  )
}
