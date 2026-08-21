import { useEffect, useState } from "react";
import { Plus, Target, Trash2, CheckCircle2 } from "lucide-react";
import {
  getMacrocycle, deleteMacrocycle, addRoutine, updateRoutine, deleteRoutine, getUid, getClientRoutine, saveWorkoutFeedback,
} from "@db";
import { api } from "../api.js";
import { countCompletionsInPeriod, pickNextPlanRoutine } from "../../../lib/habitProgress.js";
import { quickCompleteRoutine } from "../../../lib/quickComplete.js";
import TemplatePicker from "./TemplatePicker.jsx";
import WeekSlider from "../../../components/WeekSlider.jsx";

// Ein Trainingsplan (Makrozyklus): mehrere Templates gebündelt, je mit
// eigenem Zeitraum-Ziel. Zeigt "Heute dran", Fortschritt pro Template und
// ob das Pensum des gesamten Plans erfüllt ist (alle Templates mit Ziel
// haben ihr Ziel erreicht) — die Antwort auf "erfülle ich mein Pensum laut
// Plan", jetzt an der einen richtigen Stelle statt dupliziert auf
// Template-Ebene.
export default function PlanCard({ plan, templates, workouts, clientUid, onReload }) {
  const [detail, setDetail] = useState(null);
  const [picking, setPicking] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const uid = clientUid || getUid();
  const isCoach = !!clientUid;

  async function load() {
    const d = await getMacrocycle(uid, plan.id);
    setDetail(d);
  }
  useEffect(() => { load(); }, [plan.id]);

  async function pickTemplate(template) {
    setPicking(false);
    const countStr = prompt(`Wie oft soll "${template.name}" im Zeitraum erledigt werden?`, "2");
    if (countStr === null) return;
    const count = Number(countStr);
    if (!Number.isFinite(count) || count <= 0) return;
    const daysStr = prompt(`In wie vielen Tagen (rollierendes Fenster)?`, "7");
    if (daysStr === null) return;
    const days = Number(daysStr);
    if (!Number.isFinite(days) || days <= 0) return;

    const full = isCoach ? await getClientRoutine(uid, template.id) : await api.get(`/routines/${template.id}`);
    const exercises = full.routine?.exercises || [];
    const updated = await addRoutine(uid, plan.id, {
      label: template.name, targetCount: count, targetPeriodDays: days, sourceTemplateId: template.id,
    });
    const added = updated?.routines?.[updated.routines.length - 1];
    if (added) {
      await updateRoutine(uid, plan.id, added.id, { exercises });
    }
    await load();
    onReload();
  }

  async function removeRoutine(routineId) {
    if (!confirm("Template aus diesem Plan entfernen?")) return;
    await deleteRoutine(uid, plan.id, routineId);
    await load();
  }

  // Wochen-Slider ruft das nur auf, wenn heute noch NICHT erledigt ist
  // (WeekSlider deaktiviert den Klick sonst nicht selbst) — Un-Markieren
  // eines bereits geloggten Tages ist bewusst nicht unterstützt (würde ein
  // echtes Workout löschen müssen, nicht nur einen Marker).
  async function markDone(r, alreadyDoneToday) {
    if (!r.sourceTemplateId || isCoach || alreadyDoneToday) return;
    setCompletingId(r.id);
    try {
      await quickCompleteRoutine(api, r.sourceTemplateId);
      onReload();
    } finally {
      setCompletingId(null);
    }
  }

  // Coach kommentiert ein konkretes erledigtes Workout — nur im Coach-Fall
  // angeboten (siehe WeekSlider onComment-Prop, self-service zeigt keine
  // Kommentar-Icons).
  async function commentOnWorkout(workout) {
    const text = prompt("Kommentar zu diesem Workout:", workout.coachFeedback || "");
    if (text === null) return;
    await saveWorkoutFeedback(uid, workout.id, text);
    await load();
    onReload();
  }

  if (!detail) return <div className="rounded-2xl bg-fit-bg2 border border-fit-line p-4 text-xs text-fit-muted">Lädt…</div>;

  const { macrocycle } = detail;
  const nextUp = pickNextPlanRoutine(macrocycle.routines, workouts);

  const targeted = (macrocycle.routines || []).filter((r) => r.targetCount > 0 && r.targetPeriodDays > 0);
  const pensumMet = targeted.length > 0 && targeted.every((r) =>
    countCompletionsInPeriod(r.sourceTemplateId, workouts, r.targetPeriodDays) >= r.targetCount
  );

  return (
    <div className={`rounded-2xl border p-4 ${pensumMet ? 'bg-green-500/5 border-green-500/30' : 'bg-fit-bg2 border-fit-line'}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-fit-ink truncate">{macrocycle.name}</h3>
          {pensumMet && <CheckCircle2 size={16} className="text-green-500 shrink-0" title="Pensum erfüllt" />}
        </div>
        <button
          onClick={async () => { if (confirm(`"${macrocycle.name}" löschen?`)) { await deleteMacrocycle(uid, plan.id); onReload(); } }}
          className="p-1.5 text-fit-dim hover:text-fit-red transition-colors shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {targeted.length > 0 && (
        <p className={`text-xs font-medium mb-2 ${pensumMet ? 'text-green-500' : 'text-fit-dim'}`}>
          Pensum {pensumMet ? 'erfüllt ✓' : `offen · ${targeted.filter((r) => countCompletionsInPeriod(r.sourceTemplateId, workouts, r.targetPeriodDays) >= r.targetCount).length}/${targeted.length} Templates erreicht`}
        </p>
      )}

      {nextUp && (
        <p className="text-xs text-fit-accent font-medium mb-3">Heute dran: {nextUp.label}</p>
      )}

      <div className="space-y-2 mb-3">
        {(macrocycle.routines || []).length === 0 ? (
          <p className="text-xs text-fit-muted">Noch keine Templates in diesem Plan.</p>
        ) : (
          macrocycle.routines.map((r) => {
            const done = r.sourceTemplateId ? countCompletionsInPeriod(r.sourceTemplateId, workouts, r.targetPeriodDays) : 0;
            const met = r.targetCount > 0 && done >= r.targetCount;
            const isNext = nextUp?.id === r.id;
            return (
              <div key={r.id} className={`px-3 py-2.5 rounded-xl bg-fit-bg ${isNext ? 'ring-1 ring-fit-accent/50' : ''}`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-medium text-fit-ink truncate">{r.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.targetCount > 0 && r.targetPeriodDays > 0 && (
                      <span className={`flex items-center gap-1 text-xs font-semibold ${met ? 'text-green-500' : 'text-fit-accent'}`}>
                        <Target size={12} /> {done}/{r.targetCount} in {r.targetPeriodDays}T
                      </span>
                    )}
                    <button onClick={() => removeRoutine(r.id)} className="p-1 text-fit-dim hover:text-fit-red transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {r.sourceTemplateId && (
                  <WeekSlider
                    templateId={r.sourceTemplateId}
                    workouts={workouts}
                    readOnly={isCoach}
                    todayBusy={completingId === r.id}
                    onToggleToday={(alreadyDoneToday) => markDone(r, alreadyDoneToday)}
                    onComment={isCoach ? commentOnWorkout : undefined}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {picking ? (
        <TemplatePicker templates={templates} onPick={pickTemplate} onCancel={() => setPicking(false)} />
      ) : (
        <button
          onClick={() => setPicking(true)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-fit-card hover:bg-fit-accent/10 text-fit-accent text-sm font-medium transition-colors"
        >
          <Plus size={14} /> Template hinzufügen
        </button>
      )}
    </div>
  );
}
