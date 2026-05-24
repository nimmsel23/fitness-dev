import { useState, useEffect, useMemo } from 'react'
import { Save, RotateCcw, Zap, Dumbbell, Download, Activity } from 'lucide-react'
import ExerciseSearch from '../components/ExerciseSearch.jsx'
import BodyMap from '../components/BodyMap.jsx'
import { 
  getSession, saveSession, getSessionHistory, 
  localToday, parseQuick, exportCsv 
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

function ExCard({ ex, i, updateEx, removeEx, prev }) {
  const num = (v) => {
    if (v === null || v === undefined) return null
    const s = String(v).trim().replace(',', '.')
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }

  const setsN = num(ex.sets)
  const repsN = num(ex.reps)
  const weightN = num(ex.weight)
  const volume = (setsN !== null && repsN !== null && weightN !== null) ? (setsN * repsN * weightN) : null

  const metricInput = (key, mode) => {
    const disabled = ex.isHIT && (key === 'sets' || key === 'reps')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <input
          type="text"
          inputMode={mode}
          placeholder="—"
          value={ex[key] || ''}
          disabled={disabled}
          onChange={e => updateEx(i, key, e.target.value)}
          style={{
            width: '100%',
            textAlign: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '28px',
            fontWeight: 800,
            padding: '8px 4px',
            background: disabled ? 'transparent' : 'var(--bg2)',
            border: `1px solid ${disabled ? 'transparent' : 'var(--line)'}`,
            borderRadius: '10px',
            color: 'var(--ink)',
            outline: 'none',
            opacity: disabled ? 0.2 : 1,
          }}
        />
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dim)' }}>
          {{ sets: 'Sätze', reps: 'Wdhl', weight: 'kg' }[key]}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--line)',
      borderLeft: '3px solid var(--accent)', borderRadius: '14px',
      padding: '14px', position: 'relative', marginBottom: '10px',
    }}>
      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px', paddingRight: '28px', lineHeight: 1.3 }}>
        {ex.name || <span style={{ color: 'var(--dim)', fontStyle: 'italic' }}>Übung</span>}
        {prev && (
          <div style={{ fontSize: '11px', color: 'var(--dim)', fontFamily: "'JetBrains Mono', monospace", marginTop: '3px' }}>
            {[prev.sets, prev.reps].filter(Boolean).join('×')}
            {prev.weight ? ` @ ${prev.weight} kg` : ''}
            <span style={{ marginLeft: '6px', opacity: 0.6 }}>{fmtDate(prev.date)}</span>
          </div>
        )}
      </div>

      <button onClick={() => removeEx(i)}
        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: '18px' }}>
        ×
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 18px 1fr 18px 1fr', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        {metricInput('sets', 'numeric')}
        <div style={{ fontSize: '15px', color: 'var(--dim)', textAlign: 'center' }}>×</div>
        {metricInput('reps', 'numeric')}
        <div style={{ fontSize: '15px', color: 'var(--dim)', textAlign: 'center' }}>@</div>
        {metricInput('weight', 'decimal')}
      </div>

      {volume !== null && (
        <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--dim)', textAlign: 'right', marginBottom: '10px' }}>
          {Math.round(volume).toLocaleString('de-AT')} kg
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input type="text" placeholder="Notiz, RPE…" value={ex.note || ''} onChange={e => updateEx(i, 'note', e.target.value)}
          style={{ flex: 1, padding: '6px 10px', background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '6px', color: 'var(--muted)', fontSize: '12px', outline: 'none' }} />
        <button onClick={() => updateEx(i, 'isHIT', !ex.isHIT)}
          style={{ padding: '6px 9px', border: `1px solid ${ex.isHIT ? '#f59e0b' : 'var(--line)'}`, borderRadius: '6px', background: ex.isHIT ? 'rgba(245,158,11,0.08)' : 'var(--bg2)', cursor: 'pointer', fontSize: '10px', fontWeight: 700, color: ex.isHIT ? '#f59e0b' : 'var(--dim)' }}>
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
      name: ex.name,
      primaryMuscles: ex.primaryMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
      sets: '', reps: '', weight: '', note: '', done: true, isHIT: false,
    }])
    showToast(`+ ${ex.name}`)
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

  function removeEx(i) {
    setExercises(prev => prev.filter((_, idx) => idx !== i))
  }

  const totalVolume = exercises.reduce((sum, ex) => {
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
          className="flex-1 p-3 rounded-xl border font-bold" style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
        <button onClick={save} disabled={saving} className="px-5 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #22d3ee, #14b8a6)', color: '#062026', opacity: saving ? 0.6 : 1 }}>
          <Save size={16} /> {saving ? '…' : 'Save'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input type="text" value={location} placeholder="Ort" onChange={e => setLocation(e.target.value)}
          className="flex-[2] p-3 rounded-xl border text-sm" style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
        <div className="flex-1 relative">
          <input type="number" value={duration} placeholder="Min" onChange={e => setDuration(e.target.value)}
            className="w-full p-3 pr-10 rounded-xl border text-sm" style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-40">MIN</span>
        </div>
      </div>

      <SectionHeader>Split</SectionHeader>
      <div className="flex flex-wrap gap-2 mb-4">
        {['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full'].map(l => (
          <button key={l} onClick={() => setBlock(l)}
            className="px-4 py-2 rounded-xl text-xs font-bold border transition-all"
            style={{ 
              background: block === l ? 'rgba(94,234,212,0.1)' : 'var(--bg2)', 
              borderColor: block === l ? 'var(--accent)' : 'var(--line)',
              color: block === l ? 'var(--accent)' : 'var(--muted)'
            }}>{l}</button>
        ))}
      </div>

      {exercises.length > 0 && (
        <div className="mb-6 flex justify-center gap-4 p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          <BodyMap exercises={exercises} type="anterior" />
          <BodyMap exercises={exercises} type="posterior" />
        </div>
      )}

      <SectionHeader>Übungen</SectionHeader>
      <div className="flex flex-col gap-2 mb-4">
        {exercises.map((ex, idx) => (
          <ExCard key={idx} ex={ex} i={idx} updateEx={updateEx} removeEx={removeEx} prev={prevMap[ex.name]} />
        ))}
        {exercises.length === 0 && <p className="text-center py-8 text-sm opacity-40">Keine Übungen — suche oder nutze Quick Entry</p>}
      </div>

      {totalVolume > 0 && (
        <div className="text-right text-xs font-bold opacity-50 mb-4 font-mono">
          Total: {Math.round(totalVolume).toLocaleString('de-AT')} kg
        </div>
      )}

      <div className="p-4 rounded-2xl mb-6" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
        <ExerciseSearch onSelect={addEx} />
        <div className="flex gap-2 mt-3">
          <input type="text" value={quickInput} onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuick()}
            placeholder="bench 3x8@80" className="flex-1 p-2 rounded-lg border text-sm font-mono"
            style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
          <button onClick={addQuick} className="px-4 py-2 rounded-lg font-bold" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>+</button>
        </div>
      </div>

      <SectionHeader>Qualität</SectionHeader>
      <div className="p-4 rounded-2xl mb-6" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[10px] font-bold uppercase opacity-40">Effort</span>
          <input type="range" min={1} max={10} value={effort} onChange={e => setEffort(Number(e.target.value))} className="flex-1" />
          <span className="text-xl font-black text-accent w-6 text-right">{effort}</span>
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Notizen…"
          className="w-full p-3 rounded-xl border text-sm" style={{ background: 'var(--bg2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
      </div>

      <SectionHeader>Export</SectionHeader>
      <button onClick={handleDownload} className="w-full p-4 rounded-2xl border flex items-center justify-between"
        style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
        <div className="text-left">
          <div className="text-xs font-bold uppercase opacity-40">Coach Sheet</div>
          <div className="text-xs opacity-60">Markdown-Export für Obsidian</div>
        </div>
        <Download size={18} className="text-accent" />
      </button>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-2xl z-50"
          style={{ background: 'var(--card)', color: 'var(--accent)', border: '1px solid var(--line)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
