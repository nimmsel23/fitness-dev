import { useState } from 'react'
import { Activity, Dumbbell, BarChart3 } from 'lucide-react'
import Dashboard from '@view/dashboard/index.jsx'
import Session from '@view/session/index.jsx'
import WeeklyReview from '@view/review/index.jsx'
import ExerciseInsightModal from '@components/ExerciseInsightModal.jsx'
import { getAnatomy } from '@db'

const SUB_NAV = [
  { id: 'dash',    label: 'Heute',    Icon: Activity },
  { id: 'session', label: 'Training', Icon: Dumbbell },
  { id: 'review',  label: 'Review',   Icon: BarChart3 },
]

export default function FitnessApp({ user, recentDays, coverageThreshold, gender, muscleLanguage, taxonomy, dashboardHighlighter, subTab, onSubTab, sessionDate, sessionDraft, onOpenSession }) {
  const [inspectorExercise, setInspectorExercise] = useState(null)

  const tab = subTab || 'dash'
  const setTab = onSubTab || (() => {})

  async function inspectExercise(exercise) {
    if (!exercise) return
    setInspectorExercise(exercise)
    const id = exercise.exercise_id || exercise.id
    if (!id || exercise.lesson) return
    try {
      const lesson = await getAnatomy(id)
      if (lesson) setInspectorExercise(prev => prev ? { ...prev, lesson } : prev)
    } catch {}
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sub-Nav — nur auf Mobile/Tablet sichtbar, Desktop nutzt Sidebar */}
      <nav className="lg:hidden flex gap-1 px-4 pt-3 pb-2 border-b border-fit-line shrink-0">
        {SUB_NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === id
                ? 'bg-fit-accent text-black'
                : 'text-fit-dim hover:bg-white/5 hover:text-fit-ink'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
        {tab === 'dash'    && <Dashboard user={user} onOpenSession={onOpenSession} onInspectExercise={inspectExercise} onOpenReview={() => setTab('review')} recentDays={recentDays} coverageThreshold={coverageThreshold} dashboardHighlighter={dashboardHighlighter} gender={gender} muscleLanguage={muscleLanguage} taxonomy={taxonomy} navigate={setTab} />}
        {tab === 'session' && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} recentDays={recentDays} coverageThreshold={coverageThreshold} />}
        {tab === 'review'  && <WeeklyReview onOpenSession={onOpenSession} onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} gender={gender} recentDays={recentDays} />}
      </div>

      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />
    </div>
  )
}
