import { useState, useEffect } from 'react'
import { Dumbbell, ArrowRight, Check } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { getCoachAssignedPlans, assignPlanToClient, getClientPlanProgress } from '@db'

export default function AssignPlan() {
  const { user } = useUser()
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientPlans, setClientPlans] = useState([])
  const [assignedPlans, setAssignedPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({})

  // In a real app, this would fetch from a client list
  // For now, we'll need the client UID to be provided
  useEffect(() => {
    // TODO: Fetch list of assigned clients from coach profile or Firestore
    // For now, provide a way to input client UID
  }, [user?.uid])

  async function handleClientSelect(clientUid) {
    if (!user?.uid) return
    setSelectedClient(clientUid)
    setLoading(true)

    try {
      // Get plans assigned by this coach to this client
      const assigned = await getCoachAssignedPlans(user.uid, clientUid)
      setAssignedPlans(assigned)

      // Fetch progress for each plan
      const progressData = {}
      for (const plan of assigned) {
        const p = await getClientPlanProgress(clientUid, plan.id)
        if (p) progressData[plan.id] = p
      }
      setProgress(progressData)
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAssignPlan(planId) {
    if (!selectedClient || !user?.uid) return

    try {
      const success = await assignPlanToClient(user.uid, selectedClient, planId)
      if (success) {
        // Reload plans
        await handleClientSelect(selectedClient)
        alert('Plan assigned successfully!')
      } else {
        alert('Error assigning plan')
      }
    } catch (error) {
      console.error('Error assigning plan:', error)
      alert('Error assigning plan')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-fit-bg2/50 border border-fit-line/50 p-6">
        <h2 className="text-lg font-bold text-fit-ink mb-4 flex items-center gap-2">
          <Dumbbell size={20} className="text-fit-accent" />
          Plan-Zuweisung
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-fit-dim uppercase mb-2">
              Klienten-UID eingeben
            </label>
            <input
              type="text"
              placeholder="z.B. 59ole36uNpNwml5H6VDYCXyCME92"
              value={selectedClient || ''}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-fit-bg border border-fit-line rounded-lg px-4 py-2 text-sm font-bold text-fit-ink focus:border-fit-accent outline-none"
            />
            <button
              onClick={() => handleClientSelect(selectedClient)}
              disabled={!selectedClient}
              className="mt-3 w-full btn btn-primary py-2 text-xs font-bold uppercase"
            >
              Pläne laden
            </button>
          </div>
        </div>
      </div>

      {selectedClient && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
            </div>
          ) : assignedPlans.length === 0 ? (
            <div className="text-center py-12 text-fit-dim text-xs opacity-50">
              <Dumbbell size={32} className="mx-auto mb-2 opacity-30" />
              <p>Keine Pläne zugewiesen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedPlans.map(plan => {
                const p = progress[plan.id]
                return (
                  <div
                    key={plan.id}
                    className="rounded-lg bg-fit-bg2/50 border border-fit-line/50 p-4 hover:bg-fit-bg2/80 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-fit-ink">
                          {plan.name || 'Unnamed Plan'}
                        </h3>
                        <p className="text-xs text-fit-dim mt-1">
                          {plan.exercises?.length || 0} Übungen
                        </p>
                      </div>
                      {p && (
                        <div className="text-right">
                          <div className="text-sm font-bold text-fit-accent">
                            {p.completionPercentage}%
                          </div>
                          <p className="text-xs text-fit-dim">
                            {p.doneExercises}/{p.totalExercises}
                          </p>
                        </div>
                      )}
                    </div>

                    {p && (
                      <div className="h-1.5 bg-fit-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-fit-accent transition-all"
                          style={{ width: `${p.completionPercentage}%` }}
                        />
                      </div>
                    )}

                    {p && p.lastUpdate && (
                      <p className="text-xs text-fit-dim mt-2">
                        Zuletzt aktualisiert: {new Date(p.lastUpdate).toLocaleString('de-DE')}
                      </p>
                    )}
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
