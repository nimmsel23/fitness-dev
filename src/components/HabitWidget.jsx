import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'

function epochDayNow() {
  return Math.floor(Date.now() / 86400000)
}

function todayCompletion(habit, todayEpochDay) {
  const rec = (habit?.records || []).find(r => r.epochDay === todayEpochDay)
  return rec?.completion || 'MISSED'
}

function compactStatusLabel(completion) {
  if (completion === 'DONE') return 'Done'
  if (completion === 'PARTIAL') return 'Partial'
  return 'Missed'
}

export default function HabitWidget() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const todayEpochDay = useMemo(() => epochDayNow(), [])

  useEffect(() => {
    let alive = true

    async function load() {
      setLoading(true)
      setErr('')
      try {
        const res = await fetch(`/habitsync/habits`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!alive) return
        setHabits(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!alive) return
        setErr('Habits nicht erreichbar')
        setHabits([])
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    load()
    return () => { alive = false }
  }, [])

  async function checkIn(uuid) {
    // Optimistic update: mark as DONE for today locally.
    setHabits(prev => prev.map(h => {
      if (h.uuid !== uuid) return h
      const records = Array.isArray(h.records) ? [...h.records] : []
      const i = records.findIndex(r => r.epochDay === todayEpochDay)
      const nextRec = { epochDay: todayEpochDay, recordValue: 1.0, completion: 'DONE' }
      if (i >= 0) records[i] = { ...records[i], ...nextRec }
      else records.push(nextRec)
      return { ...h, records }
    }))

    try {
      const res = await fetch(`/habitsync/record/${encodeURIComponent(uuid)}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch {
      // Revert on failure.
      setHabits(prev => prev.map(h => {
        if (h.uuid !== uuid) return h
        const records = (h.records || []).filter(r => r.epochDay !== todayEpochDay)
        return { ...h, records }
      }))
      setErr('Check-in fehlgeschlagen')
      setTimeout(() => setErr(''), 1800)
    }
  }

  return (
    <div className="mb-4">
      <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
        Habits (heute)
      </div>

      {loading && (
        <div className="text-sm" style={{ color: 'var(--dim)' }}>Lade…</div>
      )}

      {!loading && err && (
        <div className="text-sm" style={{ color: 'var(--red)' }}>{err}</div>
      )}

      <div className="flex flex-col gap-2">
        {habits.map(h => {
          const completion = todayCompletion(h, todayEpochDay)
          const done = completion === 'DONE'
          return (
            <div
              key={h.uuid}
              className="p-3 rounded-2xl flex items-center justify-between"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--line)',
                borderLeft: done ? '3px solid var(--green)' : '3px solid transparent',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
                  {h.name || 'Habit'}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: done ? 'var(--green)' : 'var(--dim)' }}>
                  {compactStatusLabel(completion)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {done ? (
                  <div className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: 'var(--green)' }}>
                    <Check size={16} />
                  </div>
                ) : (
                  <button
                    onClick={() => checkIn(h.uuid)}
                    className="text-xs px-3 py-2 rounded-xl border font-semibold"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}
                  >
                    Abhaken
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
