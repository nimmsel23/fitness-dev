import { useState, useEffect, useRef } from 'react'
import { Search, X, History, Zap, Dumbbell, Star, Info, Plus } from 'lucide-react'
import { searchExercises, getSessionHistory, getPlanSuggestion } from '@db'

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

export default function ExerciseSearchOverlay({ onSelect, onClose, date }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [recents, setRecents] = useState([])
  const [program, setProgram] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
    
    // Load Recents
    getSessionHistory(30).then(sessions => {
      const seen = new Set()
      const uniqueEx = []
      sessions.forEach(s => {
        (s.exercises || []).forEach(ex => {
          if (ex.name && !seen.has(ex.name)) {
            seen.add(ex.name)
            uniqueEx.push({
              id: ex.id || ex.exercise_id,
              name: ex.name,
              primaryMuscles: ex.primaryMuscles || [],
              source: ex.source || 'recent'
            })
          }
        })
      })
      setRecents(uniqueEx.slice(0, 10))
    })

    // Load Program/Plan
    getPlanSuggestion(date).then(suggestion => {
      if (suggestion?.exercises) {
        setProgram(suggestion.exercises.map(name => ({ name, isPlan: true })))
      }
    })

    // Close on Escape
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [date, onClose])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.length < 2) { 
      setResults([])
      setSelectedIndex(-1)
      return 
    }
    
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchExercises(query, 15)
        setResults(data?.results || [])
        setSelectedIndex(data?.results?.length > 0 ? 0 : -1)
      } catch { /* silent */ }
      finally { setLoading(false) }
    }, 250)
  }, [query])

  const handleKeyDown = (e) => {
    if (results.length === 0) return
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      pick(results[selectedIndex])
    }
  }

  function pick(ex) {
    onSelect(ex)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-bg/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Header / Search Bar */}
      <div className="p-4 border-b border-line/50 bg-card/50 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="relative flex-1 group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-accent transition-colors" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Übung suchen..."
              className="w-full pl-12 pr-12 py-4 bg-bg2 border border-line rounded-2xl text-lg font-bold text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all shadow-xl"
            />
            {loading && (
              <div className="absolute right-14 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
              </div>
            )}
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-line/20 flex items-center justify-center text-dim hover:text-ink hover:bg-line/40 transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-bg2 flex items-center justify-center text-dim hover:text-ink hover:bg-card transition-all border border-line"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-2xl mx-auto space-y-10">
          
          {query.length < 2 ? (
            <>
              {/* Recents Section */}
              {recents.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <History size={14} className="text-accent" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-dim">Zuletzt verwendet</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recents.map(ex => (
                      <button 
                        key={ex.name}
                        onClick={() => pick(ex)}
                        className="group flex flex-col p-4 rounded-3xl bg-card border border-line hover:border-accent/50 hover:bg-accent/5 transition-all text-left shadow-sm active:scale-[0.98]"
                      >
                        <span className="font-bold text-sm text-ink group-hover:text-accent transition-colors">{ex.name}</span>
                        {ex.primaryMuscles?.length > 0 && (
                          <span className="text-[9px] font-bold text-dim/60 mt-1 uppercase tracking-wider">{ex.primaryMuscles.join(' · ')}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Program Section */}
              {program.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <Zap size={14} className="text-orange" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-dim">Geplant für Heute</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {program.map(ex => (
                      <button 
                        key={ex.name}
                        onClick={() => pick(ex)}
                        className="group flex items-center gap-4 p-4 rounded-3xl bg-orange/5 border border-orange/20 hover:border-orange/50 hover:bg-orange/10 transition-all text-left shadow-sm active:scale-[0.98]"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-orange/10 flex items-center justify-center text-orange group-hover:scale-110 transition-transform">
                          <Plus size={20} />
                        </div>
                        <span className="font-bold text-sm text-ink">{ex.name}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Info / Quick Tips */}
              <div className="p-8 rounded-[40px] bg-bg2/50 border border-line border-dashed flex flex-col items-center text-center gap-4 opacity-50">
                <Dumbbell size={32} className="text-dim" />
                <p className="text-xs font-bold text-dim max-w-xs leading-relaxed uppercase tracking-widest">
                  Tippe mindestens 2 Buchstaben um den Experten-Katalog zu durchsuchen.
                </p>
              </div>
            </>
          ) : (
            /* Results Section */
            <section className="space-y-4 pb-20">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-dim">Suchergebnisse</h3>
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{results.length} Treffer</span>
              </div>
              
              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((ex, idx) => (
                    <button
                      key={ex.id || ex.name}
                      onClick={() => pick(ex)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all text-left shadow-sm group ${
                        selectedIndex === idx 
                        ? 'bg-accent/10 border-accent/50 translate-x-1' 
                        : 'bg-card border-line hover:border-line-hover'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-black text-base truncate ${selectedIndex === idx ? 'text-accent' : 'text-ink'}`}>
                            {ex.name}
                          </span>
                          {ex.source === 'expert' && <Star size={12} className="text-accent fill-accent" />}
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(ex.primaryMuscles || []).map(m => (
                            <span key={m} className="text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest"
                              style={{ background: muscleColor(m) + '22', color: muscleColor(m) }}>
                              {m}
                            </span>
                          ))}
                          {ex.source && (
                            <span className={`text-[8px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest border ${
                              ex.source === 'expert' ? 'border-accent/30 text-accent bg-accent/5' : 
                              ex.source === 'bulk' ? 'border-line text-dim/60 bg-bg2' : 
                              'border-orange/30 text-orange bg-orange/5'
                            }`}>
                              {ex.source}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        selectedIndex === idx ? 'bg-accent text-black scale-110 shadow-lg shadow-accent/20' : 'bg-bg2 text-dim'
                      }`}>
                        <Plus size={20} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : !loading && (
                <div className="py-20 flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-line/10 flex items-center justify-center text-dim/30">
                    <Search size={32} />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-dim">Keine Übungen gefunden</p>
                  <button 
                    onClick={() => pick({ name: query, isNew: true })}
                    className="mt-2 btn btn-primary px-8"
                  >
                    "{query}" als neue Übung hinzufügen
                  </button>
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
