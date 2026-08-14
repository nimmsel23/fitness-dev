import { CalendarDays } from 'lucide-react';

export default function ReviewOverview({ sessionCount, totalExercises, avgEffort }) {
  return (
    <section>
      <div className="label-caps !mb-4 flex items-center gap-2">
        <CalendarDays size={16} className="text-fit-accent" />
        Übersicht
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-6 rounded-2xl border bg-fit-card border-fit-line flex flex-col justify-center min-w-0">
          <div className="text-[9px] sm:text-xs uppercase font-black opacity-30 tracking-[0.08em] sm:tracking-[0.2em] mb-1.5 truncate">Sessions</div>
          <div className="text-3xl sm:text-5xl font-black text-fit-ink">{sessionCount || 0}</div>
        </div>
        <div className="p-3.5 sm:p-6 rounded-2xl border bg-fit-card border-fit-line flex flex-col justify-center min-w-0">
          <div className="text-[9px] sm:text-xs uppercase font-black opacity-30 tracking-[0.08em] sm:tracking-[0.2em] mb-1.5 truncate">Übungen</div>
          <div className="text-3xl sm:text-5xl font-black text-fit-ink">{totalExercises || 0}</div>
        </div>
        <div className="p-3.5 sm:p-6 rounded-2xl border bg-fit-card border-fit-line flex flex-col justify-center min-w-0">
          <div className="text-[9px] sm:text-xs uppercase font-black opacity-30 tracking-[0.08em] sm:tracking-[0.2em] mb-1.5 truncate">Effort</div>
          <div className="text-3xl sm:text-5xl font-black text-fit-ink">{avgEffort != null ? avgEffort : '–'}</div>
        </div>
      </div>
    </section>
  );
}
