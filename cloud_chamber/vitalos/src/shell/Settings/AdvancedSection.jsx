import { Sparkles, ShieldAlert, UserCircle, LayoutGrid } from "lucide-react";

function formatJoinDate(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return '—'; }
}

export default function AdvancedSection({
  swipeEnabled, setSwipeEnabled,
  dashboardHighlighter, setDashboardHighlighter,
  mobileLayout, setMobileLayout,
  navMode, setNavMode,
  sidebarPinned, setSidebarPinned,
  layoutScale, setLayoutScale,
  muscleLanguage, setMuscleLanguage,
  user,
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

       {/* Layout & Navigation (experimentell) */}
       <div className="mt-6 bg-fit-bg2 p-6 rounded-3xl border border-fit-line space-y-6">
          <div className="flex items-center gap-3">
             <LayoutGrid size={18} className="text-fit-accent" />
             <h4 className="text-sm font-black text-fit-ink uppercase tracking-widest">Layout & Navigation</h4>
          </div>

          <div>
             <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Navigation Modus</div>
             <div className="flex gap-1 p-1 bg-fit-bg rounded-xl border border-fit-line">
                {[
                  { id: 'tabs', label: 'Tabs + Navbar' },
                  { id: 'home', label: 'Home Menü' },
                ].map(({ id, label }) => (
                   <button key={id} onClick={() => setNavMode(id)}
                      className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${navMode === id ? 'bg-fit-card shadow-md text-fit-accent' : 'text-fit-dim hover:text-fit-ink'}`}>
                      {label}
                   </button>
                ))}
             </div>
          </div>

          <div className="hidden lg:flex items-center justify-between">
             <div>
                <div className="text-sm font-black text-fit-ink">Desktop Sidebar</div>
                <div className="text-[10px] font-bold opacity-30 uppercase">Permanent fixiert</div>
             </div>
             <button onClick={() => setSidebarPinned(!sidebarPinned)}
                className={`w-12 h-6 rounded-full transition-colors relative border ${sidebarPinned ? 'bg-fit-accent border-fit-accent' : 'bg-fit-bg border-fit-line'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${sidebarPinned ? 'left-7' : 'left-1'}`} />
             </button>
          </div>

          <div className="space-y-3">
             <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Layout Skalierung</div>
             <input type="range" min="70" max="150" step="5" value={layoutScale} onChange={(e) => setLayoutScale(parseInt(e.target.value))} className="w-full accent-[var(--accent)] h-1" />
             <div className="flex justify-between text-[10px] font-black opacity-30 uppercase">
                <span>70%</span>
                <span>{layoutScale}%</span>
                <span>150%</span>
             </div>
          </div>

          <div>
             <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Muskel-Terminologie</div>
             <div className="flex gap-1 p-1 bg-fit-bg rounded-xl border border-fit-line">
                {[
                  { id: 'de', label: 'Deutsch' },
                  { id: 'en', label: 'English' },
                  { id: 'lat', label: 'Latein' },
                ].map(({ id, label }) => (
                   <button key={id} onClick={() => setMuscleLanguage(id)}
                      className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${muscleLanguage === id ? 'bg-fit-card shadow-md text-fit-accent' : 'text-fit-dim hover:text-fit-ink'}`}>
                      {label}
                   </button>
                ))}
             </div>
          </div>
       </div>

       {/* User Auth Details */}
       {user && (
          <div className="mt-6 bg-fit-bg2 p-6 rounded-3xl border border-fit-line">
             <div className="flex items-center gap-3 mb-6">
                <UserCircle size={18} className="text-fit-accent" />
                <h4 className="text-sm font-black text-fit-ink uppercase tracking-widest">Account Details</h4>
             </div>
             <div className="space-y-3 text-[11px] font-mono">
                <div className="flex items-center justify-between bg-fit-bg p-3 rounded-xl border border-fit-line">
                   <span className="opacity-40 uppercase tracking-widest text-[10px] font-black">UID</span>
                   <span className="font-black text-fit-accent truncate max-w-[60%]" title={user.uid}>{user.uid || '—'}</span>
                </div>
                <div className="flex items-center justify-between bg-fit-bg p-3 rounded-xl border border-fit-line">
                   <span className="opacity-40 uppercase tracking-widest text-[10px] font-black">Beitritt</span>
                   <span className="font-black text-fit-ink">{formatJoinDate(user.metadata?.creationTime)}</span>
                </div>
                {user.metadata?.lastSignInTime && (
                   <div className="flex items-center justify-between bg-fit-bg p-3 rounded-xl border border-fit-line">
                      <span className="opacity-40 uppercase tracking-widest text-[10px] font-black">Letzter Login</span>
                      <span className="font-black text-fit-dim">{formatJoinDate(user.metadata.lastSignInTime)}</span>
                   </div>
                )}
                {user.providerData?.[0]?.providerId && (
                   <div className="flex items-center justify-between bg-fit-bg p-3 rounded-xl border border-fit-line">
                      <span className="opacity-40 uppercase tracking-widest text-[10px] font-black">Provider</span>
                      <span className="font-black text-fit-dim">{user.providerData[0].providerId}</span>
                   </div>
                )}
             </div>
          </div>
       )}
    </section>
  );
}
