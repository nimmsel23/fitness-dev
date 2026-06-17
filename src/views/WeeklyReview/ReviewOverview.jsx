import { CalendarDays } from 'lucide-react';

export default function ReviewOverview({ sessionCount }) {
  return (
    <section className="card mb-0 shadow-lg border-line/50 p-8">
      <div className="label-caps !mb-6 flex items-center gap-2">
        <CalendarDays size={16} className="text-accent" />
        Übersicht
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-5 rounded-2xl border bg-bg2 border-line flex flex-col justify-center">
          <div className="text-[10px] uppercase font-black opacity-30 tracking-[0.2em] mb-1">Sessions</div>
          <div className="text-4xl font-black text-ink">{sessionCount || 0}</div>
        </div>
      </div>
    </section>
  );
}
