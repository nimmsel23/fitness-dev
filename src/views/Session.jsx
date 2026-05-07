import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, RotateCcw, Zap } from 'lucide-react'
import ExerciseSearch from '../components/ExerciseSearch.jsx'
import { api, localToday, parseQuick } from '../api.js'

export default function Session() {
  const [date, setDate]         = useState(localToday())
  const [blocks, setBlocks]     = useState([])
  const [block, setBlock]       = useState('')
  const [exercises, setExercises] = useState([])
  const [effort, setEffort]     = useState(5)
  const [mood, setMood]         = useState('')
  const [notes, setNotes]       = useState('')
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState('')
  const [hint, setHint]         = useState(null)
  const [gaps, setGaps]         = useState([])
  const [quickInput, setQuickInput] = useState('')

  useEffect(() => {
    api.get('/blocks').then(d => { if (d?.blocks) setBlocks(d.blocks) }).catch(() => {})
  }, [])

  useEffect(() => {
    api.get(`/session?date=${date}`).then(d => {
      if (d?.ok && d.data) {
        setBlock(d.data.block || '')
        setExercises(d.data.exercises || [])
        setEffort(d.data.effort ?? 5)
        setMood(d.data.mood || '')
        setNotes(d.data.notes || '')
      } else {
        setBlock(''); setExercises([]); setEffort(5); setMood(''); setNotes('')
      }
    }).catch(() => {})

    api.get(`/plan/today?date=${date}`).then(d => {
      setHint(d?.suggestion || null)
    }).catch(() => {})
  }, [date])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2200) }

  function addEx(ex) {
    setExercises(prev => [...prev, {
      name: ex.name, id: ex.id || '',
      primaryMuscles: ex.primaryMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
      sets: '', reps: '', weight: '', note: '', isHIT: false,
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

  async function loadLast() {
    try {
      const r = await api.get('/session/latest')
      if (!r?.session?.data) { showToast('Keine vorherige Session'); return }
      const d = r.session.data
      setBlock(d.block || '')
      setExercises(d.exercises || [])
      showToast('Letzte Session geladen')
    } catch { showToast('Fehler beim Laden') }
  }

  async function save() {
    setSaving(true)
    try {
      await api.post(`/session?date=${date}`, { block, exercises, effort, mood, notes })
      showToast('Gespeichert ✓')
      const r = await api.get('/coverage/gaps?days=7')
      setGaps(r?.gaps || [])
    } catch { showToast('Fehler beim Speichern') }
    finally { setSaving(false) }
  }

  return (
    <div>
      {/* Date + Save */}
      <div className="flex gap-2 mb-4">
        <input
          type="date" value={date} max={localToday()}
          onChange={e => setDate(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl text-sm"
          style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)', outline: 'none' }}
        />
        <button onClick={save} disabled={saving}
          className="px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-1.5"
          style={{ background: 'var(--accent)', color: '#080b12', opacity: saving ? 0.6 : 1 }}>
          <Save size={14} /> {saving ? '…' : 'Speichern'}
        </button>
      </div>

      {/* Plan hint */}
      {hint && (
        <div className="mb-3 px-3 py-2 rounded-xl flex items-center gap-2 text-sm"
          style={{ background: 'var(--accent)' + '15', border: '1px solid var(--accent)' + '33' }}>
          <Zap size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ color: 'var(--accent)' }}>{hint.block}</span>
          <span style={{ color: 'var(--muted)' }}>{(hint.exercises || []).slice(0,3).join(', ')}</span>
        </div>
      )}

      {/* Block selector */}
      <div className="mb-4 p-3 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Split</div>
        <div className="flex flex-wrap gap-1.5">
          {blocks.map(b => (
            <button key={b.id} onClick={() => setBlock(b.label)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: block === b.label ? 'var(--accent)' + '25' : 'var(--bg2)',
                color: block === b.label ? 'var(--accent)' : 'var(--muted)',
                border: `1px solid ${block === b.label ? 'var(--accent)' + '66' : 'var(--line)'}`,
              }}>
              {b.label}
            </button>
          ))}
          {!blocks.length && ['Push','Pull','Legs','Upper','Lower','Full'].map(l => (
            <button key={l} onClick={() => setBlock(l)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: block === l ? 'var(--accent)' + '25' : 'var(--bg2)',
                color: block === l ? 'var(--accent)' : 'var(--muted)',
                border: `1px solid ${block === l ? 'var(--accent)' + '66' : 'var(--line)'}`,
              }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Quick Parse */}
      <div className="mb-4 p-3 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Übung hinzufügen</div>
        <ExerciseSearch onSelect={addEx} />
        <div className="flex gap-2 mt-2">
          <input type="text" value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuick()}
            placeholder="bench 3x8@80 rpe7"
            className="flex-1 px-3 py-2 text-sm rounded-lg"
            style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)', outline: 'none' }}
          />
          <button onClick={addQuick}
            className="px-3 py-2 rounded-lg font-bold"
            style={{ background: 'var(--accent)' + '22', color: 'var(--accent)', border: '1px solid var(--accent)' + '44' }}>
            <Plus size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px]" style={{ color: 'var(--dim)' }}>Name SetsxReps@kg (z.B. bench 4x6@100)</span>
          <button onClick={loadLast} className="flex items-center gap-1 text-[10px] font-semibold"
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
            <RotateCcw size={10} /> Letzte laden
          </button>
        </div>
      </div>

      {/* Exercise table */}
      {exercises.length > 0 && (
        <div className="mb-4 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ background: 'var(--card)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Übung','HIT','Sets','Reps','kg','Notiz',''].map(h => (
                    <th key={h} className="px-2 py-2 text-left font-semibold" style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exercises.map((ex, i) => (
                  <tr key={i} style={{ borderBottom: i < exercises.length-1 ? '1px solid var(--line)' : 'none' }}>
                    <td className="px-2 py-1.5" style={{ color: 'var(--ink)', fontWeight: 500, maxWidth: '110px' }}>
                      <div className="truncate">{ex.name || '—'}</div>
                      {(ex.primaryMuscles||[]).length > 0 && (
                        <div className="text-[9px] mt-0.5 truncate" style={{ color: 'var(--accent)' }}>
                          {ex.primaryMuscles.slice(0,2).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input type="checkbox" checked={ex.isHIT || false}
                        onChange={e => updateEx(i, 'isHIT', e.target.checked)}
                        style={{ accentColor: 'var(--accent)', cursor: 'pointer' }} />
                    </td>
                    {['sets','reps','weight'].map(f => (
                      <td key={f} className="px-1 py-1.5">
                        <input type="number" value={ex[f] || ''}
                          onChange={e => updateEx(i, f, e.target.value)}
                          disabled={ex.isHIT && (f === 'sets' || f === 'reps')}
                          placeholder="—"
                          className="rounded text-center"
                          style={{
                            width: '38px', background: 'var(--bg2)',
                            border: '1px solid var(--line)', color: 'var(--ink)',
                            outline: 'none', padding: '2px 4px',
                            opacity: ex.isHIT && (f === 'sets' || f === 'reps') ? 0.35 : 1,
                          }}
                        />
                      </td>
                    ))}
                    <td className="px-1 py-1.5">
                      <input type="text" value={ex.note || ''}
                        onChange={e => updateEx(i, 'note', e.target.value)}
                        placeholder="RPE…"
                        className="rounded"
                        style={{ width: '72px', background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)', outline: 'none', padding: '2px 6px' }}
                      />
                    </td>
                    <td className="px-1 py-1.5">
                      <button onClick={() => removeEx(i)}
                        style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: '2px' }}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Effort */}
      <div className="mb-4 p-3 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <div className="text-[10px] font-semibold uppercase tracking-widest mb-1 flex justify-between" style={{ color: 'var(--muted)' }}>
          <span>Effort</span><span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{effort}/10</span>
        </div>
        <input type="range" min={1} max={10} value={effort}
          onChange={e => setEffort(Number(e.target.value))}
          className="w-full" style={{ accentColor: 'var(--accent)' }}
        />
        <div className="flex justify-between text-[9px] mt-0.5" style={{ color: 'var(--dim)' }}>
          <span>Leicht</span><span>Maximal</span>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Gefühl, Technik, Schmerzen…"
          className="w-full px-3 py-2 text-sm rounded-2xl resize-none"
          style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)', outline: 'none' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--line)'}
        />
      </div>

      {/* Gap hints (after save) */}
      {gaps.length > 0 && (
        <div className="mb-4 p-3 rounded-2xl" style={{ background: 'var(--red)' + '10', border: '1px solid var(--red)' + '30' }}>
          <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--red)' }}>Coverage-Lücken</div>
          <div className="flex flex-wrap gap-1.5">
            {gaps.map(g => (
              <span key={g.name} className="text-xs px-2 py-0.5 rounded-lg"
                style={{ background: 'var(--red)' + '20', color: 'var(--red)' }}>
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium shadow-xl z-50"
          style={{ background: 'var(--card)', color: 'var(--accent)', border: '1px solid var(--line)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
