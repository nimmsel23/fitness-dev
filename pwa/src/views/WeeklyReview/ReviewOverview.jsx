import { CalendarDays, Zap } from 'lucide-react';
import { formatVolume } from './utils';

export default function ReviewOverview({ sessionCount, totalVolume, hitMode }) {
  return (
    <section className="card mb-0 shadow-lg border-line/50 p-8">
      <div className="label-caps !mb-6 flex items-center gap-2">
        <CalendarDays size={16} className="text-accent" />
        Übersicht
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border bg-bg2 border-line flex flex-col justify-center">
          <div className="text-[10px] uppercase font-black opacity-30 tracking-[0.2em] mb-1">Sessions</div>
          <div className="text-4xl font-black text-ink">{sessionCount || 0}</div>
        </div>
        <div className="p-5 rounded-2xl border bg-bg2 border-line flex flex-col justify-center">
          <div className="text-[10px] uppercase font-black opacity-30 tracking-[0.2em] mb-1">{hitMode ? 'Recovery' : 'Volumen'}</div>
          <div className="text-2xl font-black text-accent flex flex-col">
             {hitMode ? (
                <span className="flex items-center gap-1"><Zap size={20} /> Fokus</span>
             ) : (
                <>
                   {formatVolume(totalVolume).split(' ')[0]}
                   <span className="text-[10px] font-black uppercase opacity-40 -mt-1 tracking-widest text-ink">kg Total</span>
                </>
             )}
          </div>
        </div>
      </div>
    </section>
  );
}
