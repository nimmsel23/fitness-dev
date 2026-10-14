import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X, BookMarked } from 'lucide-react'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import {
  categoryDe, equipmentDe, forceDe, levelDe, mechanicDe, muscleDe,
} from './labels.js'

function Fact({ label, value }) {
  if (!value) return null
  return (
    <div className="border-t border-fit-line pt-2">
      <div className="xa-label">{label}</div>
      <div className="xa-serif text-[19px] leading-tight text-fit-ink mt-0.5">{value}</div>
    </div>
  )
}

export default function DetailSheet({ ex, position, total, onClose, onStep, onOpenCatalog }) {
  useEscapeKey(onClose, !!ex)

  useEffect(() => {
    if (!ex) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e) {
      if (e.key === 'ArrowRight') onStep(1)
      else if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [ex, onStep])

  if (!ex) return null
  const title = ex.catalog?.display_name || ex.name

  return createPortal(
    <>
      <div className="xa-scrim" onClick={onClose} />
      <aside className="xa xa-sheet text-fit-ink" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-3 bg-fit-bg/90 backdrop-blur border-b border-fit-line">
          <div className="xa-label">Tafel {position} / {total}</div>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => onStep(-1)} aria-label="Vorherige Übung" className="p-2 rounded-full border border-fit-line text-fit-muted hover:text-fit-ink"><ChevronLeft size={16} /></button>
            <button type="button" onClick={() => onStep(1)} aria-label="Nächste Übung" className="p-2 rounded-full border border-fit-line text-fit-muted hover:text-fit-ink"><ChevronRight size={16} /></button>
            <button type="button" onClick={onClose} aria-label="Schließen" className="p-2 rounded-full bg-fit-accent text-fit-bg"><X size={16} /></button>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          <div>
            <h2 className="xa-serif text-[34px] sm:text-[44px] leading-[1.02] tracking-tight">{title}</h2>
            {ex.catalog && title !== ex.name && <div className="xa-mono text-xs text-fit-dim mt-1.5">{ex.name}</div>}
          </div>

          {ex.images.length > 0 && (
            <div className="space-y-2">
              <div className="xa-flip">
                {ex.images.map((src) => <img key={src} src={src} alt="" decoding="async" />)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ex.images.map((src, i) => (
                  <figure key={src} className="m-0">
                    <img src={src} alt="" loading="lazy" className="w-full aspect-[4/3] object-cover rounded-lg bg-fit-bg2" />
                    <figcaption className="xa-label mt-1">{i === 0 ? 'Start' : 'Ende'}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4">
            <Fact label="Kategorie" value={categoryDe(ex.category)} />
            <Fact label="Equipment" value={equipmentDe(ex.equipment)} />
            <Fact label="Level" value={levelDe(ex.level)} />
            <Fact label="Bewegung" value={forceDe(ex.force)} />
            <Fact label="Typ" value={mechanicDe(ex.mechanic)} />
          </div>

          <div className="space-y-3">
            <div>
              <div className="xa-label mb-1.5">Primär</div>
              <div className="flex flex-wrap gap-1.5">
                {ex.primary.length ? ex.primary.map((m) => (
                  <span key={m} className="xa-chip" data-on="true">{muscleDe(m)}</span>
                )) : <span className="text-fit-dim text-sm">—</span>}
              </div>
            </div>
            {ex.secondary.length > 0 && (
              <div>
                <div className="xa-label mb-1.5">Sekundär</div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.secondary.map((m) => <span key={m} className="xa-chip">{muscleDe(m)}</span>)}
                </div>
              </div>
            )}
          </div>

          {ex.steps.length > 0 && (
            <div>
              <div className="xa-label mb-3">Ausführung <span className="normal-case tracking-normal opacity-70">· Originaltext (EN)</span></div>
              <ol className="space-y-4 list-none p-0 m-0">
                {ex.steps.map((step, i) => (
                  <li key={i} className="xa-step">
                    <span className="xa-step-n">{i + 1}</span>
                    <p className="text-[14.5px] leading-relaxed text-fit-muted m-0">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {ex.catalog && onOpenCatalog && (
            <button
              type="button"
              onClick={() => onOpenCatalog(ex.catalog)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-fit-accent text-fit-bg font-black text-xs uppercase tracking-widest"
            >
              <BookMarked size={15} /> Katalog-Eintrag öffnen
            </button>
          )}
        </div>
      </aside>
    </>,
    document.body,
  )
}
