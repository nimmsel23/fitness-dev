import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { api } from '../api.js'

const MUSCLE_COLORS = {
  'Biceps brachii':    '#a78bfa',
  'Triceps brachii':   '#818cf8',
  'Deltoid':           '#38bdf8',
  'Pectoralis major':  '#f472b6',
  'Latissimus dorsi':  '#34d399',
  'Trapezius':         '#6ee7b7',
  'Rectus abdominis':  '#fbbf24',
  'Quadriceps femoris':'#fb923c',
  'Biceps femoris':    '#f87171',
  'Gluteus maximus':   '#c084fc',
  'Gastrocnemius':     '#67e8f9',
}

function muscleColor(name) {
  return MUSCLE_COLORS[name] || '#7b8ba5'
}

export default function ExerciseSearch({ onSelect, placeholder = 'Übung suchen…' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.length < 2) { setResults([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await api.get(`/fitness/search?q=${encodeURIComponent(query)}&limit=12`)
        setResults(data.results || [])
        setOpen(true)
      } catch { /* silent */ }
      finally { setLoading(false) }
    }, 300)
  }, [query])

  useEffect(() => {
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function pick(ex) {
    setQuery(ex.name)
    setOpen(false)
    onSelect(ex)
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--dim)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-8 py-2 text-sm rounded-lg border transition-colors"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            color: 'var(--ink)',
            outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; if (results.length > 0) setOpen(true) }}
          onBlur={e => { e.target.style.borderColor = 'var(--line)'; setTimeout(() => setOpen(false), 150) }}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2"><span className="spinner" /></span>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl shadow-2xl overflow-hidden overflow-y-auto max-h-64"
          style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
          {results.map(ex => (
            <button key={ex.id} onClick={() => pick(ex)}
              className="w-full text-left px-3 py-2.5 transition-colors border-b last:border-0"
              style={{ borderColor: 'var(--line)', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{ex.name}</div>
              {ex.source && (
                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
                  {ex.source === 'expert' && <span className="text-accent">★ Expert Catalog</span>}
                  {ex.source === 'bulk' && <span>Bulk Library</span>}
                  {ex.source === 'inbox' && <span className="text-orange">Inbox Staging</span>}
                  {ex.source !== 'expert' && ex.source !== 'bulk' && ex.source !== 'inbox' && (
                    ex.source === 'local_yaml' ? 'Local YAML' : ex.source
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-1 mt-1">
                {(ex.primaryMuscles || []).map(m => (
                  <span key={m} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: muscleColor(m) + '22', color: muscleColor(m) }}>
                    {m}
                  </span>
                ))}
                {(ex.secondaryMuscles || []).map(m => (
                  <span key={m} className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--line)', color: 'var(--muted)' }}>
                    {m}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
