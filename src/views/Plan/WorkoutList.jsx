import { useEffect, useState, useRef } from "react";
import { Dumbbell, Plus, Trash2, Pencil, ChevronDown, Play, Settings2, MoreHorizontal, Sparkles, Check, Target } from "lucide-react";
import { api } from "./api.js";
import { muskelDe, muskelColor, dedupeMuskeln } from "../../lib/muscleLabels.js";
import { countCompletionsInPeriod, computeHabitProgress, pickNextRoutine } from "../../lib/habitProgress.js";

function RoutineCard({ r, onEdit, onStart, onRename, onDelete, onQuickComplete, onSetTarget, completingId, workouts }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const completing = completingId === r.id;

  // GET /routines liefert bewusst keine exercises (nur exerciseCount) —
  // Vorschau lädt sie deshalb erst on-demand beim Aufklappen nach, damit
  // man vor "Start"/"Heute erledigt" tatsächlich sieht, was drin ist.
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewExercises, setPreviewExercises] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  async function togglePreview() {
    const next = !previewOpen;
    setPreviewOpen(next);
    if (next && previewExercises === null) {
      setPreviewLoading(true);
      try {
        const d = await api.get(`/routines/${r.id}`);
        setPreviewExercises(d.routine?.exercises || []);
      } finally {
        setPreviewLoading(false);
      }
    }
  }

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
            <div className="absolute right-0 top-9 z-10 w-48 rounded-xl bg-fit-card border border-fit-line shadow-lg overflow-hidden">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onQuickComplete(r); }}
                disabled={completing}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-fit-ink hover:bg-fit-bg2 transition-colors disabled:opacity-50"
              >
                <Check size={14} className="text-fit-accent" /> {completing ? 'Speichert…' : 'Heute als erledigt markieren'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onSetTarget(r); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-fit-ink hover:bg-fit-bg2 transition-colors"
              >
                <Target size={14} /> Ziel festlegen
              </button>
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

      {r.targetCount > 0 && r.targetPeriodDays > 0 && (() => {
        const done = countCompletionsInPeriod(r.id, workouts, r.targetPeriodDays);
        const met = done >= r.targetCount;
        return (
          <div className={`flex items-center gap-1.5 mb-3 text-xs font-semibold ${met ? 'text-green-500' : 'text-fit-accent'}`}>
            <Target size={13} />
            {done}/{r.targetCount} in {r.targetPeriodDays} Tagen {met && '· erfüllt'}
          </div>
        );
      })()}

      <button
        onClick={togglePreview}
        className="w-full flex items-center justify-between gap-1 px-3 py-2 mb-2 rounded-xl bg-fit-card hover:bg-fit-accent/10 text-fit-ink text-sm font-medium transition-colors"
      >
        <span>{r.exerciseCount ?? 0} Übungen ansehen</span>
        <ChevronDown size={16} className={`text-fit-muted transition-transform ${previewOpen ? "rotate-180" : ""}`} />
      </button>

      {previewOpen && (
        <div className="mb-3 rounded-xl bg-fit-bg border border-fit-line/50 divide-y divide-fit-line/30 animate-in fade-in slide-in-from-top-1 duration-150">
          {previewLoading ? (
            <div className="px-3 py-3 text-xs text-fit-muted text-center">Lädt…</div>
          ) : !previewExercises?.length ? (
            <div className="px-3 py-3 text-xs text-fit-muted text-center">Noch keine Übungen in dieser Routine.</div>
          ) : (
            previewExercises.map((ex) => (
              <div key={ex.id} className="px-3 py-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-fit-ink truncate">{ex.name}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dedupeMuskeln(ex.primaryMuscles).slice(0, 2).map((m) => (
                      <span key={m} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: muskelColor(m) + "22", color: muskelColor(m) }}>
                        {muskelDe(m)}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs font-mono text-fit-muted shrink-0">
                  {ex.target_sets ?? 3}×{ex.target_reps ?? "8-12"}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => onStart(r.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-fit-accent text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          <Play size={14} strokeWidth={2.7} /> Start
        </button>
        <button
          onClick={() => onQuickComplete(r)}
          disabled={completing}
          title="Heute als erledigt markieren, ohne Sätze einzeln einzutragen"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-fit-card hover:bg-fit-accent/10 text-fit-ink text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Check size={14} className={completing ? 'animate-pulse' : ''} />
        </button>
        <button
          onClick={() => onEdit(r.id)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-fit-card hover:bg-fit-accent/10 text-fit-ink text-sm font-medium transition-colors"
          title="Routine bearbeiten"
        >
          <Pencil size={14} />
        </button>
      </div>
    </article>
  );
}

function CalisthenicsSkillsSection({ routines, loading, onEdit, onStart, onRename, onDelete, onQuickComplete, onSetTarget, completingId, workouts }) {
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
            <RoutineCard key={r.id} r={r} onEdit={onEdit} onStart={onStart} onRename={onRename} onDelete={onDelete} onQuickComplete={onQuickComplete} onSetTarget={onSetTarget} completingId={completingId} workouts={workouts} />
          ))}
        </div>
      )}
    </section>
  );
}

// "Pensum" = alle Routinen mit gesetztem Ziel gelten als erfüllt, wenn jede
// ihre eigene Ziel-Häufigkeit im eigenen Zeitraum erreicht hat (jede Routine
// kann ihr eigenes Zeitfenster haben, kein gemeinsamer Kalenderzeitraum).
// Logik in lib/habitProgress.js, geteilt mit Coach/ClientsPanel.jsx.
function PensumSummary({ routines, workouts }) {
  const { rows, allMet } = computeHabitProgress(routines, workouts);
  if (rows.length === 0) return null;

  return (
    <section className="mb-8">
      <div className={`rounded-2xl border p-4 ${allMet ? 'bg-green-500/10 border-green-500/30' : 'bg-fit-bg2 border-fit-line'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className={allMet ? 'text-green-500' : 'text-fit-accent'} />
          <h2 className="text-sm font-bold text-fit-ink">Pensum {allMet ? 'erfüllt ✓' : ''}</h2>
        </div>
        <div className="space-y-1.5">
          {rows.map(({ routine: r, done }) => (
            <div key={r.id} className="flex items-center justify-between text-xs">
              <span className="font-medium text-fit-ink">{r.name}</span>
              <span className={done >= r.targetCount ? 'text-green-500 font-semibold' : 'text-fit-muted'}>
                {done}/{r.targetCount} in {r.targetPeriodDays} Tagen
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NextUpCard({ routine, onQuickComplete, onStart, completing }) {
  const [exercises, setExercises] = useState(null);

  useEffect(() => {
    let alive = true;
    api.get(`/routines/${routine.id}`).then((d) => {
      if (alive) setExercises(d.routine?.exercises || []);
    });
    return () => { alive = false; };
  }, [routine.id]);

  return (
    <section className="mb-8">
      <h2 className="text-sm font-bold text-fit-muted uppercase tracking-wide mb-3">Heute dran</h2>
      <div className="rounded-2xl bg-fit-accent/10 border border-fit-accent/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-fit-accent/20">
          <div className="text-lg font-bold text-fit-ink">{routine.name}</div>
          {routine.goal && <p className="text-xs text-fit-dim mt-0.5">{routine.goal}</p>}
        </div>

        {exercises === null ? (
          <div className="px-4 py-4 text-xs text-fit-muted text-center">Lädt…</div>
        ) : exercises.length === 0 ? (
          <div className="px-4 py-4 text-xs text-fit-muted text-center">Keine Übungen hinterlegt</div>
        ) : (
          <div className="divide-y divide-fit-line/20">
            {exercises.map((ex) => (
              <div key={ex.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-fit-ink truncate">{ex.name}</span>
                <span className="text-xs font-mono text-fit-dim shrink-0">{ex.target_sets ?? 3}×{ex.target_reps ?? "8-12"}</span>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 flex gap-2">
          <button
            onClick={() => onQuickComplete(routine)}
            disabled={completing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-fit-accent text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Check size={16} strokeWidth={2.7} /> {completing ? 'Speichert…' : `${routine.name} erledigt`}
          </button>
          <button
            onClick={() => onStart(routine.id)}
            className="px-4 py-3 rounded-xl bg-fit-card text-fit-ink text-sm font-medium hover:bg-fit-bg2 transition-colors"
          >
            Frei loggen
          </button>
        </div>
      </div>
    </section>
  );
}

// Fallback-Kette wie in WorkoutSession.jsx's SetRow.toggleCompleted(): echter
// Wert > letzte Performance (ghost) > Template-Zielwert. Beim Quick-Complete
// gibt es keine Eingabe, deshalb übernimmt jeder Satz automatisch den besten
// verfügbaren Wert aus dieser Kette statt leer zu bleiben.
function fillCompletedSet(s) {
  return {
    ...s,
    completed: true,
    reps: s.reps ?? s.ghostReps ?? s.targetReps ?? null,
    weight: s.weight ?? s.ghostWeight ?? s.targetWeight ?? null,
    distance: s.distance ?? s.ghostDistance ?? s.targetDistance ?? null,
    duration: s.duration ?? s.ghostDuration ?? s.targetDuration ?? null,
  };
}

export default function WorkoutList({ onEditRoutine, onOpenWorkout, onSettings }) {
  const [routines, setRoutines] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2400);
  };

  async function load() {
    setLoading(true);
    const [routinesRes, workoutsRes] = await Promise.all([
      api.get("/routines"),
      api.get("/workouts"),
    ]);
    setRoutines(routinesRes.routines);
    setWorkouts(workoutsRes.workouts || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const nextRoutine = !loading ? pickNextRoutine(routines, workouts) : null;

  async function quickStart() {
    const d = await api.post("/workouts", {});
    onOpenWorkout(d.id);
  }

  async function startFromRoutine(routineId) {
    const d = await api.post("/workouts", { routine_id: routineId });
    onOpenWorkout(d.id);
  }

  // Alternative zum vollen WorkoutSession-Log: Routine wird direkt als
  // "heute erledigt" gespeichert, jeder Satz übernimmt automatisch den
  // besten verfügbaren Wert (siehe fillCompletedSet) statt Satz für Satz
  // manuell einzutragen. Bleibt auf WorkoutList, keine Navigation.
  async function quickComplete(routine) {
    setCompletingId(routine.id);
    try {
      const created = await api.post("/workouts", { routine_id: routine.id });
      const { workout } = await api.get(`/workouts/${created.id}`);
      const exercises = (workout.exercises || []).map((ex) => ({
        ...ex,
        sets: (ex.sets || []).map(fillCompletedSet),
      }));
      await api.patch(`/workouts/${created.id}`, {
        exercises,
        finished_at: new Date().toISOString(),
        sessionState: "completed",
      });
      showToast(`${routine.name} erledigt ✓`);
    } catch {
      showToast('Fehler beim Speichern');
    } finally {
      setCompletingId(null);
    }
  }

  async function setRoutineTarget(r) {
    const countStr = prompt(`Wie oft soll "${r.name}" im Zeitraum erledigt werden?`, r.targetCount || "2");
    if (countStr === null) return;
    const count = Number(countStr);
    if (!Number.isFinite(count) || count <= 0) return;
    const daysStr = prompt(`In wie vielen Tagen (rollierendes Fenster)?`, r.targetPeriodDays || "7");
    if (daysStr === null) return;
    const days = Number(daysStr);
    if (!Number.isFinite(days) || days <= 0) return;
    await api.patch(`/routines/${r.id}`, { targetCount: count, targetPeriodDays: days });
    load();
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

      {nextRoutine && (
        <NextUpCard
          routine={nextRoutine}
          onQuickComplete={quickComplete}
          onStart={startFromRoutine}
          completing={completingId === nextRoutine.id}
        />
      )}

      <PensumSummary routines={routines} workouts={workouts} />

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
        onQuickComplete={quickComplete}
        onSetTarget={setRoutineTarget}
        completingId={completingId}
        workouts={workouts}
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
              <RoutineCard key={r.id} r={r} onEdit={onEditRoutine} onStart={startFromRoutine} onRename={renameRoutine} onDelete={deleteRoutine} onQuickComplete={quickComplete} onSetTarget={setRoutineTarget} completingId={completingId} workouts={workouts} />
            ))}
          </div>
        )}
      </section>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg z-50 bg-fit-card text-fit-accent border border-fit-line animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
