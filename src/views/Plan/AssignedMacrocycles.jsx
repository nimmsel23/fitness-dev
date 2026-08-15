import { useState, useEffect } from 'react'
import { CalendarRange } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { listMacrocycles, getMacrocycle } from '@db'

const DAYS = [
  ['mo', 'Mo'], ['di', 'Di'], ['mi', 'Mi'], ['do', 'Do'],
  ['fr', 'Fr'], ['sa', 'Sa'], ['so', 'So'],
]

// Welche Kalenderwoche seit Start des Zyklus — bestimmt, welche Woche
// standardmäßig aufgeklappt ist, ohne dass der Klient selbst zählen muss.
function currentWeekIndex(createdAt, weekCount) {
  const start = new Date(createdAt)
  const days = Math.floor((Date.now() - start.getTime()) / 86400000)
  const idx = Math.floor(days / 7)
  return Math.min(Math.max(idx, 0), weekCount - 1)
}

export default function AssignedMacrocycles() {
  const { user } = useUser()
  const [cycles, setCycles] = useState([])
  const [openCycleId, setOpenCycleId] = useState(null)
  const [openWeekIdx, setOpenWeekIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return
    listMacrocycles(user.uid)
      .then(async (list) => {
        setCycles(list)
        if (list.length > 0) {
          const first = await getMacrocycle(user.uid, list[0].id)
          if (first) {
            setOpenCycleId(first.id)
            setOpenWeekIdx(currentWeekIndex(first.createdAt, first.weeks.length))
          }
        }
      })
      .catch(() => setCycles([]))
      .finally(() => setLoading(false))
  }, [user?.uid])

  const [fullCycle, setFullCycle] = useState(null)
  useEffect(() => {
    if (!openCycleId || !user?.uid) { setFullCycle(null); return }
    getMacrocycle(user.uid, openCycleId).then(setFullCycle)
  }, [openCycleId, user?.uid])

  if (loading || cycles.length === 0) return null

  const week = fullCycle?.weeks?.[openWeekIdx]

  return (
    <div className="mb-6 space-y-3">
      <h3 className="text-xs font-bold text-fit-dim uppercase flex items-center gap-2 px-1">
        <CalendarRange size={14} className="text-fit-accent" />
        Trainingsplan vom Coach
      </h3>

      {fullCycle && (
        <div className="rounded-lg bg-fit-bg2/50 border border-fit-line/50 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-fit-ink">{fullCycle.name}</div>
              <div className="text-xs text-fit-dim mt-0.5">Woche {openWeekIdx + 1} / {fullCycle.weeks.length}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpenWeekIdx(i => Math.max(0, i - 1))}
                disabled={openWeekIdx === 0}
                className="px-2 py-1 text-xs font-bold text-fit-dim hover:text-fit-ink disabled:opacity-30"
              >‹</button>
              <button
                onClick={() => setOpenWeekIdx(i => Math.min(fullCycle.weeks.length - 1, i + 1))}
                disabled={openWeekIdx === fullCycle.weeks.length - 1}
                className="px-2 py-1 text-xs font-bold text-fit-dim hover:text-fit-ink disabled:opacity-30"
              >›</button>
            </div>
          </div>

          {week && (
            <div className="divide-y divide-fit-line/20">
              {DAYS.map(([dayKey, dayLabel]) => {
                const day = week.days[dayKey]
                if (!day || !(day.exercises || []).length) {
                  return (
                    <div key={dayKey} className="px-4 py-2.5 flex items-center gap-3 opacity-40">
                      <span className="text-[10px] font-black uppercase w-7">{dayLabel}</span>
                      <span className="text-xs">Ruhetag</span>
                    </div>
                  )
                }
                return (
                  <div key={dayKey} className="px-4 py-2.5">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] font-black uppercase w-7 text-fit-accent">{dayLabel}</span>
                      <span className="text-xs font-bold text-fit-ink">{day.label || 'Training'}</span>
                    </div>
                    <div className="pl-10 space-y-1">
                      {day.exercises.map((ex, i) => (
                        <div key={i} className="text-xs text-fit-dim flex items-center justify-between">
                          <span>{ex.name}</span>
                          <span className="text-fit-dim/70">{ex.sets}×{ex.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
