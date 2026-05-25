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
    <div className="space-y-4 pb-20">
      <section className="p-4 rounded-2xl" style={{ background: 'linear-gradient(180deg, var(--card), var(--bg2))', border: '1px solid var(--line)' }}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          <BarChart3 size={13} />
          Weekly Review
        </div>
        <h2 className="mt-2 text-xl font-black" style={{ color: 'var(--ink)' }}>
          Trainingswoche Analyse
        </h2>
      </section>

      <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="flex items-center gap-2">
          <input
            value={week}
            onChange={e => setWeek(e.target.value)}
            placeholder="current oder 2026-W19"
            className="flex-1 px-3 py-2 rounded-xl text-sm border"
            style={{ background: 'var(--bg2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
          />
          <button
            onClick={() => setWeek('current')}
            className="px-4 py-2 rounded-xl text-sm font-bold border"
            style={{ background: 'var(--bg2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            current
          </button>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-12 text-sm opacity-40">Lade Report…</div>
      ) : data ? (
        <>
          <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 opacity-40">
              <CalendarDays size={13} />
              Übersicht
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border" style={{ background: 'var(--bg2)', borderColor: 'var(--line)' }}>
                <div className="text-[10px] uppercase font-bold opacity-40">Sessions</div>
                <div className="mt-1 text-2xl font-black">{data.session_count || 0}</div>
              </div>
              <div className="p-3 rounded-xl border" style={{ background: 'var(--bg2)', borderColor: 'var(--line)' }}>
                <div className="text-[10px] uppercase font-bold opacity-40">Volumen</div>
                <div className="mt-1 text-lg font-black text-accent">{formatVolume(data.total_volume)}</div>
              </div>
            </div>
          </section>

          <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 opacity-40">
              <Sparkles size={13} />
              Empfehlungen
            </div>
            <div className="space-y-2">
              {(data.recommendations || []).map((rec, i) => (
                <div key={i} className="p-3 rounded-xl text-sm font-medium border" style={{ background: 'var(--bg2)', borderColor: 'var(--line)' }}>
                  {rec}
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 opacity-40">
                <TrendingUp size={13} />
                Regionen
              </div>
              <div className="space-y-2">
                {regionEntries.map(([name, score]) => (
                  <div key={name} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl border" style={{ background: 'var(--bg2)', borderColor: 'var(--line)' }}>
                    <span className="font-medium uppercase text-[10px] tracking-wider opacity-60">{name}</span>
                    <span className="font-bold text-accent">{Number(score).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 opacity-40">
                <Target size={13} />
                Lücken
              </div>
              <div className="flex flex-wrap gap-2">
                {missingRegions.map(region => (
                  <span key={region} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border" 
                    style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }}>
                    {region}
                  </span>
                ))}
                {missingRegions.length === 0 && <span className="text-sm text-green-500 font-bold">✓ Alles abgedeckt</span>}
              </div>
            </section>
          </div>

          <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 opacity-40">
              <Dumbbell size={13} />
              Sessions {hitMode && <span className="ml-auto text-[8px] text-accent">HIT MODE: REST TRACKING</span>}
            </div>
            <div className="space-y-2">
              {(data.sessions || []).map(session => (
                <button
                  key={`${session.date}`}
                  onClick={() => onNavigate?.("session", session.date)}
                  className="w-full text-left px-4 py-3 rounded-xl border transition-all"
                  style={{ background: 'var(--bg2)', borderColor: 'var(--line)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-sm">{session.date}</div>
                      <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">{session.block}</div>
                    </div>
                    <div className="text-right">
                      {hitMode && session.rest_hours !== null ? (
                        <div className="flex flex-col items-end">
                           <div className="text-xs font-black text-accent flex items-center gap-1">
                             <Clock size={10} /> {session.rest_hours}h Rest
                           </div>
                           <div className="text-[8px] opacity-30 uppercase font-bold">since last {session.block}</div>
                        </div>
                      ) : (
                        <div className="text-xs font-black text-accent">
                          {formatVolume(session.total_volume)}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <p className="text-sm opacity-40">Wochenreport konnte nicht geladen werden.</p>
        </section>
      )}
    </div>
  )
}
