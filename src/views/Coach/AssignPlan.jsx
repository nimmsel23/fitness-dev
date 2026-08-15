import { useState, useEffect } from 'react'
import { Dumbbell, Plus, Save, Trash2, ChevronDown, X } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import {
  getAllUserProfiles,
  listMacrocycles,
  getMacrocycle,
  createMacrocycle,
  updateMacrocycleWeeks,
  deleteMacrocycle,
} from '@db'
import ExerciseSearch from '../Plan/components/ExerciseSearch.jsx'

const DAYS = [
  ['mo', 'Mo'], ['di', 'Di'], ['mi', 'Mi'], ['do', 'Do'],
  ['fr', 'Fr'], ['sa', 'Sa'], ['so', 'So'],
]

export default function AssignPlan() {
  const { user } = useUser()
  const [profiles, setProfiles] = useState({})
  const [selectedClient, setSelectedClient] = useState('')
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(false)

  const [activeCycle, setActiveCycle] = useState(null) // volles Objekt inkl. weeks
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openDay, setOpenDay] = useState(null) // `${weekIdx}:${dayKey}`
  const [newName, setNewName] = useState('')
  const [newWeeks, setNewWeeks] = useState(10)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    getAllUserProfiles().then(setProfiles).catch(() => setProfiles({}))
  }, [])

  async function selectClient(clientUid) {
    setSelectedClient(clientUid)
    setActiveCycle(null)
    setOpenDay(null)
    if (!clientUid) { setCycles([]); return }
    setLoading(true)
    try {
      setCycles(await listMacrocycles(clientUid))
    } finally {
      setLoading(false)
    }
  }

  async function openCycle(cycleId) {
    setLoading(true)
    setOpenDay(null)
    try {
      const full = await getMacrocycle(selectedClient, cycleId)
      setActiveCycle(full)
      setDirty(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newName.trim() || !user?.uid || !selectedClient) return
    setCreating(true)
    try {
      const created = await createMacrocycle(selectedClient, {
        name: newName.trim(),
        coachUid: user.uid,
        weeks: Number(newWeeks) || 1,
      })
      if (created) {
        setNewName('')
        setCycles(await listMacrocycles(selectedClient))
        setActiveCycle(created)
        setDirty(false)
      }
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(cycleId) {
    await deleteMacrocycle(selectedClient, cycleId)
    setCycles(await listMacrocycles(selectedClient))
    if (activeCycle?.id === cycleId) setActiveCycle(null)
  }

  async function handleSave() {
    if (!activeCycle) return
    setSaving(true)
    try {
      const saved = await updateMacrocycleWeeks(selectedClient, activeCycle.id, activeCycle.weeks)
      if (saved) {
        setActiveCycle(saved)
        setDirty(false)
        setCycles(await listMacrocycles(selectedClient))
      }
    } finally {
      setSaving(false)
    }
  }

  function updateDay(weekIdx, dayKey, updater) {
    setActiveCycle(prev => {
      const weeks = prev.weeks.map((w, i) => {
        if (i !== weekIdx) return w
        const current = w.days[dayKey] || { label: '', exercises: [] }
        return { ...w, days: { ...w.days, [dayKey]: updater(current) } }
      })
      return { ...prev, weeks }
    })
    setDirty(true)
  }

  function addExerciseToDay(weekIdx, dayKey, ex) {
    updateDay(weekIdx, dayKey, (day) => ({
      ...day,
      exercises: [...(day.exercises || []), { exercise_id: ex.id, name: ex.name, sets: 3, reps: '8-12' }],
    }))
  }

  function removeExerciseFromDay(weekIdx, dayKey, idx) {
    updateDay(weekIdx, dayKey, (day) => ({
      ...day,
      exercises: day.exercises.filter((_, i) => i !== idx),
    }))
  }

  function updateExerciseField(weekIdx, dayKey, idx, field, value) {
    updateDay(weekIdx, dayKey, (day) => ({
      ...day,
      exercises: day.exercises.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex),
    }))
  }

  function updateDayLabel(weekIdx, dayKey, label) {
    updateDay(weekIdx, dayKey, (day) => ({ ...day, label, exercises: day.exercises || [] }))
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-fit-bg2/50 border border-fit-line/50 p-6">
        <h2 className="text-lg font-bold text-fit-ink mb-4 flex items-center gap-2">
          <Dumbbell size={20} className="text-fit-accent" />
          Makrozyklen
        </h2>
        <label className="block text-xs font-bold text-fit-dim uppercase mb-2">Klient auswählen</label>
        <select
          value={selectedClient}
          onChange={(e) => selectClient(e.target.value)}
          className="w-full bg-fit-bg border border-fit-line rounded-lg px-4 py-2 text-sm font-bold text-fit-ink focus:border-fit-accent outline-none"
        >
          <option value="">Klient wählen…</option>
          {Object.values(profiles).map(p => (
            <option key={p.uid} value={p.uid}>{p.displayName}</option>
          ))}
        </select>
      </div>

      {selectedClient && !activeCycle && (
        <>
          <div className="rounded-lg bg-fit-bg2/50 border border-fit-line/50 p-6">
            <h3 className="text-sm font-bold text-fit-ink mb-3">Neuer Makrozyklus</h3>
            <div className="flex flex-wrap gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="z.B. 10-Wochen Hypertrophie-Block"
                className="flex-1 min-w-[200px] bg-fit-bg border border-fit-line rounded-lg px-3 py-2 text-sm text-fit-ink focus:border-fit-accent outline-none"
              />
              <input
                type="number"
                min={1}
                max={52}
                value={newWeeks}
                onChange={(e) => setNewWeeks(e.target.value)}
                className="w-24 bg-fit-bg border border-fit-line rounded-lg px-3 py-2 text-sm text-fit-ink focus:border-fit-accent outline-none"
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="btn btn-primary px-4 py-2 text-xs font-bold uppercase flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus size={14} /> Anlegen
              </button>
            </div>
            <p className="text-xs text-fit-dim mt-2">Anzahl Wochen — danach Woche für Woche, Tag für Tag frei bestücken.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
            </div>
          ) : cycles.length === 0 ? (
            <div className="text-center py-12 text-fit-dim text-xs opacity-50">
              <Dumbbell size={32} className="mx-auto mb-2 opacity-30" />
              <p>Noch kein Makrozyklus für diesen Klienten</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cycles.map(c => (
                <div
                  key={c.id}
                  className="rounded-lg bg-fit-bg2/50 border border-fit-line/50 p-4 flex items-center justify-between hover:bg-fit-bg2/80 transition-colors cursor-pointer"
                  onClick={() => openCycle(c.id)}
                >
                  <div>
                    <h3 className="font-bold text-sm text-fit-ink">{c.name}</h3>
                    <p className="text-xs text-fit-dim mt-1">{c.weekCount} Wochen · angelegt {new Date(c.createdAt).toLocaleDateString('de-DE')}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id) }}
                    className="p-2 text-fit-dim hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeCycle && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setActiveCycle(null); setDirty(false) }}
              className="text-xs font-bold text-fit-dim hover:text-fit-ink uppercase"
            >
              ← Zurück
            </button>
            <div className="flex items-center gap-2">
              {dirty && <span className="text-xs text-fit-accent font-bold">Ungespeichert</span>}
              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="btn btn-primary px-4 py-2 text-xs font-bold uppercase flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save size={14} /> {saving ? 'Speichert…' : 'Speichern'}
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-fit-bg2/50 border border-fit-line/50 p-4">
            <h3 className="font-bold text-fit-ink">{activeCycle.name}</h3>
            <p className="text-xs text-fit-dim mt-1">{activeCycle.weeks.length} Wochen</p>
          </div>

          <div className="space-y-3">
            {activeCycle.weeks.map((week, weekIdx) => (
              <div key={week.weekNr} className="rounded-lg bg-fit-bg2/50 border border-fit-line/50 overflow-hidden">
                <div className="px-4 py-2.5 bg-fit-bg/50 border-b border-fit-line/30">
                  <span className="text-xs font-black uppercase text-fit-accent">Woche {week.weekNr}</span>
                </div>
                <div className="grid grid-cols-7 divide-x divide-fit-line/20">
                  {DAYS.map(([dayKey, dayLabel]) => {
                    const day = week.days[dayKey]
                    const isOpen = openDay === `${weekIdx}:${dayKey}`
                    return (
                      <button
                        key={dayKey}
                        onClick={() => setOpenDay(isOpen ? null : `${weekIdx}:${dayKey}`)}
                        className={`p-2 text-center transition-colors ${isOpen ? 'bg-fit-accent/10' : 'hover:bg-fit-bg/50'}`}
                      >
                        <div className="text-[10px] font-black uppercase text-fit-dim">{dayLabel}</div>
                        <div className={`text-xs font-bold mt-0.5 truncate ${day ? 'text-fit-ink' : 'text-fit-dim/40'}`}>
                          {day?.label || (day?.exercises?.length ? `${day.exercises.length} Üb.` : '—')}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {DAYS.map(([dayKey]) => {
                  if (openDay !== `${weekIdx}:${dayKey}`) return null
                  const day = week.days[dayKey] || { label: '', exercises: [] }
                  return (
                    <div key={dayKey} className="p-4 border-t border-fit-line/30 bg-fit-bg/30 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          value={day.label || ''}
                          onChange={(e) => updateDayLabel(weekIdx, dayKey, e.target.value)}
                          placeholder="Tagesbezeichnung, z.B. Push"
                          className="flex-1 bg-fit-bg border border-fit-line rounded-lg px-3 py-1.5 text-xs font-bold text-fit-ink focus:border-fit-accent outline-none"
                        />
                        <button
                          onClick={() => setOpenDay(null)}
                          className="p-1.5 text-fit-dim hover:text-fit-ink"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      {(day.exercises || []).length > 0 && (
                        <div className="space-y-2">
                          {day.exercises.map((ex, exIdx) => (
                            <div key={exIdx} className="flex items-center gap-2 bg-fit-bg2/50 rounded-lg px-3 py-2">
                              <span className="flex-1 text-xs font-bold text-fit-ink truncate">{ex.name}</span>
                              <input
                                type="number"
                                value={ex.sets}
                                onChange={(e) => updateExerciseField(weekIdx, dayKey, exIdx, 'sets', Number(e.target.value))}
                                className="w-12 bg-fit-bg border border-fit-line rounded px-1.5 py-1 text-xs text-center text-fit-ink"
                                title="Sätze"
                              />
                              <span className="text-fit-dim text-xs">×</span>
                              <input
                                value={ex.reps}
                                onChange={(e) => updateExerciseField(weekIdx, dayKey, exIdx, 'reps', e.target.value)}
                                className="w-16 bg-fit-bg border border-fit-line rounded px-1.5 py-1 text-xs text-center text-fit-ink"
                                title="Wiederholungen"
                              />
                              <button
                                onClick={() => removeExerciseFromDay(weekIdx, dayKey, exIdx)}
                                className="p-1 text-fit-dim hover:text-red-400"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <ExerciseSearch
                        exclude={(day.exercises || []).map(e => e.exercise_id)}
                        onAdd={(ex) => addExerciseToDay(weekIdx, dayKey, ex)}
                      />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
