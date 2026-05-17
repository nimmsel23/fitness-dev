import { useEffect, useState } from 'react'
import { AlertCircle, BarChart3, CalendarDays, Download, Dumbbell, Sparkles, Target, TrendingUp } from 'lucide-react'
import { api } from '../api.js'

function formatVolume(value) {
  const num = Number(value || 0)
  return `${Math.round(num).toLocaleString('de-AT')} kg`
}

export default function WeeklyReview({ onOpenSession, onInspectExercise }) {
  const [week, setWeek] = useState('current')
  const [data, setData] = useState(null)
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    api.get('/fitness/config').then(d => {
      if (d?.ok) setConfig(d)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.get(`/fitness/weekly?week=${encodeURIComponent(week)}`)
      .then(d => setData(d || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [week])

  async function exportWeekly() {
    try {
      const result = await api.post('/fitness/export', {
        kind: 'weekly',
        week_selector: week,
        force: true,
      })
      setToast(result?.path ? `Export: ${result.path}` : 'Exportiert')
    } catch {
      setToast('Export fehlgeschlagen')
    }
    setTimeout(() => setToast(''), 2600)
  }

  const muscleEntries = Object.entries(data?.muscle_scores || {})
  const regionEntries = Object.entries(data?.body_region_scores || {})
  const missingRegions = data?.missing_regions || []
  const lowRegions = data?.low_regions || []
  const highRegions = data?.high_regions || []

  function openTopExercise(ex) {
    onInspectExercise?.({
      ...ex,
      name: ex.display_name || ex.exercise_id,
      displayName: ex.display_name || ex.exercise_id,
      category: ex.source_file ? ex.source_file.replace(/\.yml$/i, '') : 'Weekly Review',
      primaryMuscles: ex.primary_muscles || [],
      secondaryMuscles: ex.secondary_muscles || [],
      stabilizers: ex.stabilizers || [],
      variations: ex.variations || [],
      coachingNotes: ex.coaching_notes || [],
      commonErrors: ex.common_errors || [],
      tags: ex.tags || [],
      movementPattern: ex.movement_pattern || '',
      lesson: ex.lesson || null,
    })
  }

  return (
    <div className="space-y-4">
      <section className="p-4 rounded-2xl" style={{ background: 'linear-gradient(180deg, var(--card), var(--bg2))', border: '1px solid var(--line)' }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>
          <BarChart3 size={13} />
          Weekly Review
        </div>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
          Trainingswoche lesen, Lücken sehen, nach Obsidian exportieren
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>
          Die Review kommt aus der lokalen History und Coverage-Logik. Du siehst Sessions, Volumen, belastete Regionen und die nächsten Empfehlungen.
        </p>
      </section>

      <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Woche</div>
          <input
            value={week}
            onChange={e => setWeek(e.target.value)}
            placeholder="current oder 2026-W19"
            className="px-3 py-2 rounded-xl text-sm"
            style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}
          />
          <button
            onClick={() => setWeek('current')}
            className="px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}
          >
            current
          </button>
          <button
            onClick={exportWeekly}
            className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
            style={{ background: 'rgba(94,234,212,0.12)', border: '1px solid rgba(94,234,212,0.28)', color: 'var(--accent)' }}
          >
            <Download size={14} /> Export nach Obsidian
          </button>
        </div>
        {config?.exportPath && (
          <div className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
            Zielpfad: {config.exportPath}
          </div>
        )}
        {toast && (
          <div className="mt-3 text-sm" style={{ color: 'var(--accent)' }}>
            {toast}
          </div>
        )}
      </section>

      {loading ? (
        <div className="flex justify-center py-12"><span className="spinner" /></div>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
                <CalendarDays size={13} />
                Übersicht
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
                  <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>Sessions</div>
                  <div className="mt-1 text-2xl font-extrabold" style={{ color: 'var(--ink)' }}>{data.session_count || 0}</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
                  <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>Entries</div>
                  <div className="mt-1 text-2xl font-extrabold" style={{ color: 'var(--ink)' }}>{data.entries_count || 0}</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
                  <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>Volumen</div>
                  <div className="mt-1 text-lg font-bold" style={{ color: 'var(--accent)' }}>{formatVolume(data.total_volume)}</div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
                  <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>Woche</div>
                  <div className="mt-1 text-lg font-bold" style={{ color: 'var(--ink)' }}>{data.week || week}</div>
                </div>
              </div>
            </section>

            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
                <Sparkles size={13} />
                Empfehlungen
              </div>
              <div className="space-y-2">
                {(data.recommendations || []).map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
                    {rec}
                  </div>
                ))}
              </div>
              {data.workout_ids?.length > 0 && (
                <div className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
                  Workouts: {data.workout_ids.join(' · ')}
                </div>
              )}
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
                <TrendingUp size={13} />
                Regionen
              </div>
              <div className="space-y-2">
                {regionEntries.length ? regionEntries.map(([name, score]) => (
                  <div key={name} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--ink)' }}>{name}</span>
                    <span style={{ color: 'var(--accent)' }}>{Number(score).toFixed(1)}</span>
                  </div>
                )) : <p className="text-sm" style={{ color: 'var(--muted)' }}>Keine Regionenscores vorhanden.</p>}
              </div>
            </section>

            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
                <Target size={13} />
                Muskel-Scores
              </div>
              <div className="space-y-2">
                {muscleEntries.length ? muscleEntries.map(([name, score]) => (
                  <div key={name} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
                    <span style={{ color: 'var(--ink)' }}>{name}</span>
                    <span style={{ color: 'var(--accent)' }}>{Number(score).toFixed(1)}</span>
                  </div>
                )) : <p className="text-sm" style={{ color: 'var(--muted)' }}>Keine Muskel-Scores vorhanden.</p>}
              </div>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Missing</div>
              <div className="flex flex-wrap gap-2">
                {missingRegions.length ? missingRegions.map(region => (
                  <span key={region} className="text-xs px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--red)' }}>
                    {region}
                  </span>
                )) : <span className="text-sm" style={{ color: 'var(--muted)' }}>Keine Lücken</span>}
              </div>
            </section>
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Low</div>
              <div className="flex flex-wrap gap-2">
                {lowRegions.length ? lowRegions.map(region => (
                  <span key={region} className="text-xs px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(249,115,22,0.14)', color: 'var(--orange)' }}>
                    {region}
                  </span>
                )) : <span className="text-sm" style={{ color: 'var(--muted)' }}>Keine Low Regions</span>}
              </div>
            </section>
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>High</div>
              <div className="flex flex-wrap gap-2">
                {highRegions.length ? highRegions.map(region => (
                  <span key={region} className="text-xs px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--green)' }}>
                    {region}
                  </span>
                )) : <span className="text-sm" style={{ color: 'var(--muted)' }}>Keine High Regions</span>}
              </div>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
                <Dumbbell size={13} />
                Sessions
              </div>
              <div className="space-y-2">
                {(data.sessions || []).length ? data.sessions.map(session => (
                  <button
                    key={`${session.workout_id}-${session.date}`}
                    type="button"
                    onClick={() => onOpenSession?.(session.date)}
                    className="w-full text-left px-3 py-3 rounded-xl"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold" style={{ color: 'var(--ink)' }}>{session.date}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                          {session.workout_id} · {session.exercise_count} Entries
                        </div>
                      </div>
                      <div className="text-right text-xs" style={{ color: 'var(--muted)' }}>
                        {formatVolume(session.total_volume)}
                        <div>{session.avg_rpe ? `RPE ${session.avg_rpe}` : ''}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full"
                        style={{
                          background: session.done_ratio >= 1 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
                          color: session.done_ratio >= 1 ? 'var(--green)' : '#f59e0b',
                        }}>
                        {session.done_count || 0}/{session.exercise_count || 0} Done
                      </span>
                    </div>
                  </button>
                )) : <p className="text-sm" style={{ color: 'var(--muted)' }}>Keine Sessions in der Woche.</p>}
              </div>
            </section>

            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
                <BarChart3 size={13} />
                Top Exercises
              </div>
              <div className="space-y-2">
                {(data.top_exercises || []).length ? data.top_exercises.slice(0, 8).map(ex => (
                  <button
                    key={ex.exercise_id}
                    type="button"
                    onClick={() => openTopExercise(ex)}
                    className="w-full text-left px-3 py-3 rounded-xl"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ color: 'var(--ink)' }}>{ex.display_name || ex.exercise_id}</span>
                      <span className="text-xs" style={{ color: 'var(--accent)' }}>{ex.count}x</span>
                    </div>
                  </button>
                )) : <p className="text-sm" style={{ color: 'var(--muted)' }}>Keine Top Exercises.</p>}
              </div>
            </section>
          </div>
        </>
      ) : (
        <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Wochenreport konnte nicht geladen werden.</p>
        </section>
      )}
    </div>
  )
}
