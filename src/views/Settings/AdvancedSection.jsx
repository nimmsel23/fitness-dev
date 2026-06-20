import { Sparkles, ShieldAlert } from "lucide-react";

export default function AdvancedSection({
  swipeEnabled, setSwipeEnabled,
  dashboardHighlighter, setDashboardHighlighter,
}) {
  return (
    <section className="card p-8 mt-8 border-dashed border-red-500/20 bg-red-500/5 animate-in fade-in slide-in-from-bottom-8 duration-500">
       <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <ShieldAlert size={20} className="text-red-500" />
          </div>
          <div>
             <h3 className="text-xl font-black text-ink">Advanced & Labor</h3>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Experimentelle Funktionen</p>
          </div>
       </div>

       <div className="bg-[var(--bg2)] p-6 rounded-3xl border border-[var(--line)]">
          <div className="flex items-center gap-3 mb-6">
             <Sparkles size={18} className="text-[var(--accent)]" />
             <h4 className="text-sm font-black text-ink uppercase tracking-widest">Labor</h4>
          </div>
          <div className="space-y-6">
             {/* Swipe Navigation */}
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-xs font-black text-ink">Swipe-Navigation</div>
                   <div className="text-[9px] font-bold opacity-30 uppercase text-[var(--dim)]">Tab-Wechsel per Wischgeste</div>
                </div>
                <div className="flex bg-[var(--bg)] p-1 rounded-xl border border-[var(--line)]">
                   {[{ id: true, label: 'Ein' }, { id: false, label: 'Aus' }].map(({ id, label }) => (
                      <button key={label} onClick={() => setSwipeEnabled(id)}
                         className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${swipeEnabled === id ? 'bg-[var(--card)] shadow-sm text-[var(--accent)]' : 'text-[var(--dim)] hover:text-[var(--ink)]'}`}>
                         {label}
                      </button>
                   ))}
                </div>
             </div>

             {/* Dashboard Highlighter */}
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-xs font-black text-ink">Highlighter Detail</div>
                   <div className="text-[9px] font-bold opacity-30 uppercase text-[var(--dim)]">Dashboard Muskelkarte</div>
                </div>
                <div className="flex bg-[var(--bg)] p-1 rounded-xl border border-[var(--line)]">
                   {['body', 'muscles'].map(m => (
                      <button key={m} onClick={() => setDashboardHighlighter(m)}
                         className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${dashboardHighlighter === m ? 'bg-[var(--card)] shadow-sm text-[var(--accent)]' : 'text-[var(--dim)] hover:text-[var(--ink)]'}`}>
                         {m}
                      </button>
                   ))}
                </div>
             </div>

          </div>
       </div>
    </section>
  );
}
