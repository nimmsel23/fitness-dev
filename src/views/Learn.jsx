import { useEffect, useState } from 'react'
import { Target, Sparkles, BookOpen, History, Brain, ChevronRight, RotateCcw, CheckCircle } from 'lucide-react'
import ExerciseSearch from '../components/ExerciseSearch.jsx'
import PlanBuilder from '../components/PlanBuilder.jsx'
import { api } from '../api.js'

function QuizMode({ exercises, onExit }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  useEffect(() => {
    async function loadCards() {
      const all = []
      for (const ex of exercises.slice(0, 8)) {
        const id = ex.exercise_id || ex.id
        if (!id) continue
        try {
          const data = await api.get(`/exercise/${encodeURIComponent(id)}/teaching`)
          const prompts = data?.lesson?.quiz_prompts || data?.lesson?.quiz || []
          for (const q of prompts) {
            if (q?.question) all.push({ exercise: ex.name || id, question: q.question, answer: q.answer || '' })
          }
        } catch {}
      }
      setCards(all)
      setLoading(false)
    }
    loadCards()
  }, [exercises])

  function answer(correct) {
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setRevealed(false)
    setIdx(i => i + 1)
  }

  if (loading) return (
    <div className="p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>Quiz wird geladen…</div>
  )
  if (!cards.length) return (
    <div className="p-6 text-center space-y-3">
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Keine Quiz-Fragen verfügbar für diese Übungen.</p>
      <button onClick={onExit} className="text-xs px-4 py-2 rounded-xl" style={{ background: 'var(--bg2)', color: 'var(--ink)', border: '1px solid var(--line)' }}>Zurück</button>
    </div>
  )
  if (idx >= cards.length) return (
    <div className="p-6 rounded-2xl text-center space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
      <CheckCircle size={32} style={{ color: 'var(--accent)', margin: '0 auto' }} />
      <div className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>Quiz beendet</div>
      <div className="text-sm" style={{ color: 'var(--muted)' }}>{score.correct} / {score.total} richtig</div>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setIdx(0); setScore({ correct: 0, total: 0 }); setRevealed(false) }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--bg2)', color: 'var(--ink)', border: '1px solid var(--line)' }}>
          <RotateCcw size={14} /> Nochmal
        </button>
        <button onClick={onExit} className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'rgba(94,234,212,0.12)', color: 'var(--accent)', border: '1px solid rgba(94,234,212,0.28)' }}>
          Fertig
        </button>
      </div>
    </div>
  )

  const card = cards[idx]
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          {idx + 1} / {cards.length} · {card.exercise}
        </span>
        <button onClick={onExit} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--line)' }}>Abbrechen</button>
      </div>
      <div className="p-5 rounded-2xl min-h-[140px] flex flex-col justify-between" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <p className="text-base font-semibold leading-6" style={{ color: 'var(--ink)' }}>{card.question}</p>
        {revealed ? (
          <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid var(--line)' }}>
            <p className="text-sm leading-6" style={{ color: 'var(--muted)' }}>{card.answer}</p>
            <div className="flex gap-3">
              <button onClick={() => answer(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.25)' }}>
                Nochmal üben
              </button>
              <button onClick={() => answer(true)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(94,234,212,0.12)', color: 'var(--accent)', border: '1px solid rgba(94,234,212,0.28)' }}>
                Gewusst
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setRevealed(true)} className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: 'var(--bg2)', color: 'var(--ink)', border: '1px solid var(--line)' }}>
            Antwort zeigen <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Learn({ onInspectExercise }) {
  const [recent, setRecent] = useState([])
  const [gaps, setGaps] = useState([])
  const [quizMode, setQuizMode] = useState(false)

  useEffect(() => {
    api.get('/session/latest').then(d => {
      setRecent(d?.session?.data?.exercises || [])
    }).catch(() => {})
    api.get('/coverage/gaps?days=7').then(d => {
      setGaps(d?.gaps || [])
    }).catch(() => {})
  }, [])

  if (quizMode) return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>
        <Brain size={13} />
        Quiz-Modus
      </div>
      <QuizMode exercises={recent} onExit={() => setQuizMode(false)} />
    </div>
  )

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                <History size={14} style={{ color: 'var(--accent)' }} />
                Letztes Training
              </div>
              {recent.length > 0 && (
                <button onClick={() => setQuizMode(true)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold"
                  style={{ background: 'rgba(94,234,212,0.12)', color: 'var(--accent)', border: '1px solid rgba(94,234,212,0.28)' }}>
                  <Brain size={12} /> Quiz starten
                </button>
              )}
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
