import { useState, useEffect } from 'react'
import { Zap, TrendingUp, AlertCircle, Download } from 'lucide-react'
import { api, localToday, getWeekDates, downloadText } from '../api.js'
import HabitWidget from '../components/HabitWidget.jsx'

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

const BLOCK_COLORS = {
  push:  '#f472b6',
  pull:  '#34d399',
  legs:  '#fb923c',
  upper: '#38bdf8',
  lower: '#a78bfa',
  full:  '#fbbf24',
}

function blockColor(block) {
  if (!block) return null
  for (const [key, color] of Object.entries(BLOCK_COLORS)) {
    if (block.toLowerCase().includes(key)) return color
  }
  return 'var(--accent)'
}

export default function Dashboard({ onOpenSession, onInspectExercise, onOpenReview }) {
  const [hint, setHint] = useState(null)
  const [weekData, setWeekData] = useState([])
  const [lastSession, setLastSession] = useState(null)
  const [coverage, setCoverage] = useState(null)
  const [exportToast, setExportToast] = useState('')

  useEffect(() => {
    const today = localToday()

    api.get(`/plan/today?date=${today}`).then(d => {
      if (d?.suggestion) setHint(d.suggestion)
    }).catch(() => {})

    api.get('/session/latest').then(d => {
      if (d?.ok) setLastSession(d.session)
    }).catch(() => {})

    api.get('/coverage/gaps?days=7').then(d => {
      if (d?.ok) setCoverage(d.gaps || [])
    }).catch(() => {})

    const dates = getWeekDates()
    Promise.all(dates.map(date =>
      api.get(`/session?date=${date}`)
        .then(d => ({ date, block: d?.data?.block || '', exCount: (d?.data?.exercises || []).length }))
        .catch(() => ({ date, block: '', exCount: 0 }))
    )).then(setWeekData)
  }, [])

  const today = localToday()

  async function exportCsv(days) {
    try {
      const d = await api.get(`/export/csv?days=${days}`)
      if (!d?.csv) throw new Error('no csv')
      downloadText(d.filename || `fitness-${days}d.csv`, d.csv, 'text/csv;charset=utf-8')
      setExportToast(`Export: ${days} Tage`)
      setTimeout(() => setExportToast(''), 1800)
    } catch {
      setExportToast('Export fehlgeschlagen')
      setTimeout(() => setExportToast(''), 1800)
    }
  }

  function openPlanAsSession() {
    if (!hint?.block) return
    onOpenSession?.(today, {
      block: hint.block,
      exercises: (hint.exercises || []).map((name, idx, arr) => ({
        name,
        id: '',
        primaryMuscles: [],
        secondaryMuscles: [],
        sets: '',
        reps: '',
        weight: '',
        note: idx === arr.length - 1 ? 'Finisher' : '',
        isHIT: false,
        isFinisher: idx === arr.length - 1,
        done: false,
      })),
    })
  }

  return (
    <div>
      {/* Exports */}
      <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Export (CSV)</div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={() => onOpenReview?.()}
              className="text-xs px-3 py-2 rounded-xl border font-semibold flex items-center gap-2"
              style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}
            >
              Review
            </button>
            <button
              onClick={() => exportCsv(7)}
              className="text-xs px-3 py-2 rounded-xl border font-semibold flex items-center gap-2"
              style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}
            >
              <Download size={14} /> 7 Tage
            </button>
            <button
              onClick={() => exportCsv(14)}
              className="text-xs px-3 py-2 rounded-xl border font-semibold flex items-center gap-2"
              style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}
            >
              <Download size={14} /> 14 Tage
            </button>
          </div>
        </div>
      </div>
      {/* Week heatmap */}
      <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Diese Woche</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {getWeekDates().map((date, i) => {
            const item = weekData.find(w => w.date === date)
            const done = !!item?.block
            const isToday = date === today
            const color = done ? blockColor(item.block) : null
            return (
              <div key={date} className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => done && onOpenSession?.(date)}
                  className="w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all"
                  style={{
                    background: done ? (color + '33') : 'var(--bg2)',
                    border: isToday ? `1.5px solid ${color || 'var(--accent)'}` : '1.5px solid transparent',
                    color: done ? color : 'var(--dim)',
                    cursor: done ? 'pointer' : 'default',
                  }}
                >
                  {done ? '✓' : '·'}
                </button>
                <span className="text-[9px] font-semibold" style={{ color: isToday ? 'var(--accent)' : 'var(--dim)' }}>
                  {DAY_LABELS[i]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Last sessions (7d) */}
      {weekData.some(w => w.block) && (
        <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Letzte Sessions</h3>
          <div className="flex flex-col gap-2">
            {weekData
              .filter(w => w.block)
              .slice()
              .sort((a, b) => a.date < b.date ? 1 : -1)
              .map(w => (
                <button
                  key={w.date}
                  type="button"
                  onClick={() => onOpenSession?.(w.date)}
                  className="w-full text-left px-3 py-2 rounded-xl"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--line)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                      {w.date}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: blockColor(w.block) || 'var(--accent)' }}>
                      {w.block}
                    </div>
                  </div>
                  {w.exCount > 0 && (
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                      {w.exCount} Übungen
                    </div>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Today hint */}
      {hint && (
        <div className="mb-4 p-4 rounded-2xl" style={{ background: 'linear-gradient(180deg, var(--card), var(--bg2))', border: '1px solid var(--line)' }}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Zap size={15} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Plan-Entwurf</span>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--dim)' }}>
              {today}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="font-extrabold text-lg" style={{ color: 'var(--ink)' }}>{hint.block}</div>
            <button
              type="button"
              onClick={openPlanAsSession}
              className="text-xs px-3 py-2 rounded-xl font-semibold"
              style={{ background: 'rgba(94,234,212,0.12)', border: '1px solid rgba(94,234,212,0.28)', color: 'var(--accent)' }}
            >
              Plan in Session übernehmen
            </button>
          </div>
          {hint.exercises?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hint.exercises.slice(0, 6).map((e, idx, arr) => (
                <span
                  key={e}
                  className="text-xs px-2 py-0.5 rounded-lg"
                  style={{ background: idx === arr.length - 1 ? 'rgba(245,158,11,0.12)' : 'var(--bg2)', color: idx === arr.length - 1 ? '#f59e0b' : 'var(--muted)' }}
                >
                  {e}{idx === arr.length - 1 ? ' · Finisher' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gaps */}
      {coverage !== null && (
        <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Coverage (7 Tage)</span>
          </div>
          {coverage.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--green)' }}>✓ Alle Muskelgruppen abgedeckt</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {coverage.map(g => (
                <span key={g.name} className="text-xs px-2 py-0.5 rounded-lg flex items-center gap-1"
                  style={{ background: 'var(--red)' + '22', color: 'var(--red)' }}>
                  <AlertCircle size={10} />
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Habits */}
      <HabitWidget />

      {/* Last session */}
          {lastSession && (
        <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
            Letztes Training — {lastSession.date}
          </h3>
          {lastSession.data?.block && (
            <div className="font-semibold mb-2" style={{ color: blockColor(lastSession.data.block) || 'var(--accent)' }}>
              {lastSession.data.block}
            </div>
          )}
          <div className="flex flex-col gap-1">
            {(lastSession.data?.exercises || []).slice(0, 5).map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onInspectExercise?.(ex)}
                className="flex items-center justify-between text-sm text-left px-2 py-1 rounded-lg"
                style={{ color: 'var(--ink)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span>{ex.name}</span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {ex.sets}×{ex.reps}{ex.weight ? ` @ ${ex.weight}kg` : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {exportToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium shadow-xl z-50"
          style={{ background: 'var(--card)', color: 'var(--accent)', border: '1px solid var(--line)' }}>
          {exportToast}
        </div>
      )}
    </div>
  )
}
