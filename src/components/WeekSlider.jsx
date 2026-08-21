import { Check, MessageCircle } from 'lucide-react';

const DAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function currentWeekDates() {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0 = Montag
  const monday = new Date(now);
  monday.setDate(now.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// HabitShare-artiger Wochen-Slider: 7 Tages-Zellen (Mo–So der laufenden
// Woche), grün wenn an dem Tag ein completed Workout mit passender
// routine_id existiert. Nur der heutige Tag ist antippbar (toggelt
// erledigt/nicht) — vergangene Tage sind reine Anzeige (kein rückwirkendes
// Fälschen), zukünftige Tage sind ausgegraut. Geteilt zwischen Self-Service
// (views/Plan/TrainingPlans.jsx) und Coach-Ansicht (views/Coach/…) — eine
// Komponente, dieselbe Sicht für beide, das ist der Sinn (Coach checkt
// gegen, sieht exakt was der Klient sieht).
// onComment optional: wenn gesetzt, bekommt ein erledigter Tag ein kleines
// Kommentar-Icon darunter (Coach-Feedback zu genau diesem Workout — nutzt
// dieselbe coachFeedback-Infrastruktur wie Journal/Session-Einträge, siehe
// saveCoachFeedback in lib/db/{local,firestore}/coach.js). Aufrufer
// entscheidet, was beim Klick passiert (WeekSlider bleibt @db-frei).
export default function WeekSlider({ templateId, workouts, onToggleToday, todayBusy = false, readOnly = false, onComment }) {
  const days = currentWeekDates();
  const todayIso = new Date().toISOString().slice(0, 10);

  const doneWorkoutByDate = new Map(
    (workouts || [])
      .filter((w) => w.routine_id === templateId && w.sessionState === 'completed' && w.finished_at)
      .map((w) => [w.finished_at.slice(0, 10), w])
  );

  return (
    <div className="flex items-start gap-1.5">
      {days.map((d, i) => {
        const iso = d.toISOString().slice(0, 10);
        const isToday = iso === todayIso;
        const isFuture = iso > todayIso;
        const workout = doneWorkoutByDate.get(iso);
        const done = !!workout;
        const label = DAY_LABELS[i];

        const base = 'flex flex-col items-center justify-center gap-0.5 w-8 h-9 rounded-lg text-[10px] font-semibold transition-colors';
        const style = isFuture
          ? 'text-fit-dim/40'
          : done
            ? 'bg-fit-accent text-white'
            : isToday
              ? 'bg-fit-card border border-fit-accent/50 text-fit-accent'
              : 'bg-fit-bg text-fit-dim';

        return (
          <div key={iso} className="flex flex-col items-center gap-1">
            <button
              type="button"
              disabled={readOnly || !isToday || todayBusy}
              onClick={() => isToday && onToggleToday?.(done)}
              className={`${base} ${style} ${isToday && !readOnly ? 'cursor-pointer' : 'cursor-default'}`}
              title={iso}
            >
              <span>{label}</span>
              {done ? <Check size={11} strokeWidth={3} /> : <span className="w-[11px] h-[11px]" />}
            </button>
            {done && (onComment || workout.coachFeedback) && (
              <button
                type="button"
                onClick={() => onComment ? onComment(workout) : alert(workout.coachFeedback)}
                title={onComment ? (workout.coachFeedback ? "Kommentar bearbeiten" : "Kommentieren") : "Kommentar vom Coach ansehen"}
                className={`p-0.5 rounded transition-colors ${workout.coachFeedback ? 'text-fit-accent' : 'text-fit-dim/50 hover:text-fit-dim'}`}
              >
                <MessageCircle size={11} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
