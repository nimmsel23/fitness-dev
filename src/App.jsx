import { useState, useEffect } from 'react'
import { Activity, BarChart3, BookOpen, Dumbbell, Layers, Search } from 'lucide-react'
import Dashboard from './views/Dashboard.jsx'
import Session from './views/Session.jsx'
import Journal from './views/Journal.jsx'
import Muscles from './views/Muscles.jsx'
import Learn from './views/Learn.jsx'
import WeeklyReview from './views/WeeklyReview.jsx'
import ExerciseInsightModal from './components/ExerciseInsightModal.jsx'
import { api } from './api.js'

const TABS = [
  { id: 'dash',    label: 'Heute',    Icon: Activity },
  { id: 'session', label: 'Training', Icon: Dumbbell },
  { id: 'review',  label: 'Review',   Icon: BarChart3 },
  { id: 'learn',   label: 'Lernen',   Icon: Search },
  { id: 'journal', label: 'Journal',  Icon: BookOpen },
  { id: 'muscles', label: 'Muskeln',  Icon: Layers },
]

export default function App() {
  const [tab, setTab] = useState('dash')
  const [theme, setTheme] = useState('mocha')
  const [sessionDate, setSessionDate] = useState(null)
  const [sessionDraft, setSessionDraft] = useState(null)
  const [inspectorExercise, setInspectorExercise] = useState(null)

  useEffect(() => {
    api.get('/theme').then(d => {
      if (d?.theme) setTheme(d.theme)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'latte' ? 'latte' : '')
  }, [theme])

  function toggleTheme() {
    const next = theme === 'mocha' ? 'latte' : 'mocha'
    setTheme(next)
    api.post('/theme', { theme: next }).catch(() => {})
  }

  function openSession(date, draft = null) {
    setSessionDate(date || null)
    setSessionDraft(draft || null)
    setTab('session')
  }

  function inspectExercise(exercise) {
    if (!exercise) return
    setInspectorExercise(exercise)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>

      {/* Topbar */}
      <header style={{ background: 'var(--glass)', borderBottom: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
        className="flex items-center justify-between px-4 py-2.5 z-20 shrink-0">
        <div className="flex items-center gap-2 font-extrabold text-base tracking-tight">
          <Dumbbell size={22} style={{ color: 'var(--accent)' }} />
          Fitness
        </div>
        <button
          onClick={toggleTheme}
          className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
          style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--muted)' }}
        >
          {theme === 'mocha' ? '☀️' : '🌙'}
        </button>
      </header>

      {/* View */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 pb-28">
          {tab === 'dash' && <Dashboard onOpenSession={openSession} onInspectExercise={inspectExercise} onOpenReview={() => setTab('review')} />}
          {tab === 'session' && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} />}
          {tab === 'review' && <WeeklyReview onOpenSession={openSession} onInspectExercise={inspectExercise} />}
          {tab === 'learn' && <Learn onInspectExercise={inspectExercise} />}
          {tab === 'journal' && <Journal />}
          {tab === 'muscles' && <Muscles />}
        </div>
      </main>

      {/* Bottom nav */}
      <nav style={{ background: 'var(--glass)', borderTop: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
        className="flex shrink-0 px-2 pb-safe z-20">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold tracking-wide transition-all"
            style={{ color: tab === id ? 'var(--accent)' : 'var(--dim)', background: 'none', border: 'none' }}
          >
            <Icon size={22} />
            {label}
          </button>
        ))}
      </nav>

      <ExerciseInsightModal
        exercise={inspectorExercise}
        onClose={() => setInspectorExercise(null)}
      />
    </div>
  )
}
