import { useState, useEffect } from 'react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { Activity, Moon, Footprints, Heart, Scale } from 'lucide-react'
import { getBodyEntries } from '@db'

function fmt(dateStr) {
  const [, m, d] = dateStr.split('-')
  return `${d}.${m}`
}

export default function HealthWidget({ days = 14 }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBodyEntries(days)
      .then(data => {
        const sorted = (data || [])
          .sort((a, b) => a.date > b.date ? 1 : -1)
          .map(e => ({ ...e, label: fmt(e.date) }))
        setEntries(sorted)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return <div className="animate-pulse h-32 bg-fit-bg2 rounded-2xl" />
  if (entries.length === 0) return null

  const latest = entries[entries.length - 1]
  const weights = entries.filter(e => e.weight_kg).map(e => e.weight_kg)
  const minW = Math.floor(Math.min(...weights)) - 1
  const maxW = Math.ceil(Math.max(...weights)) + 1

  return (
    <div className="card p-6 shadow-xl bg-gradient-to-br from-card to-bg2 border-fit-accent/10">
      <div className="flex items-center gap-2 mb-6">
        <Heart size={16} className="text-fit-accent" />
        <span className="label-caps !mb-0">Health & Vitals</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Weight / Scale */}
        <div className="bg-fit-bg2 p-4 rounded-xl border border-fit-line relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-2 text-fit-dim">
            <Scale size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Gewicht</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-fit-ink">{latest.weight_kg || '—'}</span>
            <span className="text-xs font-bold text-fit-dim">kg</span>
          </div>
          {weights.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-10 opacity-30 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={entries}>
                  <YAxis domain={[minW, maxW]} hide />
                  <Line type="monotone" dataKey="weight_kg" stroke="var(--accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sleep */}
        <div className="bg-fit-bg2 p-4 rounded-xl border border-fit-line">
          <div className="flex items-center gap-2 mb-2 text-fit-dim">
            <Moon size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Schlaf</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-fit-ink">{latest.sleep_h || '—'}</span>
            <span className="text-xs font-bold text-fit-dim">h</span>
          </div>
          {latest.sleep_score && (
            <div className="text-[9px] font-black text-fit-accent mt-1 tracking-widest uppercase">
              Score: {latest.sleep_score}
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="bg-fit-bg2 p-4 rounded-xl border border-fit-line">
          <div className="flex items-center gap-2 mb-2 text-fit-dim">
            <Footprints size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Schritte</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-fit-ink">{latest.steps ? (latest.steps / 1000).toFixed(1) : '—'}</span>
            <span className="text-xs font-bold text-fit-dim">k</span>
          </div>
        </div>

        {/* Resting HR */}
        <div className="bg-fit-bg2 p-4 rounded-xl border border-fit-line">
          <div className="flex items-center gap-2 mb-2 text-fit-dim">
            <Activity size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Ruhepuls</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-fit-ink">{latest.resting_hr || '—'}</span>
            <span className="text-xs font-bold text-fit-dim">bpm</span>
          </div>
        </div>
      </div>
    </div>
  )
}
