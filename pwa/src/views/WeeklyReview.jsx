import { useEffect, useState } from 'react'
import { AlertCircle, BarChart3, CalendarDays, Download, Dumbbell, Sparkles, Target, TrendingUp, Clock } from 'lucide-react'
import { getWeeklyReport, getSettings } from '../db.js'

function formatVolume(value) {
  const num = Number(value || 0)
  return `${Math.round(num).toLocaleString('de-AT')} kg`
}

export default function WeeklyReview({ onNavigate }) {
  const [week, setWeek] = useState('current')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hitMode, setHitMode] = useState(false)

  useEffect(() => {
    getSettings().then(s => setHitMode(!!s.hitMode));
  }, []);

  useEffect(() => {
    setLoading(true)
    getWeeklyReport(week)
      .then(d => setData(d || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [week])

  const muscleEntries = Object.entries(data?.muscle_scores || {})
  const regionEntries = Object.entries(data?.body_region_scores || {})
  const missingRegions = data?.missing_regions || []

  return (
    <div className="space-y-6 pb-20">
      <section className="p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg, var(--card), var(--bg2))', border: '1px solid var(--line)' }}>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
            <Sparkles size={14} />
            Review & Insight
          </div>
          <h2 className="mt-2 text-2xl font-black" style={{ color: 'var(--ink)' }}>
            Wochen-Analyse
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-line">
          <input
            value={week}
            onChange={e => setWeek(e.target.value)}
            placeholder="2026-W19"
            className="px-4 py-2 rounded-xl text-xs font-bold border-none outline-none w-32"
            style={{ background: 'transparent', color: 'var(--ink)' }}
          />
          <button
            onClick={() => setWeek('current')}
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-accent text-black transition-transform active:scale-95"
          >
            Aktuell
          </button>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 opacity-30">
          <div className="spinner mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Generiere Report…</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <section className="card mb-0">
              <div className="label-caps !mb-4 flex items-center gap-2">
                <CalendarDays size={14} className="text-accent" />
                Übersicht
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border bg-bg2 border-line">
                  <div className="text-[9px] uppercase font-black opacity-30 tracking-widest">Sessions</div>
                  <div className="mt-1 text-3xl font-black">{data.session_count || 0}</div>
                </div>
                <div className="p-4 rounded-2xl border bg-bg2 border-line">
                  <div className="text-[9px] uppercase font-black opacity-30 tracking-widest">Volumen</div>
                  <div className="mt-1 text-xl font-black text-accent">{formatVolume(data.total_volume).split(' ')[0]} <span className="text-[10px] opacity-40">kg</span></div>
                </div>
              </div>
            </section>

            <section className="card mb-0 bg-accent/5 border-accent/20">
              <div className="label-caps !mb-4 flex items-center gap-2 text-accent">
                <Sparkles size={14} />
                Highlights
              </div>
              <div className="space-y-3">
                {(data.recommendations || []).map((rec, i) => (
                  <div key={i} className="flex gap-3 text-xs font-bold leading-relaxed text-ink/80">
                    <span className="text-accent">→</span>
                    {rec}
                  </div>
                ))}
              </div>
            </section>

            <section className="card mb-0">
              <div className="label-caps !mb-4 flex items-center gap-2">
                <Target size={14} className="text-red" />
                Lücken
              </div>
              <div className="flex flex-wrap gap-2">
                {missingRegions.map(region => (
                  <span key={region} className="text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border transition-all" 
                    style={{ background: 'rgba(239,68,68,0.05)', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.15)' }}>
                    {region}
                  </span>
                ))}
                {missingRegions.length === 0 && (
                  <div className="w-full p-4 rounded-2xl bg-green/5 border border-green/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green/10 flex items-center justify-center text-green">✓</div>
                    <span className="text-xs font-bold text-green">Perfekte Abdeckung!</span>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <section className="card mb-0">
              <div className="label-caps !mb-6 flex items-center gap-2">
                <TrendingUp size={14} className="text-accent" />
                Muskel-Belastung
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {regionEntries.map(([name, score]) => (
                  <div key={name} className="flex flex-col p-4 rounded-2xl border bg-bg2 border-line hover:border-accent/30 transition-colors">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30 mb-2">{name}</span>
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-black text-ink">{Number(score).toFixed(1)}</span>
                      <div className="w-8 h-1 bg-line rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${Math.min(100, (score/5)*100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card mb-0">
              <div className="label-caps !mb-6 flex items-center gap-2">
                <Dumbbell size={14} className="text-accent" />
                Sessions {hitMode && <span className="ml-auto text-[8px] text-accent font-black tracking-widest">HIT FOCUS</span>}
              </div>
              <div className="space-y-3">
                {(data.sessions || []).map(session => (
                  <button
                    key={`${session.date}`}
                    onClick={() => onNavigate?.("session", session.date)}
                    className="w-full text-left px-5 py-4 rounded-2xl border bg-bg2 border-line hover:border-accent/30 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-card border border-line flex flex-col items-center justify-center">
                        <span className="text-[8px] font-black opacity-30 leading-none uppercase">{session.date.split('-')[1]}</span>
                        <span className="text-sm font-black text-ink leading-none mt-0.5">{session.date.split('-')[2]}</span>
                      </div>
                      <div>
                        <div className="text-sm font-black text-ink">{session.block}</div>
                        <div className="text-[9px] font-bold opacity-30 uppercase tracking-widest mt-0.5">Session Log</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-accent mb-1">{formatVolume(session.total_volume)}</div>
                      {session.muscle_recovery && Object.keys(session.muscle_recovery).length > 0 && (
                        <div className="flex justify-end gap-2">
                           {Object.entries(session.muscle_recovery).slice(0, 3).map(([m, hrs]) => (
                             <span key={m} className="text-[7px] font-black text-muted uppercase">
                               {m.slice(0,3)} {hrs}h
                             </span>
                           ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <p className="text-sm opacity-40">Wochenreport konnte nicht geladen werden.</p>
        </section>
      )}
    </div>
  )
}
