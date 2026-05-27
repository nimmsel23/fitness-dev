import { useState, useEffect } from 'react'
import { Save, RotateCcw, Zap, Dumbbell, Download, Activity } from 'lucide-react'
import ExerciseSearch from '../components/ExerciseSearch.jsx'
import BodyMap from '../components/BodyMap.jsx'
import { 
  getSession, saveSession, getSessionHistory, 
  localToday, parseQuick, exportCsv, getProgressTrend, getExercise, sendToInbox
} from '../db.js'
import { buildSessionCoachSheet } from '../lib/exerciseInsights.js'

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ children }) {
  return (
    <div className="flex items-center gap-2.5 my-5 text-[10px] font-bold uppercase tracking-[0.15em] text-dim">
      {children}
      <div className="flex-1 h-px bg-line" />
    </div>
  )
}

// ── Exercise card ─────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${d}.${m}.`
}

function ExCard({ ex, i, updateEx, removeEx, moveEx, prev, isFirst, isLast }) {
  const [trend, setTrend] = useState(null)
  
  useEffect(() => {
    if (!ex.isHIT && ex.name) {
      getProgressTrend(ex.name).then(setTrend)
    }
  }, [ex.name, ex.isHIT])

  const num = (v) => {
    if (v === null || v === undefined) return null
    const s = String(v).trim().replace(',', '.')
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }

  const volume = (!ex.isHIT && num(ex.sets) !== null && num(ex.reps) !== null && num(ex.weight) !== null) 
    ? (num(ex.sets) * num(ex.reps) * num(ex.weight)) : null

  return (
    <div className="card border-l-4 border-accent relative mb-3 p-4">
      <div className="font-bold text-sm mb-4 pr-16 leading-tight">
        {ex.name || <span className="text-dim italic">Übung</span>}
        
        {trend && trend.status !== 'neutral' && (
          <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded ${trend.status === 'up' ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
            {trend.status === 'up' ? '↗' : '↘'} {trend.change}%
          </span>
        )}
        
        {prev && !ex.isHIT && (
          <div className="text-[11px] text-dim font-mono mt-1">
            {[prev.sets, prev.reps].filter(Boolean).join('×')}
            {prev.weight ? ` @ ${prev.weight} kg` : ''}
            <span className="ml-1.5 opacity-60">{fmtDate(prev.date)}</span>
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <button onClick={() => moveEx(i, -1)} disabled={isFirst} className="text-dim hover:text-accent disabled:opacity-20 text-lg">↑</button>
        <button onClick={() => moveEx(i, 1)} disabled={isLast} className="text-dim hover:text-accent disabled:opacity-20 text-lg">↓</button>
      </div>
      
      <button onClick={() => removeEx(i)} className="absolute bottom-2 right-2.5 text-dim text-sm hover:text-red transition-colors">
        Löschen
      </button>

      <div className={`grid items-center gap-2 mb-3 ${ex.isHIT ? 'grid-cols-[1fr]' : 'grid-cols-[1fr_18px_1fr_18px_1fr]'}`}>
        {!ex.isHIT && (
          <>
            <div className="flex flex-col items-center gap-1"><input type="text" inputMode="numeric" placeholder="—" value={ex.sets || ''} onChange={e => updateEx(i, 'sets', e.target.value)} className="text-center font-mono font-extrabold text-2xl p-2 rounded-xl bg-bg2 border border-line w-full" /><div className="label-caps !text-[8px]">Sätze</div></div>
            <div className="text-dim text-center">×</div>
            <div className="flex flex-col items-center gap-1"><input type="text" inputMode="numeric" placeholder="—" value={ex.reps || ''} onChange={e => updateEx(i, 'reps', e.target.value)} className="text-center font-mono font-extrabold text-2xl p-2 rounded-xl bg-bg2 border border-line w-full" /><div className="label-caps !text-[8px]">Wdhl</div></div>
            <div className="text-dim text-center">@</div>
          </>
        )}
        <div className="flex flex-col items-center gap-1"><input type="text" inputMode="decimal" placeholder="—" value={ex.weight || ''} onChange={e => updateEx(i, 'weight', e.target.value)} className="text-center font-mono font-extrabold text-2xl p-2 rounded-xl bg-bg2 border border-line w-full" /><div className="label-caps !text-[8px]">kg</div></div>
      </div>

      {volume !== null && (
        <div className="text-[11px] font-mono text-dim text-right mb-3">
          {Math.round(volume).toLocaleString('de-AT')} kg
        </div>
      )}

      <div className="flex items-center gap-2">
        <input type="text" placeholder="Notiz, RPE…" value={ex.note || ''} onChange={e => updateEx(i, 'note', e.target.value)}
          className="flex-1 py-1.5 px-3 text-xs bg-bg2 border-line rounded-lg" />
        <button onClick={() => updateEx(i, 'isHIT', !ex.isHIT)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${ex.isHIT ? 'border-orange bg-orange/10 text-orange' : 'border-line bg-bg2 text-dim'}`}>
          HIT
        </button>
      </div>
    </div>
  )
}

const BLOCK_COLORS = {
  push: "#f472b6", pull: "#34d399", legs: "#fb923c",
  upper: "#38bdf8", lower: "#a78bfa", full: "#fbbf24",
  hiking: "#48c87a", running: "#e05060", cycling: "#38bdf8", swimming: "#5294e2"
};

function blockColor(block, activity) {
  if (activity?.type && BLOCK_COLORS[activity.type]) return BLOCK_COLORS[activity.type];
  if (!block) return "var(--accent)";
  for (const [key, color] of Object.entries(BLOCK_COLORS)) {
    if (block.toLowerCase().includes(key)) return color;
  }
  return "var(--accent)";
}

function getRolling10Days() {
  const dates = [];
  const today = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

// ── Main view ─────────────────────────────────────────────────────────────────
export default function Session({ initialDate, hitMode }) {
  const [date, setDate]           = useState(initialDate || localToday())
  const [block, setBlock]         = useState('')
  const [exercises, setExercises] = useState([])
  const [effort, setEffort]       = useState(5)
  const [location, setLocation]   = useState('')
  const [duration, setDuration]   = useState('')
  const [trainingsart, setTrainingsart] = useState('')
  const [notes, setNotes]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState('')
  const [quickInput, setQuickInput] = useState('')
  const [prevMap, setPrevMap]       = useState({})
  const [restHours, setRestHours]   = useState(null)
  const [isActivity, setIsActivity] = useState(false)
  const [activity, setActivity]   = useState({ type: 'hiking', duration: '', intensity: 5 })
  const [recentSessions, setRecentSessions] = useState({})

  const rollingDays = getRolling10Days();

  useEffect(() => {
    getSessionHistory(30).then(sessions => {
      const map = {}
      const sessByDate = {}
      for (const sess of sessions) {
        sessByDate[sess.date] = sess
        for (const ex of (sess.exercises || [])) {
          if (ex.name && !map[ex.name]) {
            map[ex.name] = { date: sess.date, sets: ex.sets, reps: ex.reps, weight: ex.weight }
          }
        }
      }
      setPrevMap(map)
      setRecentSessions(sessByDate)
      
      // Calculate rest hours for the current block
      if (block) {
        const lastSameBlock = sessions.find(s => s.date < date && (s.block === block || s.trainingsart === block));
        if (lastSameBlock) {
          const d1 = new Date(date);
          const d2 = new Date(lastSameBlock.date);
          const hours = Math.round((d1 - d2) / (1000 * 60 * 60));
          setRestHours(hours);
        } else {
          setRestHours(null);
        }
      }
    }).catch(() => {})
  }, [block, date])

  useEffect(() => {
    getSession(date).then(d => {
      if (d) {
        setBlock(d.block || '')
        setExercises(d.exercises || [])
        setEffort(d.effort ?? 5)
        setLocation(d.location || '')
        setDuration(d.duration || '')
        setNotes(d.notes || '')
        setTrainingsart(d.trainingsart || '')
        if (d.activity) {
          setIsActivity(true)
          setActivity(d.activity)
        } else {
          setIsActivity(false)
        }
      }
    }).catch(() => {})
  }, [date])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2200) }

  async function addEx(ex) {
    let primary = ex.primaryMuscles || ex.primary_muscles || [];
    let secondary = ex.secondaryMuscles || ex.secondary_muscles || [];

    // If it's a new exercise from search, notify inbox
    if (ex.isNew) {
      sendToInbox({ name: ex.name, source: 'search_add' });
    }

    // If muscles are missing, try to fetch from KB
    if (!ex.isNew && primary.length === 0 && secondary.length === 0) {
      try {
        const kbEx = await getExercise(ex.id || ex.name);
        if (kbEx) {
          primary = kbEx.primaryMuscles || kbEx.primary_muscles || [];
          secondary = kbEx.secondaryMuscles || kbEx.secondary_muscles || [];
        }
      } catch (e) {
        console.warn("Could not fetch KB data:", e);
      }
    }

    setExercises(prev => [...prev, {
      name: ex.display_name || ex.name,
      primaryMuscles: primary,
      secondaryMuscles: secondary,
      sets: '', reps: '', weight: '', note: '', done: true, isHIT: false,
    }])
    showToast(`+ ${ex.display_name || ex.name}`)
  }

  function addQuick() {
    if (!quickInput.trim()) return
    const ex = parseQuick(quickInput)
    if (ex) { 
      setExercises(prev => [...prev, ex])
      setQuickInput('')
      showToast(`+ ${ex.name}`) 
    }
  }

  function updateEx(i, field, value) {
    setExercises(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex))
  }

  function moveEx(i, direction) {
    if (i + direction < 0 || i + direction >= exercises.length) return
    setExercises(prev => {
      const next = [...prev]
      const temp = next[i]
      next[i] = next[i + direction]
      next[i + direction] = temp
      return next
    })
  }

  function removeEx(i) {
    setExercises(prev => prev.filter((_, idx) => idx !== i))
  }

  const totalVolume = exercises.reduce((sum, ex) => {
    if (ex.isHIT) return sum
    const s = parseFloat(ex.sets), r = parseFloat(ex.reps), w = parseFloat(ex.weight)
    return (isFinite(s) && isFinite(r) && isFinite(w)) ? sum + s * r * w : sum
  }, 0)

  async function save() {
    setSaving(true)
    try {
      const sessData = { block, exercises, effort, location, duration, notes, trainingsart }
      if (isActivity) sessData.activity = activity
      await saveSession(date, sessData)
      showToast('Gespeichert ✓')
    } catch { showToast('Fehler beim Speichern') }
    finally { setSaving(false) }
  }

  function handleDownload() {
    const md = buildSessionCoachSheet({ date, block, exercises, effort, location, duration, notes });
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-session-${date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="pb-20">
      <div className="card mb-6 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="label-caps !mb-0">Datum auswählen</div>
          <div className="flex gap-2">
            <input type="date" value={date} max={localToday()} onChange={e => setDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold bg-bg2 border-line text-ink w-32" />
            <button onClick={save} disabled={saving} className="btn btn-primary py-1.5 px-4 text-xs">
              {saving ? '…' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 lg:grid-cols-10 gap-2">
          {rollingDays.map((d) => {
            const sess = recentSessions[d];
            const done = !!(sess?.block || sess?.activity);
            const isSelected = d === date;
            const isToday = d === localToday();
            const color = done ? blockColor(sess.block, sess.activity) : null;
            const dayName = DAY_LABELS[new Date(d).getDay()];

            return (
              <button key={d} onClick={() => setDate(d)}
                className="flex flex-col items-center gap-1.5 group">
                <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold transition-all border-2 ${isSelected ? 'border-accent' : 'border-transparent'}`}
                  style={{ 
                    background: isSelected ? 'var(--accent)' : done ? (color + '22') : 'var(--bg2)',
                    color: isSelected ? '#000' : done ? color : 'var(--dim)'
                  }}>
                  {done ? '✓' : '·'}
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-[8px] font-bold uppercase tracking-tighter ${isSelected ? 'text-accent' : 'opacity-40'}`}>{dayName}</span>
                  <span className={`text-[9px] font-black ${isSelected ? 'text-accent' : 'opacity-20'}`}>{d.split('-')[2]}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        <aside className="space-y-6">
          <section>
            <SectionHeader>Details</SectionHeader>
            <div className="space-y-3">
              <input type="text" value={location} placeholder="Ort" onChange={e => setLocation(e.target.value)}
                className="w-full p-3 rounded-xl border text-sm bg-card border-line text-ink" />
              <div className="relative">
                <input type="number" value={duration} placeholder="Dauer" onChange={e => setDuration(e.target.value)}
                  className="w-full p-3 pr-10 rounded-xl border text-sm bg-card border-line text-ink" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-40">MIN</span>
              </div>
              <button onClick={() => setIsActivity(!isActivity)} 
                className={`w-full p-3 rounded-xl border text-xs font-bold transition-all ${isActivity ? 'border-orange bg-orange/10 text-orange' : 'border-accent bg-accent/10 text-accent'}`}>
                {isActivity ? 'Wechsel zu Krafttraining' : 'Wechsel zu Cardio/Activity'}
              </button>
            </div>
          </section>

          {!isActivity && (
            <section>
              <SectionHeader>Split</SectionHeader>
              <div className="grid grid-cols-2 gap-2">
                {['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full'].map(l => (
                  <button key={l} onClick={() => setBlock(l)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${block === l ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-bg2 text-muted'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader>Qualität</SectionHeader>
            <div className="card mb-0 p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="label-caps !mb-0 text-[9px]">Effort</span>
                <input type="range" min={1} max={10} value={effort} onChange={e => setEffort(Number(e.target.value))} className="flex-1" />
                <span className="text-lg font-black text-accent w-5 text-right">{effort}</span>
              </div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Notizen…"
                className="w-full p-3 rounded-xl border text-xs bg-bg2 border-line text-ink focus:border-accent outline-none" />
            </div>
          </section>

          <section>
            <SectionHeader>Export</SectionHeader>
            <button onClick={handleDownload} className="w-full p-4 rounded-2xl border flex items-center justify-between bg-card border-line hover:border-accent/30 transition-colors">
              <div className="text-left">
                <div className="label-caps !mb-0 text-[9px]">Coach Sheet</div>
                <div className="text-[10px] opacity-60">Markdown Export</div>
              </div>
              <Download size={16} className="text-accent" />
            </button>
          </section>
        </aside>

        <main className="space-y-6">
          {isActivity ? (
            <div className="card space-y-4">
              <h3 className="label-caps">Activity Details</h3>
              <select value={activity.type} onChange={e => setActivity({...activity, type: e.target.value})}
                className="w-full p-3 rounded-xl border bg-card border-line text-ink">
                <option value="hiking">Wandern</option>
                <option value="running">Laufen</option>
                <option value="cycling">Radfahren</option>
                <option value="swimming">Schwimmen</option>
              </select>
              <input type="number" placeholder="Dauer (Min)" value={activity.duration} onChange={e => setActivity({...activity, duration: e.target.value})}
                className="w-full p-3 rounded-xl border bg-card border-line text-ink" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <SectionHeader>Übungen</SectionHeader>
                {hitMode ? (
                  restHours !== null && (
                    <div className="text-[10px] font-bold text-accent font-mono uppercase tracking-widest bg-accent/5 px-2 py-1 rounded">
                      Rest: {restHours}h
                    </div>
                  )
                ) : (
                  totalVolume > 0 && (
                    <div className="text-[10px] font-bold opacity-40 font-mono uppercase tracking-widest">
                      Vol: {Math.round(totalVolume).toLocaleString('de-AT')} kg
                    </div>
                  )
                )}
              </div>
              
              <div className="space-y-3">
                {exercises.map((ex, idx) => (
                  <ExCard 
                    key={idx} 
                    ex={ex} 
                    i={idx} 
                    updateEx={updateEx} 
                    removeEx={removeEx} 
                    moveEx={moveEx}
                    isFirst={idx === 0}
                    isLast={idx === exercises.length - 1}
                    prev={prevMap[ex.name]} 
                  />
                ))}
                {exercises.length === 0 && (
                  <div className="card border-dashed flex flex-col items-center justify-center py-12 opacity-30">
                    <Dumbbell size={32} className="mb-2" />
                    <p className="text-sm">Keine Übungen hinzugefügt</p>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-bg2 border border-line shadow-inner">
                <div className="label-caps !mb-3">Übung hinzufügen</div>
                <ExerciseSearch onSelect={addEx} />
                <div className="flex gap-2 mt-3">
                  <input type="text" value={quickInput} onChange={e => setQuickInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addQuick()}
                    placeholder="Quick Entry (z.B. bench 3x8@80)" className="flex-1 p-3 rounded-xl border text-sm font-mono bg-card border-line text-ink focus:border-accent outline-none" />
                  <button onClick={addQuick} className="btn btn-secondary py-3 px-5 text-orange border-orange/20 bg-orange/5">+</button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-card text-accent border border-line">
          {toast}
        </div>
      )}
    </div>
  )
}
