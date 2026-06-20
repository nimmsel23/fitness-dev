import { ChevronLeft, ChevronRight, CalendarDays, Book } from "lucide-react";

export default function JournalHeader({ date, setDate, localToday, formatRelativeDate }) {
  return (
    <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
         <div className="flex items-center gap-2 text-fit-accent font-black uppercase tracking-[0.3em] text-[10px] mb-2">
            <Book size={14} />
            Daily Reflection
         </div>
         <h1 className="text-4xl font-black text-fit-ink tracking-tighter">
           {formatRelativeDate(date)}
         </h1>
      </div>
      
      <div className="flex items-center gap-2 bg-fit-card p-1.5 rounded-2xl border border-fit-line shadow-xl">
        <button onClick={() => {
          const d = new Date(date);
          d.setDate(d.getDate() - 1);
          setDate(d.toISOString().slice(0, 10));
        }} className="p-2.5 rounded-xl hover:bg-fit-bg2 text-fit-dim transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="relative">
           <input type="date" value={date} max={localToday}
             onChange={e => setDate(e.target.value)}
             className="bg-transparent px-4 py-2 text-sm font-black text-fit-ink outline-none cursor-pointer uppercase tracking-widest"
           />
        </div>
        <button 
          disabled={date === localToday}
          onClick={() => {
            const d = new Date(date);
            d.setDate(d.getDate() + 1);
            setDate(d.toISOString().slice(0, 10));
          }} className="p-2.5 rounded-xl hover:bg-fit-bg2 text-fit-dim transition-all disabled:opacity-10">
          <ChevronRight size={20} />
        </button>
      </div>
    </header>
  );
}
