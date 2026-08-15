import { useState, useEffect } from 'react';
import { Dumbbell, Search, Loader2, Sparkles, Brain, Save, ExternalLink, Activity } from 'lucide-react';
import { searchExercises, getAnatomy, saveExercise } from '@db';

export default function CatalogBrowser({ onInspectExercise }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [anatomy, setAnatomy] = useState(null);
  const [loadingAnatomy, setLoadingAnatomy] = useState(false);
  
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  };

  // Search Debounce
  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchExercises(searchQuery, 50);
        setResults(data?.results || []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load Anatomy & Details when an exercise is selected
  useEffect(() => {
    if (!selectedExercise) {
      setAnatomy(null);
      return;
    }
    const exId = selectedExercise.exercise_id || selectedExercise.id;
    setEditNotes(selectedExercise.notes || selectedExercise.description || '');
    
    setLoadingAnatomy(true);
    getAnatomy(exId)
      .then((ana) => setAnatomy(ana))
      .catch(() => setAnatomy(null))
      .finally(() => setLoadingAnatomy(false));
  }, [selectedExercise]);

  async function handleSaveExercise() {
    if (!selectedExercise) return;
    const exId = selectedExercise.exercise_id || selectedExercise.id;
    setSaving(true);
    try {
      const updated = {
        ...selectedExercise,
        notes: editNotes,
        updated_at: new Date().toISOString(),
      };
      await saveExercise(exId, updated);
      setSelectedExercise(updated);
      showToast('Übung im Katalog gespeichert ✓');
    } catch {
      showToast('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] border border-fit-line/30 rounded-2xl overflow-hidden bg-fit-bg">
      {/* Left Sidebar: Search & Results */}
      <div className="w-80 border-r border-fit-line/30 bg-fit-bg2/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-fit-line/30 relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-fit-dim" size={16} />
          <input
            type="text"
            placeholder="Übung suchen..."
            className="w-full bg-fit-bg border border-fit-line rounded-xl py-2 pl-10 pr-10 text-sm focus:outline-none focus:border-fit-accent transition-colors text-fit-ink"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading && <Loader2 className="absolute right-7 top-1/2 -translate-y-1/2 text-fit-accent animate-spin" size={16} />}
        </div>

        <div className="flex-1 overflow-y-auto">
          {results.length === 0 && !loading && (
            <div className="p-8 text-center text-fit-dim text-xs">
              Keine Ergebnisse gefunden.
            </div>
          )}
          <ul className="divide-y divide-fit-line/20">
            {results.map((ex) => {
              const exId = ex.exercise_id || ex.id;
              const isSelected = selectedExercise && (selectedExercise.exercise_id || selectedExercise.id) === exId;
              const primary = ex.primary_muscles || ex.primaryMuscles || [];
              return (
                <li
                  key={exId}
                  className={`p-3.5 transition-all cursor-pointer group border-l-4 ${isSelected ? 'bg-fit-accent/10 border-l-fit-accent' : 'border-l-transparent hover:bg-fit-bg'}`}
                  onClick={() => setSelectedExercise(ex)}
                >
                  <div className={`text-xs font-black truncate ${isSelected ? 'text-fit-accent' : 'text-fit-ink group-hover:text-fit-accent'}`}>
                    {ex.display_name || ex.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-mono font-black uppercase tracking-wider text-fit-dim bg-fit-bg2 border border-fit-line/40 rounded px-1.5 py-0.5">
                      {ex.source || 'wger'}
                    </span>
                    {primary.length > 0 && (
                      <span className="text-[10px] text-fit-dim/80 truncate font-mono">
                        {primary[0]} {primary.length > 1 ? `+${primary.length - 1}` : ''}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Main Content: Exercise Enhancer & Detail View */}
      <div className="flex-1 p-6 overflow-y-auto relative bg-fit-bg space-y-6">
        {selectedExercise ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-fit-line/30 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-fit-accent/10 border border-fit-accent/30 text-fit-accent">
                    {selectedExercise.source || 'wger'}
                  </span>
                  <span className="text-xs font-mono text-fit-dim/60">ID: {selectedExercise.exercise_id || selectedExercise.id}</span>
                </div>
                <h2 className="text-2xl font-black text-fit-ink tracking-tight">
                  {selectedExercise.display_name || selectedExercise.name}
                </h2>
                {selectedExercise.german && selectedExercise.german !== selectedExercise.display_name && (
                  <p className="text-xs text-fit-dim font-medium mt-0.5">DE: {selectedExercise.german}</p>
                )}
              </div>

              {onInspectExercise && (
                <button
                  onClick={() => onInspectExercise(selectedExercise)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-fit-bg2 border border-fit-line/60 rounded-xl text-xs font-bold text-fit-ink hover:border-fit-accent transition-all shrink-0"
                >
                  <ExternalLink size={14} className="text-fit-accent" /> Detail Inspector öffnen
                </button>
              )}
            </div>

            {/* Muscle Breakdown Badges */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-fit-bg2/50 p-4 rounded-2xl border border-fit-line/20 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-fit-dim tracking-wider">
                  <Activity size={14} className="text-fit-accent" /> Primary Muscles
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedExercise.primary_muscles || selectedExercise.primaryMuscles || []).length > 0 ? (
                    (selectedExercise.primary_muscles || selectedExercise.primaryMuscles || []).map((m, idx) => (
                      <span key={idx} className="text-xs font-mono font-bold px-2.5 py-1 bg-fit-accent/15 border border-fit-accent/30 text-fit-accent rounded-lg">
                        {m}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-fit-dim italic opacity-50">Keine angegeben</span>
                  )}
                </div>
              </div>

              <div className="bg-fit-bg2/50 p-4 rounded-2xl border border-fit-line/20 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-fit-dim tracking-wider">
                  <Activity size={14} className="text-fit-dim" /> Secondary Muscles
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedExercise.secondary_muscles || selectedExercise.secondaryMuscles || []).length > 0 ? (
                    (selectedExercise.secondary_muscles || selectedExercise.secondaryMuscles || []).map((m, idx) => (
                      <span key={idx} className="text-xs font-mono font-medium px-2.5 py-1 bg-fit-bg2 border border-fit-line/40 text-fit-ink rounded-lg">
                        {m}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-fit-dim italic opacity-50">Keine angegeben</span>
                  )}
                </div>
              </div>
            </div>

            {/* Anatomical Cues & Teaching KB */}
            <div className="bg-fit-bg2/40 p-5 rounded-2xl border border-fit-line/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-fit-ink tracking-wider">
                <Brain size={16} className="text-fit-accent" /> Biomechanik & Coaching Cues
              </div>

              {loadingAnatomy ? (
                <div className="flex items-center gap-2 text-xs text-fit-dim py-4">
                  <Loader2 size={16} className="animate-spin text-fit-accent" /> Anatomie-KB wird geladen…
                </div>
              ) : anatomy ? (
                <div className="space-y-3 text-xs leading-relaxed text-fit-ink font-medium">
                  {anatomy.coaching_cues && anatomy.coaching_cues.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase text-fit-dim block mb-1">Cues:</span>
                      <ul className="list-disc list-inside space-y-1 text-fit-ink/90 pl-1">
                        {anatomy.coaching_cues.map((cue, cIdx) => (
                          <li key={cIdx}>{cue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {anatomy.common_errors && anatomy.common_errors.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase text-fit-dim block mb-1">Häufige Fehler:</span>
                      <ul className="list-disc list-inside space-y-1 text-fit-ink/90 pl-1">
                        {anatomy.common_errors.map((err, eIdx) => (
                          <li key={eIdx}>
                            <strong className="text-fit-ink">{err.error || err.name}:</strong> {err.correction || err.coaching_cue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-fit-dim italic">Keine vertieften Anatomie-Cues hinterlegt.</p>
              )}
            </div>

            {/* Coach Notes & Enhancer Editor */}
            <div className="bg-fit-bg2/60 p-5 rounded-2xl border border-fit-line/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-fit-ink tracking-wider">
                  <Sparkles size={16} className="text-fit-accent" /> Katalog Enhancer Notizen
                </div>
                <button
                  onClick={handleSaveExercise}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-fit-accent text-black rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? 'Speichern…' : <><Save size={12} /> Speichern</>}
                </button>
              </div>

              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Coaching-Notizen oder Anpassungen für diese Übung eingeben..."
                className="w-full bg-fit-bg border border-fit-line focus:border-fit-accent rounded-xl p-3 text-xs text-fit-ink outline-none transition-all resize-none h-24 font-medium"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
            <Dumbbell className="w-12 h-12 text-fit-dim" />
            <h3 className="text-xl font-black text-fit-dim">Katalog Enhancer</h3>
            <p className="text-xs max-w-sm leading-relaxed">
              Wähle links eine Übung aus, um sie detailliert zu bearbeiten (Biomechanik, Anatomie-Cues, Metadaten).
            </p>
          </div>
        )}

        {toastMsg && (
          <div className="fixed bottom-12 right-12 px-4 py-2 bg-fit-card border border-fit-accent text-fit-accent text-xs font-extrabold rounded-xl shadow-xl animate-in fade-in duration-200">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}
