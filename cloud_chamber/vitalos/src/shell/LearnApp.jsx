import { useState } from 'react'
import Learn from '@view/learn/index.jsx'
import ExerciseInsightModal from '@components/ExerciseInsightModal.jsx'
import { getAnatomy } from '@db'

export default function LearnApp({ muscleLanguage = 'de', taxonomy = null }) {
  const [inspectorExercise, setInspectorExercise] = useState(null)

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
    <div className="h-full overflow-y-auto p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto">
      <Learn
        onInspectExercise={inspectExercise}
        muscleLanguage={muscleLanguage}
        taxonomy={taxonomy}
      />
      <ExerciseInsightModal
        exercise={inspectorExercise}
        onClose={() => setInspectorExercise(null)}
        muscleLanguage={muscleLanguage}
        taxonomy={taxonomy}
      />
    </div>
  )
}
