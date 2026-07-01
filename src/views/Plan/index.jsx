import { useState } from 'react'
import WorkoutList from './WorkoutList.jsx'
import WorkoutBuilder from './WorkoutBuilder.jsx'

export default function PlanView() {
  const [route, setRoute] = useState({ view: 'list' })

  return (
    <div className="max-w-2xl mx-auto">
      {route.view === 'list' && (
        <WorkoutList
          onOpen={(id) => setRoute({ view: 'builder', workoutId: id })}
          onSettings={() => {}}
        />
      )}
      {route.view === 'builder' && (
        <WorkoutBuilder
          workoutId={route.workoutId}
          onBack={() => setRoute({ view: 'list' })}
        />
      )}
    </div>
  )
}
