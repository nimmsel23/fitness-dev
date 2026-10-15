import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { getAssignedPlans, localToday } from '@db'
import ExerciseChecklist from './components/ExerciseChecklist.jsx'

export default function AssignedPlans() {
  const { user } = useUser()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return
    getAssignedPlans(user.uid)
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false))
  }, [user?.uid])

  if (loading || plans.length === 0) return null

  return (
    <div className="mb-6 space-y-4">
      <h3 className="text-xs font-bold text-fit-dim uppercase flex items-center gap-2 px-1">
        <Send size={14} className="text-fit-accent" />
        Vom Coach zugewiesen
      </h3>
      {plans.map(plan => (
        <ExerciseChecklist
          key={plan.id}
          plan={plan}
          clientUid={user.uid}
          date={localToday()}
        />
      ))}
    </div>
  )
}
