import { useEffect, useMemo, useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { getHabits, recordHabit, addHabit, deleteHabit } from '../db.js'

function epochDayNow() {
  return Math.floor(Date.now() / 86400000)
}

function todayCompletion(habit, todayEpochDay) {
  const rec = (habit?.records || []).find(r => r.epochDay === todayEpochDay)
  return rec?.completion || 'MISSED'
}

export default function HabitWidget() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [newHabit, setNewHabit] = useState('')
  const todayEpochDay = useMemo(() => epochDayNow(), [])

  async function load() {
    setLoading(true)
    const data = await getHabits()
    setHabits(data.filter(h => !h.deleted))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function checkIn(uuid) {
    await recordHabit(uuid)
    load()
  }

  async function handleAdd() {
    if (!newHabit.trim()) return
    await addHabit(newHabit.trim())
    setNewHabit('')
    load()
  }

  async function handleDelete(uuid) {
    await deleteHabit(uuid)
    load()
  }

  return (
    <div className="card">
      <div className="label-caps mb-3">Habits (heute)</div>

      <div className="flex gap-2 mb-4">
        <input type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)}
          placeholder="Neuer Habit..." className="flex-1" />
        <button onClick={handleAdd} className="btn btn-secondary"><Plus size={18} /></button>
      </div>

      {loading && <div className="text-sm text-dim">Lade...</div>}

      <div className="space-y-2">
        {habits.map(h => {
          const done = todayCompletion(h, todayEpochDay) === 'DONE'
          return (
            <div key={h.uuid} className={`p-3 rounded-xl flex items-center justify-between border ${done ? 'bg-green/10 border-green/20' : 'bg-bg2 border-line'}`}>
              <span className="font-semibold text-sm">{h.name}</span>
              <div className="flex items-center gap-2">
                {done ? (
                  <Check size={20} className="text-green" />
                ) : (
                  <button onClick={() => checkIn(h.uuid)} className="btn btn-primary py-1 px-3 text-xs">Check</button>
                )}
                <button onClick={() => handleDelete(h.uuid)} className="text-dim hover:text-red"><Trash2 size={16}/></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
