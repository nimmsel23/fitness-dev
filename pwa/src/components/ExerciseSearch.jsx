import { useState, useEffect, useRef } from 'react';
import { Search, Plus } from 'lucide-react';
import { getAllExercises } from '../db.js';

function muscleColor(name) {
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
  };
  return MUSCLE_COLORS[name] || '#7b8ba5';
}

export default function ExerciseSearch({ onSelect, placeholder = 'Übung suchen…' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    getAllExercises().then(setAll).catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => {
      const filtered = all.filter(ex => 
        (ex.name || '').toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15);
      setResults(filtered);
      setOpen(true);
    }, 200);
  }, [query, all]);

  useEffect(() => {
    function onOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function pick(ex) {
    setQuery('');
    setOpen(false);
    onSelect(ex);
  }

  function handleAddNew() {
    onSelect({ name: query, id: 'new_' + Date.now(), isNew: true });
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--dim)]" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-[var(--bg2)] border border-[var(--line)] text-[var(--ink)] outline-none focus:border-[var(--accent)] transition-colors"
          onFocus={() => { if (results.length > 0) setOpen(true); }}
        />
      </div>

      {open && (
        <div className="absolute z-[100] left-0 right-0 mt-2 rounded-xl shadow-2xl overflow-hidden overflow-y-auto max-h-64 bg-[var(--card)] border border-[var(--line)]">
          {results.length > 0 ? (
            results.map(ex => (
              <button key={ex.id} onClick={() => pick(ex)}
                className="w-full text-left px-4 py-3 transition-colors border-b last:border-0 border-[var(--line)] hover:bg-[var(--card-hover)]"
              >
                <div className="text-sm font-black text-[var(--ink)]">{ex.name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(ex.primaryMuscles || []).map(m => (
                    <span key={m} className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest"
                      style={{ background: muscleColor(m) + '22', color: muscleColor(m) }}>
                      {m}
                    </span>
                  ))}
                </div>
              </button>
            ))
          ) : (
            <button onClick={handleAddNew}
              className="w-full text-left px-4 py-4 flex items-center gap-3 transition-colors hover:bg-[var(--card-hover)]"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <Plus size={18} />
              </div>
              <div>
                <div className="text-sm font-black text-[var(--ink)]">"{query}" hinzufügen</div>
                <div className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-tight">Übung existiert noch nicht</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
