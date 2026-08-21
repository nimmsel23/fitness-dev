import { useEffect, useState } from "react";
import { Layers, Plus, ChevronDown } from "lucide-react";
import { listMacrocycles, createMacrocycle, getUid } from "@db";
import PlanCard from "./components/PlanCard.jsx";

// Trainingsplan (Makro) = mehrere Templates (Mikro, aus "Meine Routinen"
// weiter unten) zu einem Plan gebündelt, jedes mit eigenem Zeitraum-Ziel
// (x-mal in y Tagen). Self-service (Plan-Tab, kein clientUid-Prop) UND
// Coach-Nutzung (views/Coach/ClientsPanel.jsx, clientUid gesetzt) — ein
// Komponent, zwei Aufrufer, kein separater Coach-Nachbau mehr (siehe
// ClientPlan.jsx-Bereinigung: die frühere Ziel-Setzen-Duplikat-UI wurde
// entfernt).
//
// Fortschritt zählt NICHT über den separaten Makrozyklus-/complete-Call,
// sondern über dieselben echten Workout-Completions wie die Templates
// selbst (workouts.routine_id === sourceTemplateId) — deshalb speichert
// jede Plan-Routine ihre Herkunfts-Template-ID. Ein Template als "erledigt"
// markieren (egal ob unten in "Meine Routinen" oder hier im Plan) zählt für
// beide gleichermaßen, kein zweiter Fortschrittszähler.
//
// Quick-Complete ("Erledigt"-Haken) bleibt bewusst nur im Self-Service-Fall
// aktiv: views/Plan/api.js kennt kein clientUid-Override (Firestore-Modus
// schreibt dort immer auf den eigenen getUid()), im Coach-Fall gibt's dafür
// noch keinen dual-mode-sicheren Pfad. Lieber sichtbar deaktiviert als
// leise falsch für einen Klienten schreiben. Ziel-SETZEN funktioniert für
// den Coach trotzdem (pickTemplate in components/PlanCard.jsx nutzt
// addRoutine/updateRoutine, beide clientUid-parametrisiert) — Coach kann
// vorgeben, nur nicht stellvertretend abhaken.
export default function TrainingPlans({ templates, workouts, onChanged, clientUid }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const uid = clientUid || getUid();

  async function load() {
    setLoading(true);
    setPlans(await listMacrocycles(uid));
    setLoading(false);
  }
  useEffect(() => { load(); }, [uid]);

  function reload() {
    load();
    onChanged?.();
  }

  async function newPlan() {
    const name = prompt("Name des Trainingsplans:", "Mein Plan");
    if (!name || !name.trim()) return;
    await createMacrocycle(uid, { name: name.trim(), coachUid: getUid(), totalWeeks: 52 });
    load();
  }

  if (!loading && plans.length === 0 && !open) return null;

  return (
    <section className="mb-8">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between mb-3 px-1">
        <span className="flex items-center gap-2 text-sm font-bold text-fit-muted uppercase tracking-wide">
          <Layers size={15} className="text-fit-accent" />
          Trainingspläne {!loading && `(${plans.length})`}
        </span>
        <ChevronDown size={16} className={`text-fit-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-3">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} templates={templates} workouts={workouts} clientUid={clientUid} onReload={reload} />
          ))}
          <button
            onClick={newPlan}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-fit-card hover:bg-fit-accent/10 text-fit-ink text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Neuer Trainingsplan
          </button>
        </div>
      )}
    </section>
  );
}
