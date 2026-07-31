import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { toggleExerciseCompletion, getPlanCompletions } from '@db'

export default function ExerciseChecklist({ plan, clientUid, date }) {
  const [completions, setCompletions] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompletions()
  }, [plan.id, date])

  async function loadCompletions() {
    setLoading(true)
    const data = await getPlanCompletions(clientUid, plan.id, date)
    setCompletions(data?.doneExerciseIds || [])
    setLoading(false)
  }

  async function handleToggle(exerciseId) {
    await toggleExerciseCompletion(clientUid, plan.id, date, exerciseId)
    setCompletions(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    )
  }

  const exercises = plan.exercises || []
  const doneCount = completions.length
  const progress = exercises.length > 0 ? Math.round((doneCount / exercises.length) * 100) : 0

  if (loading) {
    return (
      <div className="p-4 text-center text-fit-dim text-xs">
        Loading plan…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-fit-bg2/50 p-4 border border-fit-line/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-fit-ink">{plan.name || 'Assigned Plan'}</h3>
          <span className="text-xs font-bold text-fit-accent bg-fit-accent/10 px-2 py-1 rounded">
            {doneCount}/{exercises.length}
          </span>
        </div>
        <div className="h-2 bg-fit-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-fit-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-fit-dim mt-2">
          {progress}% completed
        </p>
      </div>

      <div className="space-y-2">
        {exercises.map(exercise => (
          <button
            key={exercise.id || exercise.exercise_id}
            onClick={() => handleToggle(exercise.id || exercise.exercise_id)}
            className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
              completions.includes(exercise.id || exercise.exercise_id)
                ? 'bg-fit-accent/10 border-fit-accent text-fit-ink'
                : 'bg-fit-bg2/50 border-fit-line/50 text-fit-dim hover:bg-fit-bg2/80 hover:border-fit-line'
            }`}
          >
            <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${
              completions.includes(exercise.id || exercise.exercise_id)
                ? 'bg-fit-accent border-fit-accent'
                : 'border-fit-line/50'
            }`}>
              {completions.includes(exercise.id || exercise.exercise_id) && (
                <Check size={14} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">
                {exercise.name}
              </p>
              {exercise.sets && (
                <p className="text-xs text-fit-dim mt-0.5">
                  {exercise.sets} × {exercise.reps}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {exercises.length === 0 && (
        <div className="text-center py-8 text-fit-dim text-xs">
          No exercises in this plan
        </div>
      )}
    </div>
  )
}
