import { Sparkles, Download } from 'lucide-react';

export default function ReviewHeader({ week, setWeek, onExport, toast }) {
  return (
    <section className="p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-fit-card border border-fit-line">
      <div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold mb-1" style={{ color: 'var(--dim)', opacity: 0.6 }}>
          <Sparkles size={12} className="text-fit-accent" />
          Performance Review
        </div>
        <h2 className="text-xl font-bold text-fit-ink">
          Wochen-Analyse
        </h2>
        {toast && (
          <div className="mt-2 text-[11px] font-semibold text-fit-accent bg-fit-accent/10 px-2.5 py-1 rounded-full border border-fit-accent/20 inline-block">
            {toast}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={onExport}
          className="h-10 px-3.5 rounded-xl bg-fit-accent/10 text-fit-accent border border-fit-accent/20 hover:bg-accent/20 transition-all flex items-center gap-2 text-xs font-semibold shrink-0"
        >
          <Download size={14} /> Obsidian
        </button>

        <div className="flex items-center gap-1.5 bg-fit-bg2 p-1 rounded-xl border border-fit-line shrink-0">
          <input
            value={week}
            onChange={e => setWeek(e.target.value)}
            placeholder="2026-W19"
            className="px-3 py-2 rounded-lg text-sm font-medium border-none outline-none w-24 sm:w-32"
            style={{ background: 'transparent', color: 'var(--ink)' }}
          />
          <button
            onClick={() => setWeek('current')}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-fit-accent text-black transition-transform active:scale-95 whitespace-nowrap"
          >
            Aktuell
          </button>
        </div>
      </div>
    </section>
  );
}
