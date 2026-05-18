import { useState, useEffect, useMemo } from 'react'
import { Save, RotateCcw, Zap, Dumbbell, Download } from 'lucide-react'
import ExerciseSearch from '../components/ExerciseSearch.jsx'
import BodyMap from '../components/BodyMap.jsx'
import { api, localToday, parseQuick, downloadText } from '../api.js'
import { buildSessionCoachSheet } from '../lib/exerciseInsights.js'

// ── Section header with rule ──────────────────────────────────────────────────
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

function ExCard({ ex, i, updateEx, removeEx, prev, onInspectExercise }) {
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
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            padding: '8px 4px',
            background: disabled ? 'transparent' : 'var(--bg2)',
            border: `1px solid ${disabled ? 'transparent' : 'var(--line)'}`,
            borderRadius: '10px',
            color: 'var(--ink)',
            outline: 'none',
            opacity: disabled ? 0.2 : 1,
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
            appearance: 'none',
          }}
          onFocus={e => { if (!disabled) e.target.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor = disabled ? 'transparent' : 'var(--line)' }}
        />
        <div style={{
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--dim)',
        }}>
          {{ sets: 'Sätze', reps: 'Wdhl', weight: 'kg' }[key]}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderLeft: '3px solid var(--accent)',
      borderRadius: '14px',
      padding: '14px',
      position: 'relative',
      marginBottom: '10px',
    }}>
      {/* Name + optional muscle hint */}
      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px', paddingRight: '28px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
        <button
          type="button"
          onClick={() => onInspectExercise?.(ex)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'inherit',
            font: 'inherit',
            cursor: onInspectExercise ? 'pointer' : 'default',
            textAlign: 'left',
          }}
        >
          {ex.name
            ? ex.name
            : <span style={{ color: 'var(--dim)', fontStyle: 'italic', fontWeight: 400 }}>Übung</span>
          }
        </button>
        {prev && (
          <div style={{
            fontSize: '11px', color: 'var(--dim)', fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500, marginTop: '3px', letterSpacing: '-0.01em',
          }}>
            {[prev.sets, prev.reps].filter(Boolean).join('×')}
            {prev.weight ? ` @ ${prev.weight} kg` : ''}
            <span style={{ fontFamily: 'inherit', fontWeight: 400, marginLeft: '6px', opacity: 0.6 }}>
              {fmtDate(prev.date)}
            </span>
          </div>
        )}
        {!prev && (ex.primaryMuscles || []).length > 0 && (
          <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 500, marginTop: '2px', opacity: 0.65 }}>
            {ex.primaryMuscles.slice(0, 2).join(' · ')}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => removeEx(i)}
        style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'none', border: 'none',
          color: 'var(--dim)', cursor: 'pointer',
          fontSize: '18px', padding: '4px 6px',
          borderRadius: '6px', lineHeight: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.background = 'none' }}
      >×</button>

      {/* Sätze × Wdhl @ kg */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 18px 1fr 18px 1fr',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '10px',
      }}>
        {metricInput('sets', 'numeric')}
        <div style={{ fontSize: '15px', color: 'var(--dim)', textAlign: 'center', fontWeight: 300 }}>×</div>
        {metricInput('reps', 'numeric')}
        <div style={{ fontSize: '15px', color: 'var(--dim)', textAlign: 'center', fontWeight: 300 }}>@</div>
        {metricInput('weight', 'decimal')}
      </div>

      {volume !== null && (
        <div style={{
          fontSize: '11px',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color: 'var(--dim)',
          marginTop: '-4px',
          marginBottom: '10px',
          textAlign: 'right',
        }}>
          {Math.round(volume).toLocaleString('de-AT')} kg
        </div>
      )}

      {/* Note + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input
          type="text"
          placeholder="Notiz, RPE…"
          value={ex.note || ''}
          onChange={e => updateEx(i, 'note', e.target.value)}
          style={{
            flex: 1, padding: '6px 10px',
            background: 'var(--bg2)', border: '1px solid var(--line)',
            borderRadius: '6px', color: 'var(--muted)',
            fontSize: '12px', outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--ink)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.color = 'var(--muted)' }}
        />
        <button
          onClick={() => updateEx(i, 'done', !ex.done)}
          style={{
            width: '34px',
            height: '34px',
            border: `1px solid ${ex.done ? 'rgba(34,197,94,0.5)' : 'var(--line)'}`,
            borderRadius: '6px',
            background: ex.done ? 'rgba(34,197,94,0.12)' : 'var(--bg2)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 800,
            color: ex.done ? 'var(--green)' : 'var(--dim)',
            flexShrink: 0,
          }}
          aria-label={ex.done ? 'Done' : 'Not done'}
          title={ex.done ? 'Done' : 'Not done'}
        >
          {ex.done ? '✓' : '□'}
        </button>
        <button
          onClick={() => updateEx(i, 'isHIT', !ex.isHIT)}
          style={{
            padding: '6px 9px',
            border: `1px solid ${ex.isHIT ? 'rgba(245,158,11,0.5)' : 'var(--line)'}`,
            borderRadius: '6px',
            background: ex.isHIT ? 'rgba(245,158,11,0.08)' : 'var(--bg2)',
            cursor: 'pointer',
            fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: ex.isHIT ? '#f59e0b' : 'var(--dim)',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >HIT</button>
      </div>
      {ex.isFinisher && (
        <div style={{
          marginTop: '8px',
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: ex.done ? 'var(--green)' : '#f59e0b',
        }}>
          {ex.done ? 'Finisher done' : 'Finisher'}
        </div>
      )}
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function Session({ initialDate, initialDraft = null, onInspectExercise }) {
  const [date, setDate]           = useState(initialDate || localToday())
  const [blocks, setBlocks]       = useState([])
  const [block, setBlock]         = useState('')
  const [exercises, setExercises] = useState([])
  const [effort, setEffort]       = useState(5)
  const [location, setLocation]   = useState('')
  const [duration, setDuration]   = useState('')
  const [trainingsart, setTrainingsart] = useState('')
  const [notes, setNotes]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState('')
  const [hint, setHint]           = useState(null)
  const [gaps, setGaps]           = useState([])
  const [quickInput, setQuickInput] = useState('')
  const [prevMap, setPrevMap]       = useState({})

  useEffect(() => {
    api.get('/blocks').then(d => { if (d?.blocks) setBlocks(d.blocks) }).catch(() => {})
    api.get('/session/history?limit=60').then(d => {
      if (!d?.sessions) return
      const map = {}
      for (const sess of d.sessions) {
        for (const ex of (sess.exercises || [])) {
          if (ex.name && !map[ex.name] && sess.date !== date) {
            map[ex.name] = { date: sess.date, sets: ex.sets, reps: ex.reps, weight: ex.weight }
          }
        }
      }
      setPrevMap(map)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    api.get(`/session?date=${date}`).then(d => {
      if (d?.ok && d.data) {
        setBlock(d.data.block || '')
        setTrainingsart(d.data.trainingsart || '')
        setExercises(d.data.exercises || [])
        setEffort(d.data.effort ?? 5)
        setLocation(d.data.location || '')
        setDuration(d.data.duration || '')
        setNotes(d.data.notes || '')
      } else {
        if (initialDraft && date === (initialDate || localToday())) {
          setBlock(initialDraft.block || '')
          setExercises(Array.isArray(initialDraft.exercises) ? initialDraft.exercises : [])
          setEffort(5); setLocation(''); setDuration(''); setNotes('')
        } else {
          setBlock(''); setExercises([]); setEffort(5); setLocation(''); setDuration(''); setNotes('')
        }
      }
    }).catch(() => {})
    api.get(`/plan/today?date=${date}`).then(d => setHint(d?.suggestion || null)).catch(() => {})
  }, [date, initialDate, initialDraft])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2200) }

  function addEx(ex) {
      setExercises(prev => [...prev, {
      name: ex.name, id: ex.id || '',
      primaryMuscles: ex.primaryMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
      sets: '', reps: '', weight: '', note: ex.note || '', done: !!ex.done, isHIT: false, isFinisher: !!ex.isFinisher,
    }])
    showToast(`+ ${ex.name}`)
  }

  function addQuick() {
    if (!quickInput.trim()) return
    const ex = parseQuick(quickInput)
    if (ex) { setExercises(prev => [...prev, { ...ex, isHIT: false }]); setQuickInput(''); showToast(`+ ${ex.name}`) }
  }

  function updateEx(i, field, value) {
    setExercises(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex))
  }

  function removeEx(i) {
    setExercises(prev => prev.filter((_, idx) => idx !== i))
  }

  const totalVolume = exercises.reduce((sum, ex) => {
    const toNum = (v) => {
      if (v === null || v === undefined) return null
      const s = String(v).trim().replace(',', '.')
      if (!s) return null
      const n = Number(s)
      return Number.isFinite(n) ? n : null
    }
    const setsN = toNum(ex.sets)
    const repsN = toNum(ex.reps)
    const weightN = toNum(ex.weight)
    if (setsN === null || repsN === null || weightN === null) return sum
    return sum + (setsN * repsN * weightN)
  }, 0)

  const renderedExercises = exercises
    .map((ex, idx) => ({ ex, idx }))
    .sort((a, b) => {
      const aFinisher = !!a.ex.isFinisher
      const bFinisher = !!b.ex.isFinisher
      if (aFinisher !== bFinisher) return aFinisher ? 1 : -1
      return a.idx - b.idx
    })

  async function loadLast() {
    try {
      const r = await api.get('/session/latest')
      if (!r?.session?.data) { showToast('Keine vorherige Session'); return }
      const d = r.session.data
      setBlock(d.block || ''); setExercises(d.exercises || [])
      showToast('Letzte Session geladen')
    } catch { showToast('Fehler beim Laden') }
  }

  async function save() {
    setSaving(true)
    try {
      await api.post(`/session?date=${date}`, { block, exercises, effort, location, duration, notes, trainingsart })
      showToast('Gespeichert ✓')
      const r = await api.get('/coverage/gaps?days=7')
      setGaps(r?.gaps || [])
    } catch { showToast('Fehler beim Speichern') }
    finally { setSaving(false) }
  }

  async function exportObsidian() {
    try {
      const result = await api.post('/fitness/export', {
        kind: 'session',
        session: { date, block, exercises, effort, location, duration, notes },
        force: true,
      })
      showToast(result?.path ? `Export: ${result.path}` : 'Exportiert')
    } catch {
      showToast('Export fehlgeschlagen')
    }
  }

  const doneExercises = useMemo(
    () => exercises.filter(ex => ex.done),
    [exercises]
  )

  const splitLabels = blocks.length
    ? blocks.map(b => b.label)
    : ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full']

  return (
    <div>
      {/* ── Datum + Speichern ── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="date" value={date} max={localToday()}
          onChange={e => setDate(e.target.value)}
          style={{
            flex: 1, padding: '10px 14px',
            background: 'var(--card)', border: '1px solid var(--line)',
            color: 'var(--ink)', borderRadius: '12px',
            fontSize: '15px', fontWeight: 600, outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--line)'}
        />
        <button
          onClick={save} disabled={saving}
          style={{
            padding: '10px 22px',
            background: 'linear-gradient(135deg, #22d3ee, #14b8a6)',
            color: '#062026', borderRadius: '12px', border: 'none',
            fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em',
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.6 : 1,
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
          }}
        >
          <Save size={14} /> {saving ? '…' : 'Speichern'}
        </button>
      </div>

      {/* ── Ort + Dauer ── */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <input
          type="text" value={location} placeholder="Ort (z.B. Gym, Zuhause)"
          onChange={e => setLocation(e.target.value)}
          style={{
            flex: 2, padding: '10px 14px',
            background: 'var(--card)', border: '1px solid var(--line)',
            color: 'var(--ink)', borderRadius: '12px',
            fontSize: '14px', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--line)'}
        />
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="number" value={duration} placeholder="Min"
            min={1} max={300}
            onChange={e => setDuration(e.target.value)}
            style={{
              width: '100%', padding: '10px 36px 10px 14px',
              background: 'var(--card)', border: '1px solid var(--line)',
              color: 'var(--ink)', borderRadius: '12px',
              fontSize: '14px', outline: 'none',
              WebkitAppearance: 'none', MozAppearance: 'textfield',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--line)'}
          />
          <span style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '11px', fontWeight: 700, color: 'var(--dim)', pointerEvents: 'none',
          }}>min</span>
        </div>
      </div>

      {/* ── Trainingsart ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
        {['Krafttraining', 'Hypertrophie', 'Ausdauer', 'Koordination', 'Beweglichkeit', 'Sonstiges'].map(art => (
          <button
            key={art}
            type="button"
            onClick={() => setTrainingsart(trainingsart === art ? '' : art)}
            style={{
              padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
              border: `1px solid ${trainingsart === art ? 'var(--accent)' : 'var(--line)'}`,
              background: trainingsart === art ? 'rgba(94,234,212,0.08)' : 'var(--card)',
              color: trainingsart === art ? 'var(--accent)' : 'var(--muted)',
              cursor: 'pointer',
            }}
          >{art}</button>
        ))}
      </div>

      {/* Plan hint */}
      {hint && (
        <div style={{
          marginTop: '10px', padding: '8px 12px', borderRadius: '10px',
          background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.2)',
          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px',
        }}>
          <Zap size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{hint.block}</span>
          <span style={{ color: 'var(--muted)' }}>{(hint.exercises || []).slice(0, 3).join(', ')}</span>
        </div>
      )}

      {/* ── Split ── */}
      <SectionHeader>Split</SectionHeader>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {splitLabels.map(l => (
          <button key={l} onClick={() => setBlock(l)}
            style={{
              padding: '9px 16px',
              border: `2px solid ${block === l ? 'var(--accent)' : 'var(--line)'}`,
              borderRadius: '10px',
              background: block === l ? 'rgba(94,234,212,0.08)' : 'var(--bg2)',
              color: block === l ? 'var(--accent)' : 'var(--muted)',
              fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em',
              textTransform: 'uppercase', cursor: 'pointer',
              boxShadow: block === l ? '0 0 16px rgba(94,234,212,0.08)' : 'none',
              transition: 'all 140ms',
            }}
          >{l}</button>
        ))}
      </div>

      {/* ── Body Map (nur done exercises) ── */}
      {doneExercises.length > 0 && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '16px',
          margin: '14px 0 4px', padding: '12px',
          background: 'var(--card)', border: '1px solid var(--line)',
          borderRadius: '14px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>Vorne</span>
            <BodyMap exercises={doneExercises} type="anterior" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dim)' }}>Hinten</span>
            <BodyMap exercises={doneExercises} type="posterior" />
          </div>
        </div>
      )}

      {/* ── Übungen ── */}
      <SectionHeader>Übungen</SectionHeader>

      {exercises.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '36px 16px', textAlign: 'center',
          border: '2px dashed var(--line)', borderRadius: '14px', marginBottom: '10px',
        }}>
          <Dumbbell size={34} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <p style={{ fontSize: '13px', color: 'var(--dim)', fontWeight: 600, margin: 0 }}>
            Noch keine Übungen — suche oder tippe einen Kurzbefehl
          </p>
        </div>
      ) : (
        renderedExercises.map(({ ex, idx }) => (
          <ExCard key={`${idx}-${ex.name}`} ex={ex} i={idx} updateEx={updateEx} removeEx={removeEx} prev={prevMap[ex.name]} onInspectExercise={onInspectExercise} />
        ))
      )}

      {totalVolume > 0 && (
        <div style={{
          marginBottom: '10px',
          textAlign: 'right',
          fontSize: '12px',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          color: 'var(--muted)',
          fontWeight: 700,
        }}>
          Total: {Math.round(totalVolume).toLocaleString('de-AT')} kg
        </div>
      )}

      {/* ── Übung hinzufügen ── */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--line)',
        borderRadius: '14px', padding: '12px', marginBottom: '4px',
      }}>
        <ExerciseSearch onSelect={addEx} />
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          <input
            type="text" value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuick()}
            placeholder="bench 3x8@80 rpe7"
            style={{
              flex: 1, padding: '8px 12px',
              background: 'var(--card)', border: '1px solid var(--line)',
              borderRadius: '8px', color: 'var(--ink)',
              fontSize: '13px', fontFamily: 'monospace', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#f59e0b'}
            onBlur={e => e.target.style.borderColor = 'var(--line)'}
          />
          <button onClick={addQuick}
            style={{
              padding: '8px 14px',
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '8px', color: '#f59e0b',
              cursor: 'pointer', fontWeight: 800, fontSize: '16px',
            }}>+</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button onClick={loadLast}
            style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              cursor: 'pointer', fontSize: '11px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
            <RotateCcw size={10} /> Letzte laden
          </button>
        </div>
      </div>

      {/* ── Qualität ── */}
      <SectionHeader>Qualität</SectionHeader>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: '14px', padding: '14px',
      }}>
        {/* Effort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--dim)', flexShrink: 0,
          }}>Effort</span>
          <input type="range" min={1} max={10} value={effort}
            onChange={e => setEffort(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent)' }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '22px', fontWeight: 800,
            color: 'var(--accent)', minWidth: '28px', textAlign: 'right',
          }}>{effort}</span>
        </div>

        {/* Notes */}
        <div style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '6px',
        }}>Notizen</div>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Gefühl, Technik, Schmerzen…"
          style={{
            width: '100%', padding: '10px 12px',
            background: 'var(--bg2)', border: '1px solid var(--line)',
            borderRadius: '10px', color: 'var(--ink)',
            fontSize: '13px', outline: 'none', resize: 'vertical',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--line)'}
        />
      </div>

      {/* Gap hints */}
      {gaps.length > 0 && (
        <div style={{
          marginTop: '12px', padding: '12px', borderRadius: '14px',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
        }}>
          <div style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--red)', marginBottom: '8px',
          }}>Coverage-Lücken</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {gaps.map(g => (
              <span key={g.name} style={{
                fontSize: '12px', padding: '3px 10px', borderRadius: '20px',
                background: 'rgba(239,68,68,0.12)', color: 'var(--red)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}>{g.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Export ── */}
      <SectionHeader>Export</SectionHeader>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: '14px',
        padding: '14px',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)' }}>
              Coach Sheet
            </div>
            <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--muted)' }}>
              Markdown-Export fuer Obsidian oder Archiv.
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportObsidian}
              style={{
                padding: '9px 14px',
                background: 'rgba(94,234,212,0.12)',
                border: '1px solid rgba(94,234,212,0.28)',
                borderRadius: '10px',
                color: 'var(--accent)',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <Download size={14} /> Obsidian Export
            </button>
            <button
              onClick={() => downloadText(
                `fitness-session-${date}.md`,
                buildSessionCoachSheet({ date, block, exercises, effort, location, duration, notes }),
                'text/markdown;charset=utf-8',
              )}
              style={{
                padding: '9px 14px',
                background: 'var(--bg2)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                color: 'var(--ink)',
                fontWeight: 800,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <Download size={14} /> Laden
            </button>
          </div>
        </div>
      </div>

      {/* ── Pflichtaufgabe Export ── */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: '14px', padding: '14px', marginBottom: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
      }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dim)' }}>
            Pflichtaufgabe
          </div>
          <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--muted)' }}>
            Alle Einheiten als CSV (Datum, Einheit, Ort, Dauer)
          </div>
        </div>
        <button
          onClick={async () => {
            try {
              const r = await api.get('/export/pflichtaufgabe')
              if (r?.ok && r.csv) {
                downloadText(r.filename, r.csv, 'text/csv;charset=utf-8')
                showToast(`${r.count} Einheiten exportiert`)
              }
            } catch { showToast('Export fehlgeschlagen') }
          }}
          style={{
            padding: '9px 14px',
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '10px', color: '#f59e0b',
            fontWeight: 800, fontSize: '12px',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
          }}
        >
          <Download size={14} /> CSV Export
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '96px', left: '50%', transform: 'translateX(-50%)',
          padding: '10px 16px', borderRadius: '10px',
          fontSize: '13px', fontWeight: 600,
          background: 'var(--card)', color: 'var(--accent)',
          border: '1px solid var(--line)',
          boxShadow: '0 0 30px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap', zIndex: 50,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
