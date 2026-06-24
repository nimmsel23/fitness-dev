import { Sparkles, ShieldAlert } from "lucide-react";

export default function AdvancedSection({
  swipeEnabled, setSwipeEnabled,
  dashboardHighlighter, setDashboardHighlighter,
  mobileLayout, setMobileLayout,
}) {
  return (
    <section className="card p-8 mt-8 border-dashed border-red-500/20 bg-red-500/5 animate-in fade-in slide-in-from-bottom-8 duration-500">
       <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <ShieldAlert size={20} className="text-red-500" />
          </div>
          <div>
             <h3 className="text-xl font-black text-fit-ink">Advanced & Labor</h3>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Experimentelle Funktionen</p>
          </div>
       </div>

       <div className="bg-fit-bg2 p-6 rounded-3xl border border-fit-line">
          <div className="flex items-center gap-3 mb-6">
             <Sparkles size={18} className="text-fit-accent" />
             <h4 className="text-sm font-black text-fit-ink uppercase tracking-widest">Labor</h4>
          </div>
          <div className="space-y-6">
             {/* Swipe Navigation */}
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-xs font-black text-fit-ink">Swipe-Navigation</div>
                   <div className="text-[9px] font-bold opacity-30 uppercase text-fit-dim">Tab-Wechsel per Wischgeste</div>
                </div>
                <div className="flex bg-fit-bg p-1 rounded-xl border border-fit-line">
                   {[{ id: true, label: 'Ein' }, { id: false, label: 'Aus' }].map(({ id, label }) => (
                      <button key={label} onClick={() => setSwipeEnabled(id)}
                         className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${swipeEnabled === id ? 'bg-fit-card shadow-sm text-fit-accent' : 'text-fit-dim hover:text-fit-ink'}`}>
                         {label}
                      </button>
                   ))}
                </div>
             </div>

             {/* Mobile Layout */}
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-xs font-black text-fit-ink">Mobile Layout</div>
                   <div className="text-[9px] font-bold opacity-30 uppercase text-fit-dim">Fuel-Style Header + Pill-Tabs</div>
                </div>
                <div className="flex bg-fit-bg p-1 rounded-xl border border-fit-line">
                   {[{ id: 'classic', label: 'Classic' }, { id: 'fuel', label: 'Fuel' }].map(({ id, label }) => (
                      <button key={id} onClick={() => setMobileLayout?.(id)}
                         className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${mobileLayout === id ? 'bg-fit-card shadow-sm text-fit-accent' : 'text-fit-dim hover:text-fit-ink'}`}>
                         {label}
                      </button>
                   ))}
                </div>
             </div>

             {/* Dashboard Highlighter */}
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-xs font-black text-fit-ink">Highlighter Detail</div>
                   <div className="text-[9px] font-bold opacity-30 uppercase text-fit-dim">Dashboard Muskelkarte</div>
                </div>
                <div className="flex bg-fit-bg p-1 rounded-xl border border-fit-line">
                   {['body', 'muscles'].map(m => (
                      <button key={m} onClick={() => setDashboardHighlighter(m)}
                         className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg transition-all ${dashboardHighlighter === m ? 'bg-fit-card shadow-sm text-fit-accent' : 'text-fit-dim hover:text-fit-ink'}`}>
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
