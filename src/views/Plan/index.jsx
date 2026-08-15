import { useState } from 'react'
import WorkoutList from './WorkoutList.jsx'
import RoutineBuilder from './RoutineBuilder.jsx'
import WorkoutSession from './WorkoutSession.jsx'
import AssignedPlans from './AssignedPlans.jsx'
import AssignedMacrocycles from './AssignedMacrocycles.jsx'

export default function PlanView() {
  const [route, setRoute] = useState({ view: 'list' })

  return (
    <div className="max-w-2xl mx-auto">
      {route.view === 'list' && (
        <>
          <AssignedMacrocycles />
          <AssignedPlans />
          <WorkoutList
            onEditRoutine={(id) => setRoute({ view: 'routine', routineId: id })}
            onOpenWorkout={(id) => setRoute({ view: 'workout', workoutId: id })}
            onSettings={() => {}}
          />
        </>
      )}
      {route.view === 'routine' && (
        <RoutineBuilder
          routineId={route.routineId}
          onBack={() => setRoute({ view: 'list' })}
        />
      )}
      {route.view === 'workout' && (
        <WorkoutSession
          workoutId={route.workoutId}
          onBack={() => setRoute({ view: 'list' })}
          onFinished={() => setRoute({ view: 'list' })}
        />
      )}
    </div>
  )
}
