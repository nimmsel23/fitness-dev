import { useEffect, useState, useRef } from "react";
import { Dumbbell, Plus, Trash2, Pencil, ChevronRight, Settings2, MoreHorizontal } from "lucide-react";
import { api } from "./api.js";

function WorkoutCard({ w, onOpen, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <article className="relative p-4 rounded-2xl bg-fit-bg2 border border-fit-line hover:border-fit-accent/50 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-fit-accent/10 flex items-center justify-center flex-shrink-0">
          <Dumbbell size={16} className="text-fit-accent" />
        </div>
        <h3 className="flex-1 min-w-0 font-semibold text-fit-ink truncate leading-tight pt-1.5">{w.name}</h3>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="p-1.5 rounded-lg text-fit-muted hover:text-fit-ink hover:bg-fit-card transition-colors"
            aria-label={`${w.name}: Optionen`}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-40 rounded-xl bg-fit-card border border-fit-line shadow-lg overflow-hidden">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRename(w); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-fit-ink hover:bg-fit-bg2 transition-colors"
              >
                <Pencil size={14} /> Umbenennen
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(w.id); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-fit-red hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} /> Löschen
              </button>
            </div>
          )}
        </div>
      </div>

      {w.goal && <p className="text-sm text-fit-muted mb-3 line-clamp-2">{w.goal}</p>}

      <button
        onClick={() => onOpen(w.id)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-fit-card hover:bg-fit-accent/10 text-fit-ink text-sm font-medium transition-colors group"
      >
        <span>{w.exerciseCount ?? 0} Übungen</span>
        <ChevronRight size={16} className="text-fit-muted group-hover:text-fit-accent transition-colors" />
      </button>
    </article>
  );
}

export default function WorkoutList({ onOpen, onSettings }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const d = await api.get("/workouts");
    setWorkouts(d.workouts);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function startEmptyWorkout() {
    const d = await api.post("/workouts", {
      name: `Workout ${new Date().toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" })}`,
      goal: null,
    });
    onOpen(d.id);
  }

  async function renameWorkout(w) {
    const name = prompt("Neuer Name:", w.name);
    if (!name || !name.trim() || name.trim() === w.name) return;
    await api.patch(`/workouts/${w.id}`, { name: name.trim() });
    load();
  }

  async function deleteWorkout(id) {
    if (!confirm("Workout löschen?")) return;
    await api.delete(`/workouts/${id}`);
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <span className="text-xs font-bold text-fit-muted uppercase tracking-wide">Training</span>
          <h1 className="text-2xl font-bold tracking-tight text-fit-ink">Workout beginnen</h1>
        </div>
        <button
          onClick={onSettings}
          className="p-2 rounded-xl text-fit-muted hover:text-fit-ink hover:bg-fit-bg2 transition-colors"
          title="Einstellungen"
        >
          <Settings2 size={18} />
        </button>
      </div>

      {/* Schnellstart */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-fit-muted uppercase tracking-wide mb-3">Schnellstart</h2>
        <button
          onClick={startEmptyWorkout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-fit-accent text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} strokeWidth={3} />
          Ein leeres Workout beginnen
        </button>
      </section>

      {/* Templates */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-fit-muted uppercase tracking-wide">
            Meine Templates {!loading && `(${workouts.length})`}
          </h2>
          <button
            onClick={startEmptyWorkout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-fit-accent hover:bg-fit-accent/10 text-sm font-medium transition-colors"
          >
            <Plus size={15} strokeWidth={2.7} /> Neu
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-fit-muted text-sm">Lädt…</div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-16 text-fit-muted">
            <Dumbbell size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Noch keine Workouts. Erstelle dein erstes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workouts.map((w) => (
              <WorkoutCard key={w.id} w={w} onOpen={onOpen} onRename={renameWorkout} onDelete={deleteWorkout} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
