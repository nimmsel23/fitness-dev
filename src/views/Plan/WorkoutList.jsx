import { useEffect, useState, useRef } from "react";
import { Dumbbell, Plus, Trash2, Pencil, ChevronRight, ChevronDown, Play, Settings2, MoreHorizontal, Sparkles } from "lucide-react";
import { api } from "./api.js";

function RoutineCard({ r, onEdit, onStart, onRename, onDelete }) {
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
        <h3 className="flex-1 min-w-0 font-semibold text-fit-ink truncate leading-tight pt-1.5">{r.name}</h3>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="p-1.5 rounded-lg text-fit-muted hover:text-fit-ink hover:bg-fit-card transition-colors"
            aria-label={`${r.name}: Optionen`}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-40 rounded-xl bg-fit-card border border-fit-line shadow-lg overflow-hidden">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(r.id); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-fit-ink hover:bg-fit-bg2 transition-colors"
              >
                <Pencil size={14} /> Bearbeiten
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRename(r); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-fit-ink hover:bg-fit-bg2 transition-colors"
              >
                <Pencil size={14} /> Umbenennen
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(r.id); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-fit-red hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} /> Löschen
              </button>
            </div>
          )}
        </div>
      </div>

      {r.goal && <p className="text-sm text-fit-muted mb-3 line-clamp-2">{r.goal}</p>}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onStart(r.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-fit-accent text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          <Play size={14} strokeWidth={2.7} /> Start
        </button>
        <button
          onClick={() => onEdit(r.id)}
          className="flex items-center justify-between gap-1 px-3 py-2 rounded-xl bg-fit-card hover:bg-fit-accent/10 text-fit-ink text-sm font-medium transition-colors group"
        >
          <span>{r.exerciseCount ?? 0} Übungen</span>
          <ChevronRight size={16} className="text-fit-muted group-hover:text-fit-accent transition-colors" />
        </button>
      </div>
    </article>
  );
}

function CalisthenicsSkillsSection({ routines, loading, onEdit, onStart, onRename, onDelete }) {
  const [open, setOpen] = useState(false);
  const skillRoutines = routines.filter((r) => r.category === "calisthenics-skill");
  if (!loading && skillRoutines.length === 0) return null;

  return (
    <section className="mb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-3 px-1"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-fit-muted uppercase tracking-wide">
          <Sparkles size={15} className="text-fit-accent" />
          Calisthenics Skills {!loading && `(${skillRoutines.length})`}
        </span>
        <ChevronDown size={16} className={`text-fit-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {skillRoutines.map((r) => (
            <RoutineCard key={r.id} r={r} onEdit={onEdit} onStart={onStart} onRename={onRename} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function WorkoutList({ onEditRoutine, onOpenWorkout, onSettings }) {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const d = await api.get("/routines");
    setRoutines(d.routines);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function quickStart() {
    const d = await api.post("/workouts", {});
    onOpenWorkout(d.id);
  }

  async function startFromRoutine(routineId) {
    const d = await api.post("/workouts", { routine_id: routineId });
    onOpenWorkout(d.id);
  }

  async function renameRoutine(r) {
    const name = prompt("Neuer Name:", r.name);
    if (!name || !name.trim() || name.trim() === r.name) return;
    await api.patch(`/routines/${r.id}`, { name: name.trim() });
    load();
  }

  async function deleteRoutine(id) {
    if (!confirm("Routine löschen?")) return;
    await api.delete(`/routines/${id}`);
    load();
  }

  async function newRoutine() {
    const d = await api.post("/routines", { name: `Routine ${new Date().toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit" })}`, goal: null });
    onEditRoutine(d.id);
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
          onClick={quickStart}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-fit-accent text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} strokeWidth={3} />
          Leeres Workout starten (ohne Vorlage)
        </button>
      </section>

      <CalisthenicsSkillsSection
        routines={routines}
        loading={loading}
        onEdit={onEditRoutine}
        onStart={startFromRoutine}
        onRename={renameRoutine}
        onDelete={deleteRoutine}
      />

      {/* Routinen */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-fit-muted uppercase tracking-wide">
            Meine Routinen {!loading && `(${routines.filter((r) => r.category !== "calisthenics-skill").length})`}
          </h2>
          <button
            onClick={newRoutine}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-fit-accent hover:bg-fit-accent/10 text-sm font-medium transition-colors"
          >
            <Plus size={15} strokeWidth={2.7} /> Neue Routine
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-fit-muted text-sm">Lädt…</div>
        ) : routines.filter((r) => r.category !== "calisthenics-skill").length === 0 ? (
          <div className="text-center py-16 text-fit-muted">
            <Dumbbell size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Noch keine Routinen. Erstelle deine erste Vorlage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {routines.filter((r) => r.category !== "calisthenics-skill").map((r) => (
              <RoutineCard key={r.id} r={r} onEdit={onEditRoutine} onStart={startFromRoutine} onRename={renameRoutine} onDelete={deleteRoutine} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
