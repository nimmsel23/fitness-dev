import { useState, useEffect } from 'react'
import { Dumbbell, Sparkles, Send } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import {
  getAllUserProfiles,
  getCoachAssignedPlans,
  assignPlanToClient,
  getClientPlanProgress,
  getPlanSuggestion,
} from '@db'

const TEMPLATES = [
  { id: 'push_day', label: 'Push' },
  { id: 'pull_day', label: 'Pull' },
  { id: 'legs_day', label: 'Legs' },
  { id: 'full_body', label: 'Full Body' },
]

export default function AssignPlan() {
  const { user } = useUser()
  const [profiles, setProfiles] = useState({})
  const [selectedClient, setSelectedClient] = useState('')
  const [assignedPlans, setAssignedPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({})

  const [template, setTemplate] = useState('full_body')
  const [builtPlan, setBuiltPlan] = useState(null)
  const [building, setBuilding] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [pushState, setPushState] = useState('')

  useEffect(() => {
    getAllUserProfiles().then(setProfiles).catch(() => setProfiles({}))
  }, [])

  async function loadClientPlans(clientUid) {
    if (!user?.uid || !clientUid) return
    setSelectedClient(clientUid)
    setLoading(true)

    try {
      const assigned = await getCoachAssignedPlans(user.uid, clientUid)
      setAssignedPlans(assigned)

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

  async function buildPlan() {
    setBuilding(true)
    try {
      const data = await getPlanSuggestion({ template, goal: 'hypertrophy' })
      setBuiltPlan(data)
    } catch {
      setBuiltPlan(null)
    } finally {
      setBuilding(false)
    }
  }

  async function pushPlan() {
    if (!selectedClient || !user?.uid || !builtPlan) return
    setPushing(true)
    setPushState('')

    try {
      const success = await assignPlanToClient(user.uid, selectedClient, builtPlan)
      if (success) {
        setPushState('Plan zugewiesen')
        setBuiltPlan(null)
        await loadClientPlans(selectedClient)
      } else {
        setPushState('Fehler beim Zuweisen')
      }
    } catch (error) {
      console.error('Error assigning plan:', error)
      setPushState('Fehler beim Zuweisen')
    } finally {
      setPushing(false)
      setTimeout(() => setPushState(''), 2600)
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
              Klient auswählen
            </label>
            <select
              value={selectedClient}
              onChange={(e) => loadClientPlans(e.target.value)}
              className="w-full bg-fit-bg border border-fit-line rounded-lg px-4 py-2 text-sm font-bold text-fit-ink focus:border-fit-accent outline-none"
            >
              <option value="">Klient wählen…</option>
              {Object.values(profiles).map(p => (
                <option key={p.uid} value={p.uid}>{p.displayName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedClient && (
        <div className="rounded-lg bg-fit-bg2/50 border border-fit-line/50 p-6">
          <h3 className="text-sm font-bold text-fit-ink mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-fit-accent" />
            Neuen Plan bauen + zuweisen
          </h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                  template === t.id
                    ? 'bg-fit-accent text-black'
                    : 'bg-fit-bg border border-fit-line text-fit-dim hover:text-fit-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={buildPlan}
            disabled={building}
            className="w-full btn btn-primary py-2 text-xs font-bold uppercase mb-3"
          >
            {building ? 'Baue Plan…' : 'Plan bauen'}
          </button>

          {builtPlan && (
            <div className="rounded-lg bg-fit-bg border border-fit-line/50 p-4 mb-3">
              <p className="text-xs text-fit-dim mb-2">
                {builtPlan.exercises?.length || 0} Übungen · {template}
              </p>
              <button
                onClick={pushPlan}
                disabled={pushing}
                className="w-full btn btn-primary py-2 text-xs font-bold uppercase flex items-center justify-center gap-2"
              >
                <Send size={14} />
                {pushing ? 'Wird zugewiesen…' : 'An Klient pushen'}
              </button>
              {pushState && <p className="text-xs text-fit-dim mt-2 text-center">{pushState}</p>}
            </div>
          )}
        </div>
      )}

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
