import { useState, useEffect, useMemo } from 'react'
import { Save, RotateCcw, Zap, Dumbbell, Download, Activity } from 'lucide-react'
import ExerciseSearch from '../components/ExerciseSearch.jsx'
import BodyMap from '../components/BodyMap.jsx'
import { 
  getSession, saveSession, getSessionHistory, 
  localToday, parseQuick, exportCsv, getProgressTrend
} from '../db.js'
import { buildSessionCoachSheet } from '../lib/exerciseInsights.js'

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      margin: '22px 0 10px',
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'var(--dim)',
    }}>
      {children}
      <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
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

  const metricInput = (key, mode) => {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <input
          type="text"
          inputMode={mode}
          placeholder="—"
          value={ex[key] || ''}
          onChange={e => updateEx(i, key, e.target.value)}
          className="text-center font-mono font-extrabold text-3xl p-2 rounded-xl"
          style={{
            width: '100%',
            background: 'var(--bg2)',
            border: `1px solid var(--line)`,
          }}
        />
        <div className="label-caps !text-[8px]">
          {{ sets: 'Sätze', reps: 'Wdhl', weight: 'kg' }[key]}
        </div>
      </div>
    )
  }

  const setsN = num(ex.sets)
  const repsN = num(ex.reps)
  const weightN = num(ex.weight)
  const volume = (!ex.isHIT && setsN !== null && repsN !== null && weightN !== null) ? (setsN * repsN * weightN) : null

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

      <div className={`grid items-center gap-1.5 mb-3 ${ex.isHIT ? 'grid-cols-[1fr]' : 'grid-cols-[1fr_18px_1fr_18px_1fr]'}`}>
        {!ex.isHIT && metricInput('sets', 'numeric')}
        {!ex.isHIT && <div className="text-dim text-center">×</div>}
        {!ex.isHIT && metricInput('reps', 'numeric')}
        {!ex.isHIT && <div className="text-dim text-center">@</div>}
        {metricInput('weight', 'decimal')}
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

// ── Main view ─────────────────────────────────────────────────────────────────
export default function Session({ initialDate }) {
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

  useEffect(() => {
    getSessionHistory(60).then(sessions => {
      const map = {}
      for (const sess of sessions) {
        for (const ex of (sess.exercises || [])) {
          if (ex.name && !map[ex.name]) {
            map[ex.name] = { date: sess.date, sets: ex.sets, reps: ex.reps, weight: ex.weight }
          }
        }
      }
      setPrevMap(map)
    }).catch(() => {})
  }, [])

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
      }
    }).catch(() => {})
  }, [date])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2200) }

  function addEx(ex) {
    setExercises(prev => [...prev, {
      name: ex.display_name || ex.name,
      primaryMuscles: ex.primary_muscles || ex.primaryMuscles || [],
      secondaryMuscles: ex.secondary_muscles || ex.secondaryMuscles || [],
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
      await saveSession(date, { block, exercises, effort, location, duration, notes, trainingsart })
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
      <div className="flex gap-2 mb-4">
        <input type="date" value={date} max={localToday()} onChange={e => setDate(e.target.value)}
          className="flex-1 p-3 rounded-xl border font-bold bg-card border-line text-ink" />
        <button onClick={save} disabled={saving} className="btn btn-primary px-5">
          <Save size={16} /> {saving ? '…' : 'Save'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input type="text" value={location} placeholder="Ort" onChange={e => setLocation(e.target.value)}
          className="flex-[2] p-3 rounded-xl border text-sm bg-card border-line text-ink" />
        <div className="flex-1 relative">
          <input type="number" value={duration} placeholder="Min" onChange={e => setDuration(e.target.value)}
            className="w-full p-3 pr-10 rounded-xl border text-sm bg-card border-line text-ink" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-40">MIN</span>
        </div>
      </div>

      <SectionHeader>Split</SectionHeader>
      <div className="flex flex-wrap gap-2 mb-4">
        {['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full'].map(l => (
          <button key={l} onClick={() => setBlock(l)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${block === l ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-bg2 text-muted'}`}>
            {l}
          </button>
        ))}
      </div>

      <SectionHeader>Übungen</SectionHeader>
      <div className="flex flex-col gap-2 mb-4">
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
        {exercises.length === 0 && <p className="text-center py-8 text-sm opacity-40">Keine Übungen — suche oder nutze Quick Entry</p>}
      </div>

      {totalVolume > 0 && (
        <div className="text-right text-[10px] font-bold opacity-40 mb-4 font-mono uppercase tracking-widest">
          Total Volume: {Math.round(totalVolume).toLocaleString('de-AT')} kg
        </div>
      )}

      <div className="p-4 rounded-2xl mb-6 bg-bg2 border border-line">
        <ExerciseSearch onSelect={addEx} />
        <div className="flex gap-2 mt-3">
          <input type="text" value={quickInput} onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuick()}
            placeholder="bench 3x8@80" className="flex-1 p-2 rounded-lg border text-sm font-mono bg-card border-line text-ink" />
          <button onClick={addQuick} className="btn btn-secondary py-2 px-4 text-orange border-orange/20 bg-orange/5">+</button>
        </div>
      </div>

      <SectionHeader>Qualität</SectionHeader>
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="label-caps">Effort</span>
          <input type="range" min={1} max={10} value={effort} onChange={e => setEffort(Number(e.target.value))} className="flex-1" />
          <span className="text-xl font-black text-accent w-6 text-right">{effort}</span>
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Notizen…"
          className="w-full p-3 rounded-xl border text-sm bg-bg2 border-line text-ink" />
      </div>

      <SectionHeader>Export</SectionHeader>
      <button onClick={handleDownload} className="w-full p-4 rounded-2xl border flex items-center justify-between bg-card border-line">
        <div className="text-left">
          <div className="label-caps">Coach Sheet</div>
          <div className="text-[11px] opacity-60">Markdown-Export für Obsidian</div>
        </div>
        <Download size={18} className="text-accent" />
      </button>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-2xl z-50 bg-card text-accent border border-line">
          {toast}
        </div>
      )}
    </div>
  )
}
