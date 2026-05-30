import { Book } from "lucide-react";

export default function JournalForm({ text, setText, onSubmit, saving }) {
  return (
    <div className="sticky top-6 space-y-6">
      <div className="card p-6 shadow-2xl bg-gradient-to-b from-[var(--card)] to-[var(--bg2)] border border-[var(--line)] relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
           <Book size={120} />
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
          placeholder="Gedanken, Erkenntnisse, Fokus..."
          className="w-full bg-transparent border-none outline-none text-sm leading-relaxed resize-none text-[var(--ink)] font-medium placeholder:opacity-30"
        />
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-[var(--line)]/50">
           <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Shift + Enter für Umbruch</span>
           <button onClick={onSubmit} disabled={saving || !text.trim()}
             className="btn btn-primary px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent)]/20">
             {saving ? "..." : "Sichern"}
           </button>
        </div>
      </div>

      <div className="px-2 py-4 border-l-2 border-dashed border-[var(--line)] ml-4">
         <p className="text-[11px] font-bold opacity-30 leading-relaxed italic text-[var(--dim)]">
            "Worte sind die Brücke von der Erfahrung zur Erkenntnis."
         </p>
      </div>
    </div>
  );
}
