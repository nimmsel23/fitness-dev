import { useState, useEffect } from 'react'
import { Activity, Dumbbell, BarChart3, History, Timer, ChevronRight, ClipboardList } from 'lucide-react'
import Dashboard from './Dashboard.jsx'
import PlanView from '@view/plan/index.jsx'
import Session from '@view/session/index.jsx'
import WeeklyReview from '@view/review/index.jsx'
import ExerciseInsightModal from '@components/ExerciseInsightModal.jsx'
import { getAnatomy, getRecentSessions } from '@db'
import { getBlockColor as blockColor, ACTIVITY_LABELS, ACTIVITY_ICONS, ACTIVITY_EMOJI } from '@constants/ActivityConstants'

const SUB_NAV = [
  { id: 'dash',    label: 'Heute',    Icon: Activity },
  { id: 'session', label: 'Training', Icon: Dumbbell },
  { id: 'review',  label: 'Review',   Icon: BarChart3 },
  { id: 'verlauf', label: 'Verlauf',  Icon: History  },
  { id: 'plan',    label: 'Plan',     Icon: ClipboardList },
]

export default function FitnessApp({ user, recentDays, coverageThreshold, gender, muscleLanguage, taxonomy, dashboardHighlighter, subTab, onSubTab, sessionDate, sessionDraft, onOpenSession }) {
  const [inspectorExercise, setInspectorExercise] = useState(null)
  const [verlaufSessions, setVerlaufSessions] = useState([])

  const tab = subTab || 'dash'
  const setTab = onSubTab || (() => {})

  useEffect(() => {
    if (tab === 'verlauf') {
      getRecentSessions(60).then(s => setVerlaufSessions(Array.isArray(s) ? s.filter(x => x?.exercises?.length > 0 || x?.activity) : [])).catch(() => {})
    }
  }, [tab])

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
      {/* Sub-Nav */}
      <nav className="lg:hidden flex gap-1 px-4 pt-3 pb-2 border-b border-fit-line shrink-0 overflow-x-auto">
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
        {tab === 'verlauf' && (
          <div className="pb-32">
            {verlaufSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 opacity-30">
                <History size={40} className="mb-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.3em]">Noch keine Sessions</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {verlaufSessions.map((s, idx) => {
                  const isActivity = s.sessionMode === 'cardio' || !!s.activity
                  const actType = s.activity?.type
                  const emoji = actType ? ACTIVITY_EMOJI[actType] : null
                  const ActivityIcon = (!emoji && actType) ? (ACTIVITY_ICONS[actType] || Activity) : null
                  const label = isActivity ? (ACTIVITY_LABELS[actType] || 'Ausdauer') : s.block
                  const color = blockColor(s.block, s.activity, s.sessionMode)
                  return (
                    <button key={s.date || idx} onClick={() => { onOpenSession?.(s.date); setTab('session') }}
                      className="w-full text-left px-6 py-4 rounded-3xl bg-fit-card border border-fit-line hover:border-accent/40 transition-all group hover:bg-accent/5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 text-xl"
                            style={{ background: color + '15', color }}>
                            {isActivity && emoji ? emoji : isActivity && ActivityIcon ? <ActivityIcon size={22} /> : <Dumbbell size={22} />}
                          </div>
                          <div>
                            <div className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">{s.date}</div>
                            <div className="text-md font-black text-fit-ink group-hover:text-accent transition-colors">{label}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isActivity ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-black text-fit-muted">
                              <Timer size={12} className="opacity-30" />{s.activity?.duration}m
                            </div>
                          ) : (
                            <div className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-fit-bg2 text-fit-muted uppercase tracking-widest border border-fit-line">
                              {Array.isArray(s.exercises) ? s.exercises.length : 0} Ex
                            </div>
                          )}
                          <ChevronRight size={16} className="text-fit-dim/30 group-hover:text-fit-accent transition-colors" />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
        {tab === 'review'  && <WeeklyReview onOpenSession={onOpenSession} onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} gender={gender} recentDays={recentDays} />}
        {tab === 'plan' && <PlanView />}
      </div>

      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />
    </div>
  )
}
