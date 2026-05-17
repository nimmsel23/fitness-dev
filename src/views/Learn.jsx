import { useEffect, useState } from 'react'
import { Target, Sparkles, BookOpen, History } from 'lucide-react'
import ExerciseSearch from '../components/ExerciseSearch.jsx'
import PlanBuilder from '../components/PlanBuilder.jsx'
import { api } from '../api.js'

export default function Learn({ onInspectExercise }) {
  const [recent, setRecent] = useState([])
  const [gaps, setGaps] = useState([])

  useEffect(() => {
    api.get('/session/latest').then(d => {
      setRecent(d?.session?.data?.exercises || [])
    }).catch(() => {})
    api.get('/coverage/gaps?days=7').then(d => {
      setGaps(d?.gaps || [])
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <section className="p-4 rounded-2xl" style={{ background: 'linear-gradient(180deg, var(--card), var(--bg2))', border: '1px solid var(--line)' }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>
          <Sparkles size={13} />
          Exercise Browser
        </div>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
          Uebung suchen, verstehen, exportieren
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>
          Suche eine Uebung, oeffne die Detailansicht und hole dir sofort Bewegungsmuster, Muskeln, Coaching Cues und einen Obsidian-Export.
        </p>
      </section>

      <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Uebung suchen</div>
        <ExerciseSearch onSelect={onInspectExercise} placeholder="z.B. dips, row, squat, lat pulldown" />
      </section>

      <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
          <BookOpen size={13} />
          Lernmodus
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              <Target size={14} style={{ color: 'var(--accent)' }} />
              Was die Ansicht zeigt
            </div>
            <ul className="mt-2 space-y-1 text-sm" style={{ color: 'var(--muted)' }}>
              <li>Bewegungsmuster und Gelenkaktionen</li>
              <li>Primaere und sekundaere Muskeln</li>
              <li>Feel Cues und typische Fehler</li>
              <li>Coach Sheet als Markdown-Export</li>
            </ul>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--ink)' }}>
              <History size={14} style={{ color: 'var(--accent)' }} />
              Letztes Training
            </div>
            {recent.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {recent.slice(0, 6).map((ex, i) => (
                  <button
                    key={`${ex.name || 'ex'}-${i}`}
                    onClick={() => onInspectExercise?.(ex)}
                    className="text-xs px-2.5 py-1.5 rounded-full"
                    style={{ background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line)' }}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Noch keine Session gespeichert.</p>
            )}
          </div>
        </div>
      </section>

      <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Lernfokus der Woche</div>
        {gaps.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {gaps.map(g => (
              <span key={g.name} className="text-xs px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--red)' }}>
                {g.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Aktuell keine Luecken gemeldet.</p>
        )}
      </section>

      <PlanBuilder onInspectExercise={onInspectExercise} />
    </div>
  )
}
