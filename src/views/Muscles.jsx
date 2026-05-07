import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import BodyMap, { GROUP_COLORS, GROUP_LABELS } from '../components/BodyMap.jsx'
import { api } from '../api.js'

const DAYS_OPTIONS = [7, 14, 28]

export default function Muscles() {
  const [days, setDays]           = useState(7)
  const [groups, setGroups]       = useState([])
  const [gaps, setGaps]           = useState([])
  const [groupScores, setGroupScores] = useState({})
  const [loading, setLoading]     = useState(false)
  const [popup, setPopup]         = useState(null)   // { groupId, exercises }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/coverage/detailed?days=${days}`),
      api.get(`/coverage/gaps?days=${days}`),
    ]).then(([cov, gap]) => {
      const gs = {}
      if (cov?.ok) {
        setGroups(cov.groups || [])
        for (const g of (cov.groups || [])) {
          const total = g.muscles.reduce((s, m) => s + (m.totalScore || 0), 0)
          gs[g.id] = { score: total, avg: total / Math.max(g.muscles.length, 1) }
        }
      }
      setGroupScores(gs)
      if (gap?.ok) setGaps(gap.gaps || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [days])

  async function openPopup(groupId) {
    setPopup({ groupId, exercises: null })
    try {
      const r = await api.get(`/exercises/by-group?group=${groupId}`)
      setPopup({ groupId, exercises: r?.exercises || [] })
    } catch {
      setPopup({ groupId, exercises: [] })
    }
  }

  const overallMax = Math.max(...groups.map(g => groupScores[g.id]?.score || 0), 1)

  return (
    <div>
      {/* Days picker */}
      <div className="flex gap-2 mb-4">
        {DAYS_OPTIONS.map(d => (
          <button key={d} onClick={() => setDays(d)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: days === d ? 'var(--accent)' + '20' : 'var(--card)',
              color: days === d ? 'var(--accent)' : 'var(--muted)',
              border: `1px solid ${days === d ? 'var(--accent)' + '66' : 'var(--line)'}`,
            }}>
            {d}d
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Body Map */}
        <div className="flex flex-col items-center pt-2 shrink-0">
          {loading
            ? <div style={{ width: 120, height: 264 }} className="flex items-center justify-center"><span className="spinner" /></div>
            : <BodyMap groupScores={groupScores} onGroupClick={openPopup} />
          }
          <p className="text-[9px] mt-2 text-center" style={{ color: 'var(--dim)' }}>Tippen = Details</p>
        </div>

        {/* Coverage bars */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {groups.map(g => {
            const score = groupScores[g.id]?.score || 0
            const pct   = overallMax > 0 ? (score / overallMax) * 100 : 0
            const color = GROUP_COLORS[g.id] || 'var(--accent)'
            const isGap = gaps.some(gap => gap.name === g.id)
            return (
              <button key={g.id} onClick={() => openPopup(g.id)}
                className="w-full text-left p-2 rounded-xl transition-colors"
                style={{ background: 'var(--card)', border: `1px solid ${isGap ? 'var(--red)' + '40' : 'var(--line)'}` }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: isGap ? 'var(--red)' : 'var(--ink)' }}>
                    {GROUP_LABELS[g.id] || g.id}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>
                    {score > 0 ? `${score.toFixed(1)}×` : '—'}
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: isGap ? 'var(--red)' : color }} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Muscle group popup */}
      {popup && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setPopup(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 max-w-[90vw] rounded-2xl p-5"
            style={{ background: 'var(--panel)', border: `1px solid ${GROUP_COLORS[popup.groupId] || 'var(--accent)'}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold" style={{ color: GROUP_COLORS[popup.groupId] || 'var(--accent)' }}>
                {GROUP_LABELS[popup.groupId] || popup.groupId}
              </h3>
              <button onClick={() => setPopup(null)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            {popup.exercises === null ? (
              <div className="flex justify-center py-4"><span className="spinner" /></div>
            ) : popup.exercises.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Keine Übungen gefunden</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {popup.exercises.slice(0, 8).map((ex, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
                    <span className="text-sm" style={{ color: 'var(--ink)' }}>{ex.name_en}</span>
                    <span className="text-[10px] font-bold uppercase"
                      style={{ color: ex.relevance === 'primary' ? 'var(--green)' : 'var(--muted)' }}>
                      {ex.relevance === 'primary' ? 'P' : 'S'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
