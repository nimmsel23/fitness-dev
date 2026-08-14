import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { api } from "../api.js";
import { muskelDe, muskelColor, dedupeMuskeln } from "../muscles.js";
import ExercisePhotoStrip from "../../../components/ExercisePhotoStrip.jsx";

export default function ExerciseSearch({ onAdd, exclude = [] }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (q.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const d = await api.get(`/exercises?q=${encodeURIComponent(q)}&limit=12`);
        setResults(d.results.filter((e) => !exclude.includes(e.id)));
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  async function wähle(ex) {
    setAdding(true);
    setError("");
    try {
      await onAdd(ex);
      setQ("");
      setResults([]);
      setOpen(false);
    } catch (err) {
      setError(err?.message || "Hinzufügen fehlgeschlagen");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-fit-muted pointer-events-none" />
        <input
          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-fit-card border border-fit-line text-fit-ink placeholder:text-fit-muted focus:outline-none focus:border-fit-accent text-sm transition-colors"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Übung suchen…"
        />
        {q && (
          <button onClick={() => { setQ(""); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-fit-muted hover:text-fit-ink">
            <X size={14} />
          </button>
        )}
      </div>

      {error && (
        <div className="mt-1.5 text-xs text-red-400">{error}</div>
      )}

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-fit-bg2 border border-fit-line rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {loading && <div className="px-4 py-2 text-xs text-fit-muted">Suche…</div>}
          {results.map((ex) => (
            <button
              key={ex.id}
              onClick={() => wähle(ex)}
              disabled={adding}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-700 border-b border-fit-line/50 last:border-0 transition-colors disabled:opacity-50"
            >
              <ExercisePhotoStrip ex={ex} className="h-16 w-28 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-fit-ink truncate">{ex.name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dedupeMuskeln(ex.primaryMuscles).slice(0, 3).map((m) => (
                    <span key={m} className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                      style={{ background: muskelColor(m) + "22", color: muskelColor(m) }}>
                      {muskelDe(m)}
                    </span>
                  ))}
                </div>
              </div>
              {ex.equipment && (
                <span className="text-xs text-fit-muted flex-shrink-0 mt-0.5">{ex.equipment}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
