import { useEffect, useState } from "react";
import { Dumbbell, Plus, Trash2, ChevronRight } from "lucide-react";
import { api } from "../api.js";

export default function WorkoutList({ onOpen }) {
  const [workouts, setWorkouts] = useState([]);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const d = await api.get("/workouts");
    setWorkouts(d.workouts);
  }

  useEffect(() => { load(); }, []);

  async function erstellen(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const d = await api.post("/workouts", { name: name.trim(), goal: goal.trim() || null });
      onOpen(d.id);
    } finally {
      setCreating(false);
    }
  }

  async function löschen(id, e) {
    e.stopPropagation();
    if (!confirm("Workout löschen?")) return;
    await api.delete(`/workouts/${id}`);
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-forge-accent/20 flex items-center justify-center">
          <Dumbbell size={20} className="text-forge-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">WorkoutForge</h1>
          <p className="text-sm text-forge-muted">{workouts.length} Workouts</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-forge-accent text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Neu
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={erstellen} className="mb-6 p-4 rounded-2xl bg-forge-panel border border-forge-border flex flex-col gap-3">
          <input
            className="w-full px-4 py-2.5 rounded-xl bg-forge-bg border border-forge-border text-forge-ink placeholder:text-forge-muted focus:outline-none focus:border-forge-accent text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (z.B. Push A · Fullbody · Beine)"
            autoFocus
          />
          <input
            className="w-full px-4 py-2.5 rounded-xl bg-forge-bg border border-forge-border text-forge-ink placeholder:text-forge-muted focus:outline-none focus:border-forge-accent text-sm"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Ziel (z.B. Hypertrophie, Kraft, PPL)"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-forge-muted hover:text-forge-ink text-sm transition-colors">
              Abbrechen
            </button>
            <button type="submit" disabled={creating || !name.trim()}
              className="px-5 py-2 rounded-xl bg-forge-accent text-white font-semibold text-sm hover:bg-blue-600 disabled:opacity-40 transition-colors">
              {creating ? "..." : "Erstellen"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {workouts.length === 0 ? (
        <div className="text-center py-20 text-forge-muted">
          <Dumbbell size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Noch keine Workouts. Erstelle dein erstes.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {workouts.map((w) => (
            <button
              key={w.id}
              onClick={() => onOpen(w.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-forge-panel border border-forge-border hover:border-forge-accent/50 hover:bg-slate-800 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-forge-accent/10 flex items-center justify-center flex-shrink-0">
                <Dumbbell size={18} className="text-forge-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-forge-ink truncate">{w.name}</div>
                {w.goal && <div className="text-xs text-forge-muted mt-0.5">{w.goal}</div>}
              </div>
              <ChevronRight size={16} className="text-forge-muted group-hover:text-forge-accent transition-colors flex-shrink-0" />
              <button
                onClick={(e) => löschen(w.id, e)}
                className="p-1.5 rounded-lg text-forge-muted hover:text-forge-red hover:bg-red-500/10 transition-all flex-shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
