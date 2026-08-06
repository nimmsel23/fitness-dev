import { Sparkles, Download } from 'lucide-react';

export default function ReviewHeader({ week, setWeek, onExport, toast }) {
  return (
    <section className="p-8 rounded-[32px] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-card to-bg2 border border-fit-line">
      <div className="absolute top-0 right-0 w-64 h-64 bg-fit-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--accent)' }}>
          <Sparkles size={16} className="text-fit-accent" />
          Performance Review
        </div>
        <h2 className="text-3xl font-black text-fit-ink tracking-tight">
          Wochen-Analyse
        </h2>
        {toast && (
          <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-fit-accent bg-fit-accent/10 px-3 py-1.5 rounded-lg border border-fit-accent/20 inline-block">
            {toast}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 relative z-10">
        <button
          onClick={onExport}
          className="p-3 sm:p-4 rounded-2xl bg-fit-accent/10 text-fit-accent border border-fit-accent/20 hover:bg-accent/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shrink-0"
        >
          <Download size={14} /> Obsidian
        </button>

        <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-fit-line/50 shadow-inner shrink-0">
          <input
            value={week}
            onChange={e => setWeek(e.target.value)}
            placeholder="2026-W19"
            className="px-3 sm:px-4 py-2.5 rounded-xl text-sm font-black border-none outline-none w-24 sm:w-36 uppercase tracking-wider"
            style={{ background: 'transparent', color: 'var(--ink)' }}
          />
          <button
            onClick={() => setWeek('current')}
            className="px-4 sm:px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-fit-accent text-black transition-transform active:scale-95 shadow-lg shadow-accent/20 whitespace-nowrap"
          >
            Aktuell
          </button>
        </div>
      </div>
    </section>
  );
}
