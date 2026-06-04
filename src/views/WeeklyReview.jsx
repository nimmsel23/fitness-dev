import { useEffect, useState } from 'react'
import { AlertCircle, BarChart3, CalendarDays, Download, Dumbbell, Sparkles, Target, TrendingUp, Zap } from 'lucide-react'
import { api, getWeeklyReport } from '../api.js'

function formatVolume(value) {
  const num = Number(value || 0)
  return `${Math.round(num).toLocaleString('de-AT')} kg`
}

export default function WeeklyReview({ onOpenSession, onInspectExercise, hitMode }) {
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
    getWeeklyReport(week)
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

  const regionEntries = Object.entries(data?.body_region_scores || {}).sort((a, b) => b[1] - a[1]);
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
    <div className="space-y-6 pb-20">
      <section className="p-8 rounded-[32px] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-card to-bg2 border border-line">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--accent)' }}>
            <Sparkles size={16} className="text-accent" />
            Performance Review
          </div>
          <h2 className="text-3xl font-black text-ink tracking-tight">
            Wochen-Analyse
          </h2>
          {toast && (
            <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20 inline-block">
              {toast}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-line/50 relative z-10 shadow-inner">
          <input
            value={week}
            onChange={e => setWeek(e.target.value)}
            placeholder="2026-W19"
            className="px-4 py-2.5 rounded-xl text-sm font-black border-none outline-none w-36 uppercase tracking-wider"
            style={{ background: 'transparent', color: 'var(--ink)' }}
          />
          <button
            onClick={() => setWeek('current')}
            className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-accent text-black transition-transform active:scale-95 shadow-lg shadow-accent/20"
          >
            Aktuell
          </button>
        </div>
      </section>

      <section className="card p-4 flex flex-wrap items-center justify-between gap-4 border-dashed border-accent/30 bg-accent/5">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
           {config?.exportPath ? `Zielpfad: ${config.exportPath}` : 'Lokaler Export'}
        </div>
        <button
          onClick={exportWeekly}
          className="btn btn-primary !py-2 !px-5 !text-[10px] uppercase tracking-widest shadow-lg shadow-accent/20"
        >
          <Download size={14} /> Export Obsidian
        </button>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <div className="spinner mb-6" />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Generiere Report…</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <section className="card mb-0 shadow-lg border-line/50 p-8">
              <div className="label-caps !mb-6 flex items-center gap-2">
                <CalendarDays size={16} className="text-accent" />
                Übersicht
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border bg-bg2 border-line flex flex-col justify-center">
                  <div className="text-[10px] uppercase font-black opacity-30 tracking-[0.2em] mb-1">Sessions</div>
                  <div className="text-4xl font-black text-ink">{data.session_count || 0}</div>
                </div>
                <div className="p-5 rounded-2xl border bg-bg2 border-line flex flex-col justify-center">
                  <div className="text-[10px] uppercase font-black opacity-30 tracking-[0.2em] mb-1">{hitMode ? 'Recovery' : 'Volumen'}</div>
                  <div className="text-2xl font-black text-accent flex flex-col">
                     {hitMode ? (
                        <span className="flex items-center gap-1"><Zap size={20} /> Fokus</span>
                     ) : (
                        <>
                           {formatVolume(data.total_volume).split(' ')[0]}
                           <span className="text-[10px] font-black uppercase opacity-40 -mt-1 tracking-widest text-ink">kg Total</span>
                        </>
                     )}
                  </div>
                </div>
              </div>
            </section>

            <section className="card mb-0 bg-accent/5 border-accent/20 shadow-xl p-8">
              <div className="label-caps !mb-6 flex items-center gap-2 text-accent">
                <Sparkles size={16} />
                Insights & Tipps
              </div>
              <div className="space-y-4">
                {(data.recommendations || []).map((rec, i) => (
                  <div key={i} className="flex gap-4 text-sm font-medium leading-relaxed text-ink/80 bg-card/50 p-4 rounded-xl border border-accent/10">
                    <span className="text-accent font-black mt-0.5">→</span>
                    {rec}
                  </div>
                ))}
                {missingRegions.length > 0 ? (
                  <div className="pt-4 border-t border-accent/10">
                     <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red mb-3 flex items-center gap-2">
                        <AlertCircle size={12} />
                        Coverage Gaps
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {missingRegions.map(region => (
                         <span key={region} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all" 
                           style={{ background: 'rgba(239,68,68,0.05)', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }}>
                           {region}
                         </span>
                       ))}
                     </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-accent/10">
                     <div className="flex items-center gap-3 p-3 bg-green/10 rounded-xl border border-green/20">
                       <div className="w-8 h-8 rounded-full bg-green text-black flex items-center justify-center font-black">✓</div>
                       <span className="text-xs font-bold text-green">Perfekte Abdeckung!</span>
                     </div>
                  </div>
                )}
                
                {lowRegions.length > 0 && (
                   <div className="pt-2">
                     <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange mb-2">Low Volume Regions</div>
                     <div className="flex flex-wrap gap-2">
                       {lowRegions.map(region => (
                         <span key={region} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-orange/10 text-orange border border-orange/20">
                           {region}
                         </span>
                       ))}
                     </div>
                   </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <section className="card mb-0 shadow-lg border-line/50 p-8">
              <div className="label-caps !mb-8 flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                Relative Muskelbelastung
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {regionEntries.length > 0 ? regionEntries.map(([name, score]) => {
                  const maxScore = Math.max(...regionEntries.map(e => e[1]), 5);
                  const pct = Math.min(100, (score / maxScore) * 100);
                  return (
                    <div key={name} className="flex flex-col p-5 rounded-2xl border bg-bg2 border-line hover:border-accent/40 transition-all group shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 group-hover:text-accent group-hover:opacity-100 transition-colors">{name}</span>
                      <div className="flex items-end justify-between mt-auto">
                        <span className="text-2xl font-black text-ink">{Number(score).toFixed(1)}</span>
                        <div className="w-1.5 h-8 bg-line rounded-full overflow-hidden flex flex-col justify-end">
                          <div className="w-full bg-accent transition-all duration-1000" style={{ height: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="col-span-full py-8 text-center text-sm opacity-30 font-bold uppercase tracking-widest border border-dashed rounded-2xl">Keine Daten in diesem Zeitraum</div>
                )}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="card mb-0 shadow-lg border-line/50 p-6">
                <div className="label-caps !mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Dumbbell size={16} className="text-accent" />
                     Sessions
                  </div>
                  {hitMode && <span className="text-[9px] text-accent font-black tracking-[0.2em] bg-accent/10 px-2 py-1 rounded-full">HIT FOCUS</span>}
                </div>
                <div className="space-y-4">
                  {(data.sessions || []).map(session => (
                    <button
                      key={`${session.workout_id}-${session.date}`}
                      onClick={() => onOpenSession?.(session.date)}
                      className="w-full text-left p-4 rounded-2xl border bg-bg2 border-line hover:border-accent/50 hover:shadow-lg transition-all flex flex-col gap-3 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[14px] bg-card border border-line flex flex-col items-center justify-center shadow-inner group-hover:border-accent/40 transition-colors">
                          <span className="text-[8px] font-black opacity-40 leading-none uppercase tracking-widest">{session.date.split('-')[1]}</span>
                          <span className="text-base font-black text-ink leading-none mt-1">{session.date.split('-')[2]}</span>
                        </div>
                        <div>
                          <div className="text-sm font-black text-ink group-hover:text-accent transition-colors">{session.workout_id}</div>
                          <div className="text-[9px] font-bold opacity-40 uppercase tracking-[0.2em] mt-0.5">
                            {session.exercise_count} Übungen
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full border-t border-line/50 pt-2">
                        <div className="text-[10px] font-bold opacity-40 uppercase">RPE {session.avg_rpe || '-'}</div>
                        {!hitMode && (
                           <div className="text-[11px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
                              {formatVolume(session.total_volume)}
                           </div>
                        )}
                      </div>
                    </button>
                  ))}
                  {(data.sessions || []).length === 0 && (
                     <div className="py-8 text-center text-[10px] font-black opacity-30 uppercase tracking-[0.2em] border border-dashed rounded-3xl">Keine Sessions</div>
                  )}
                </div>
              </section>

              <section className="card mb-0 shadow-lg border-line/50 p-6">
                <div className="label-caps !mb-6 flex items-center gap-2">
                  <BarChart3 size={16} className="text-accent" />
                  Top Exercises
                </div>
                <div className="space-y-3">
                  {(data.top_exercises || []).slice(0, 6).map(ex => (
                    <button
                      key={ex.exercise_id}
                      onClick={() => openTopExercise(ex)}
                      className="w-full text-left p-4 rounded-2xl border bg-bg2 border-line hover:border-accent/50 transition-all flex items-center justify-between group"
                    >
                      <span className="text-xs font-bold text-ink group-hover:text-accent truncate pr-4">{ex.display_name || ex.exercise_id}</span>
                      <span className="text-xs font-black text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">{ex.count}x</span>
                    </button>
                  ))}
                  {(data.top_exercises || []).length === 0 && (
                     <div className="py-8 text-center text-[10px] font-black opacity-30 uppercase tracking-[0.2em] border border-dashed rounded-3xl">Keine Top Exercises</div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <section className="p-8 rounded-3xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <p className="text-sm font-bold opacity-40 text-center uppercase tracking-widest">Wochenreport konnte nicht geladen werden.</p>
        </section>
      )}
    </div>
  )
}
