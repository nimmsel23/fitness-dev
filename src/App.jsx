import { useState, useEffect } from 'react'
import { Activity, BarChart3, BookOpen, Dumbbell, Layers, Search, Settings2 } from 'lucide-react'
import Dashboard from './views/Dashboard.jsx'
import Session from './views/Session.jsx'
import Journal from './views/Journal.jsx'
import Muscles from './views/Muscles.jsx'
import Learn from './views/Learn.jsx'
import WeeklyReview from './views/WeeklyReview.jsx'
import Settings from './views/Settings.jsx'
import ExerciseInsightModal from './components/ExerciseInsightModal.jsx'
import { api } from './api.js'

const VALID_TABS = new Set(['dash', 'session', 'review', 'learn', 'journal', 'muscles', 'settings'])

const TABS = [
  { id: 'dash',     label: 'Heute',    Icon: Activity },
  { id: 'session',  label: 'Training', Icon: Dumbbell },
  { id: 'review',   label: 'Review',   Icon: BarChart3 },
  { id: 'learn',    label: 'Lernen',   Icon: Search },
  { id: 'journal',  label: 'Journal',  Icon: BookOpen },
  { id: 'muscles',  label: 'Muskeln',  Icon: Layers },
  { id: 'settings', label: 'Setup',    Icon: Settings2 },
]

export const DARK_THEMES  = ['honey','mocha','macchiato','frappe','dracula','dracula-purple','nordic','nordic-darker','nordic-bluish','arc-dark','sweet','sweet-purple','ant-dark','materia','solarized-dark','nothing']
export const LIGHT_THEMES = ['latte','alucard','arc','solarized']

const DAY_START = 6
const DAY_END   = 20

function getHashTab() {
  const hash = window.location.hash.slice(1)
  return VALID_TABS.has(hash) ? hash : 'dash'
}

function loadPref(key, fallback) {
  return localStorage.getItem(key) || fallback
}

function savePref(key, val) {
  localStorage.setItem(key, val)
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'honey' ? '' : t)
}

export default function App() {
  const [tab, setTab]             = useState(getHashTab)
  const [theme, setThemeState]    = useState(() => loadPref('fitness-theme', 'honey'))
  const [themeMode, setModeState] = useState(() => loadPref('fitness-theme-mode', 'manual'))
  // Circadian: which dark + which light to use
  const [circDark,  setCircDark]  = useState(() => loadPref('fitness-circ-dark',  'honey'))
  const [circLight, setCircLight] = useState(() => loadPref('fitness-circ-light', 'latte'))
  const [sessionDate, setSessionDate]   = useState(null)
  const [sessionDraft, setSessionDraft] = useState(null)
  const [inspectorExercise, setInspectorExercise] = useState(null)

  // Load manual theme from server on first render
  useEffect(() => {
    if (loadPref('fitness-theme-mode', 'manual') !== 'circadian') {
      api.get('/theme').then(d => {
        if (d?.theme) { setThemeState(d.theme); applyTheme(d.theme) }
      }).catch(() => {})
    }
  }, [])

  // Circadian: apply immediately + tick every minute
  useEffect(() => {
    if (themeMode !== 'circadian') return
    function tick() {
      const h = new Date().getHours()
      const t = h >= DAY_START && h < DAY_END ? circLight : circDark
      setThemeState(t)
      applyTheme(t)
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [themeMode, circDark, circLight])

  // Manual theme → apply to DOM
  useEffect(() => {
    if (themeMode !== 'circadian') applyTheme(theme)
  }, [theme, themeMode])

  // Sync tab → URL hash
  useEffect(() => {
    if (window.location.hash.slice(1) !== tab) history.pushState(null, '', `#${tab}`)
  }, [tab])

  useEffect(() => {
    function onPopState() { setTab(getHashTab()) }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function setManualTheme(t) {
    setModeState('manual')
    savePref('fitness-theme-mode', 'manual')
    setThemeState(t)
    savePref('fitness-theme', t)
    api.post('/theme', { theme: t }).catch(() => {})
  }

  function setThemeMode(mode) {
    setModeState(mode)
    savePref('fitness-theme-mode', mode)
  }

  function setCircadianDark(t) {
    setCircDark(t)
    savePref('fitness-circ-dark', t)
  }

  function setCircadianLight(t) {
    setCircLight(t)
    savePref('fitness-circ-light', t)
  }

  function navigate(id) { setTab(id) }

  function openSession(date, draft = null) {
    setSessionDate(date || null)
    setSessionDraft(draft || null)
    navigate('session')
  }

  async function inspectExercise(exercise) {
    if (!exercise) return
    setInspectorExercise(exercise)
    const id = exercise.exercise_id || exercise.id
    if (!id || exercise.lesson) return
    try {
      const data = await api.get(`/exercise/${encodeURIComponent(id)}/teaching`)
      if (data?.ok && data.lesson)
        setInspectorExercise(prev => prev ? { ...prev, lesson: data.lesson } : prev)
    } catch {}
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>

      <header style={{ background: 'var(--glass)', borderBottom: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
        className="flex items-center justify-between px-4 py-2.5 z-20 shrink-0">
        <div className="flex items-center gap-2 font-extrabold text-base tracking-tight">
          <Dumbbell size={22} style={{ color: 'var(--accent)' }} />
          Fitness
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 pb-28">
          {tab === 'dash'     && <Dashboard onOpenSession={openSession} onInspectExercise={inspectExercise} onOpenReview={() => navigate('review')} />}
          {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} />}
          {tab === 'review'   && <WeeklyReview onOpenSession={openSession} onInspectExercise={inspectExercise} />}
          {tab === 'learn'    && <Learn onInspectExercise={inspectExercise} />}
          {tab === 'journal'  && <Journal />}
          {tab === 'muscles'  && <Muscles />}
          {tab === 'settings' && (
            <Settings
              theme={theme} themeMode={themeMode}
              circDark={circDark} circLight={circLight}
              onSetManualTheme={setManualTheme}
              onSetThemeMode={setThemeMode}
              onSetCircadianDark={setCircadianDark}
              onSetCircadianLight={setCircadianLight}
            />
          )}
        </div>
      </main>

      <nav style={{ background: 'var(--glass)', borderTop: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
        className="flex shrink-0 px-2 pb-safe z-20">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => navigate(id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold tracking-wide transition-all"
            style={{ color: tab === id ? 'var(--accent)' : 'var(--dim)', background: 'none', border: 'none' }}>
            <Icon size={22} />
            {label}
          </button>
        ))}
      </nav>

      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} />
    </div>
  )
}
