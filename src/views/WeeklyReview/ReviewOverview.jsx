import { CalendarDays } from 'lucide-react';

export default function ReviewOverview({ sessionCount, totalExercises, avgEffort }) {
  return (
    <section className="card mb-0 shadow-lg border-fit-line/50 p-4 sm:p-8">
      <div className="label-caps !mb-4 sm:!mb-6 flex items-center gap-2">
        <CalendarDays size={16} className="text-fit-accent" />
        Übersicht
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="p-2.5 sm:p-5 rounded-2xl border bg-fit-bg2 border-fit-line flex flex-col justify-center min-w-0">
          <div className="text-[8px] sm:text-[10px] uppercase font-black opacity-30 tracking-[0.05em] sm:tracking-[0.2em] mb-1 truncate">Sessions</div>
          <div className="text-2xl sm:text-4xl font-black text-fit-ink">{sessionCount || 0}</div>
        </div>
        <div className="p-2.5 sm:p-5 rounded-2xl border bg-fit-bg2 border-fit-line flex flex-col justify-center min-w-0">
          <div className="text-[8px] sm:text-[10px] uppercase font-black opacity-30 tracking-[0.05em] sm:tracking-[0.2em] mb-1 truncate">Übungen</div>
          <div className="text-2xl sm:text-4xl font-black text-fit-ink">{totalExercises || 0}</div>
        </div>
        <div className="p-2.5 sm:p-5 rounded-2xl border bg-fit-bg2 border-fit-line flex flex-col justify-center min-w-0">
          <div className="text-[8px] sm:text-[10px] uppercase font-black opacity-30 tracking-[0.05em] sm:tracking-[0.2em] mb-1 truncate">Effort</div>
          <div className="text-2xl sm:text-4xl font-black text-fit-ink">{avgEffort != null ? avgEffort : '–'}</div>
        </div>
      </div>
    </section>
  );
}
