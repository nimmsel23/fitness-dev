/**
 * FitnessApp — exposed von fitness als Module Federation Remote.
 *
 * Wird von fitness.remote.vite.config.js als './FitnessApp' exposed.
 * Kein Auth-Gate, kein createRoot — Host (vitalos) mounted in seinen React-Tree.
 *
 * @db → src/db.js (:9100) oder src/db.firestore.js (--mode firebase)
 */

import '../../src/styles.css'
import { useState, useEffect } from 'react'
import { Activity, Dumbbell, BarChart3, Brain, Settings2 } from 'lucide-react'
import Dashboard    from '@src/views/Dashboard/index.jsx'
import Session      from '@src/views/Session/index.jsx'
import WeeklyReview from '@src/views/WeeklyReview/index.jsx'
import Learn        from '@src/views/Learn/index.jsx'
import Settings     from '@src/views/Settings/index.jsx'
import ExerciseInsightModal from '@src/components/ExerciseInsightModal.jsx'
import { getAnatomy, isLocalMode } from '@db'

const TABS = [
  { id: 'dash',     label: 'Heute',    Icon: Activity  },
  { id: 'session',  label: 'Training', Icon: Dumbbell  },
  { id: 'review',   label: 'Review',   Icon: BarChart3 },
  { id: 'learn',    label: 'Lernen',   Icon: Brain     },
  { id: 'settings', label: 'Setup',    Icon: Settings2 },
]

export default function FitnessApp() {
  const [tab, setTab]                     = useState('dash')
  const [sessionDate, setSessionDate]     = useState(null)
  const [sessionDraft, setSessionDraft]   = useState(null)
  const [inspector, setInspector]         = useState(null)
  const [anatomy, setAnatomy]             = useState(null)
  const [taxonomy, setTaxonomy]           = useState(null)
  const [layoutScale, setLayoutScale]     = useState(() => parseInt(localStorage.getItem('fitness-layoutScale') || '100', 10))
  const gender        = localStorage.getItem('fitness-gender') || 'male'
  const muscleLanguage = localStorage.getItem('fitness-muscleLanguage') || 'de'

  useEffect(() => {
    if (isLocalMode()) {
      fetch('/fitness/muscles').then(r => r.json()).then(d => setTaxonomy(d?.muscles || null)).catch(() => {})
    }
  }, [])

  const inspectExercise = (ex) => {
    setInspector(ex)
    if (ex?.exercise_id || ex?.id) {
      getAnatomy(ex.exercise_id || ex.id).then(setAnatomy).catch(() => setAnatomy(null))
    }
  }

  const openSession = (date, draft) => {
    setSessionDate(date || null)
    setSessionDraft(draft || null)
    setTab('session')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <nav style={{ display: 'flex', borderBottom: '1px solid var(--line, #1e293b)', flexShrink: 0 }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: '10px 0', border: 'none', cursor: 'pointer', fontSize: 13,
            fontWeight: 600, background: 'transparent',
            color: tab === id ? 'var(--accent, #3b82f6)' : 'var(--dim, #64748b)',
            borderBottom: tab === id ? '2px solid var(--accent, #3b82f6)' : '2px solid transparent',
            transition: 'color 0.15s, border-color 0.15s',
          }}>
            <Icon size={15} />{label}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 0 }}>
        {tab === 'dash'     && <Dashboard user={null} onOpenSession={openSession} onInspectExercise={inspectExercise} onOpenReview={() => setTab('review')} recentDays={7} coverageThreshold={1.0} dashboardHighlighter="body" gender={gender} navMode="tabs" navigate={setTab} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />}
        {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} />}
        {tab === 'review'   && <WeeklyReview onOpenSession={openSession} onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} gender={gender} />}
        {tab === 'learn'    && <Learn onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />}
        {tab === 'settings' && <Settings layoutScale={layoutScale} setLayoutScale={setLayoutScale} gender={gender} setGender={() => {}} split="PPL" setSplit={() => {}} cycleLength={4} setCycleLength={() => {}} defaultLocation="Home" setDefaultLocation={() => {}} recentDays={7} setRecentDays={() => {}} coverageThreshold={1.0} setCoverageThreshold={() => {}} showAdvanced={false} setShowAdvanced={() => {}} dashboardHighlighter="body" setDashboardHighlighter={() => {}} sidebarPinned={false} setSidebarPinned={() => {}} swipeEnabled={false} setSwipeEnabled={() => {}} muscleLanguage={muscleLanguage} setMuscleLanguage={() => {}} navMode="tabs" setNavMode={() => {}} />}
      </div>

      {inspector && (
        <ExerciseInsightModal exercise={inspector} anatomy={anatomy} onClose={() => { setInspector(null); setAnatomy(null) }} />
      )}
    </div>
  )
}
