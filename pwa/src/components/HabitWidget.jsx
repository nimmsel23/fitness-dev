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

export default function HabitWidget({ onNavigate }) {
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

  return (
    <div className="card mb-0 shadow-lg border-line/40">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="label-caps !mb-0 flex items-center gap-2">
           <Check size={14} className="text-green" />
           Habits (heute)
        </div>
        <button onClick={() => onNavigate?.('habits')} className="text-[10px] font-black uppercase tracking-widest text-accent hover:opacity-70 transition-opacity">
           Manage
        </button>
      </div>

      {loading && <div className="py-4 flex justify-center opacity-20"><div className="spinner" /></div>}

      <div className="space-y-2">
        {habits.slice(0, 4).map(h => {
          const done = todayCompletion(h, todayEpochDay) === 'DONE'
          return (
            <div key={h.uuid} className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all ${done ? 'bg-green/10 border-green/20' : 'bg-bg2 border-line hover:border-dim'}`}>
              <span className={`font-bold text-xs ${done ? 'text-green' : 'text-ink'}`}>{h.name}</span>
              <div className="flex items-center gap-2">
                {done ? (
                  <div className="w-6 h-6 rounded-full bg-green text-black flex items-center justify-center">
                    <Check size={14} className="stroke-[4]" />
                  </div>
                ) : (
                  <button onClick={() => checkIn(h.uuid)} className="btn btn-primary !py-1 !px-3 !text-[10px] !rounded-lg uppercase tracking-widest shadow-none">Done</button>
                )}
              </div>
            </div>
          )
        })}
        {habits.length === 0 && !loading && (
          <p className="text-center py-4 text-[10px] font-black uppercase opacity-20 tracking-widest">Keine Habits aktiv</p>
        )}
      </div>
    </div>
  )
}
