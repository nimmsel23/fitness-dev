import { useState } from "react";
import { LayoutGrid, ChevronDown } from "lucide-react";
import { DARK_THEMES, LIGHT_THEMES } from "../../constants/Themes";

export default function AppearanceSection({
  navMode, setNavMode,
  sidebarPinned, setSidebarPinned,
  layoutScale, setLayoutScale,
  themeMode, setModeState,
  circLight, setCircLight,
  circDark, setCircDark,
  themes, theme, setThemeState,
}) {
  const [layoutOpen, setLayoutOpen] = useState(false);

  return (
    <section className="card p-8 space-y-10 border-t-4 border-t-[var(--accent)] animate-in fade-in slide-in-from-left-4 duration-500">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
            <LayoutGrid size={20} className="text-[var(--accent)]" />
          </div>
          <h3 className="text-xl font-black text-ink">Appearance & UI</h3>
       </div>

       <div className="space-y-8">
          {/* Theme Selector */}
          <div>
             <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Theme System ({Object.keys(themes).length})</div>
                <button onClick={() => setModeState(themeMode === 'circadian' ? 'manual' : 'circadian')}
                   className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all ${themeMode === 'circadian' ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--line)] text-[var(--dim)] hover:text-[var(--ink)]'}`}>
                   Auto-Theme: {themeMode === 'circadian' ? 'Ein' : 'Aus'}
                </button>
             </div>

             {themeMode === 'circadian' ? (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300 bg-[var(--bg2)] p-4 rounded-2xl border border-[var(--line)]">
                   <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--dim)] mb-2 ml-1">☀️ Tag (Light)</div>
                      <select value={circLight} onChange={e => setCircLight(e.target.value)} className="w-full bg-[var(--card)] border border-[var(--line)] rounded-lg px-2 py-2 text-[10px] font-black uppercase outline-none focus:border-[var(--accent)]">
                         {LIGHT_THEMES.filter(t => themes[t]).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>
                   <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--dim)] mb-2 ml-1">🌙 Nacht (Dark)</div>
                      <select value={circDark} onChange={e => setCircDark(e.target.value)} className="w-full bg-[var(--card)] border border-[var(--line)] rounded-lg px-2 py-2 text-[10px] font-black uppercase outline-none focus:border-[var(--accent)]">
                         {DARK_THEMES.filter(t => themes[t]).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>
                </div>
             ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                   <div>
                     <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--dim)] mb-2 ml-1">Dark Mode</div>
                     <div className="flex flex-wrap gap-2">
                        {DARK_THEMES.filter(id => themes[id]).map(id => {
                           const t = themes[id];
                           return (
                             <button key={id} onClick={() => setThemeState(id)}
                                className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center ${theme === id ? 'border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--line)] hover:border-[var(--accent)]/40'}`}
                                style={{ background: t.bg }} title={id}>
                                <div className="w-2 h-2 rounded-full" style={{ background: t.accent }} />
                             </button>
                           );
                        })}
                     </div>
                   </div>
                   <div>
                     <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--dim)] mb-2 ml-1">Light Mode</div>
                     <div className="flex flex-wrap gap-2">
                        {LIGHT_THEMES.filter(id => themes[id]).map(id => {
                           const t = themes[id];
                           return (
                             <button key={id} onClick={() => setThemeState(id)}
                                className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center ${theme === id ? 'border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--line)] hover:border-[var(--accent)]/40'}`}
                                style={{ background: t.bg }} title={id}>
                                <div className="w-2 h-2 rounded-full" style={{ background: t.accent }} />
                             </button>
                           );
                        })}
                     </div>
                   </div>
                </div>
             )}
          </div>

          {/* Layout & Navigation — collapsible */}
          <div className="border-t border-[var(--line)]/50 pt-6">
             <button
                onClick={() => setLayoutOpen(!layoutOpen)}
                className="flex items-center justify-between w-full group"
             >
                <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Layout & Navigation</div>
                <ChevronDown
                   size={14}
                   className={`text-[var(--dim)] transition-transform duration-300 ${layoutOpen ? 'rotate-180' : ''}`}
                />
             </button>

             {layoutOpen && (
                <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                   {/* Mobile Navigation Mode */}
                   <div className="lg:hidden">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Mobile Navigation</div>
                      <div className="flex gap-1 p-1 bg-[var(--bg2)] rounded-xl border border-[var(--line)]">
                         {[
                           { id: 'tabs', label: 'Tabs + Navbar' },
                           { id: 'home', label: 'Home Menü' },
                         ].map(({ id, label }) => (
                           <button key={id} onClick={() => setNavMode(id)}
                              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${navMode === id ? 'bg-[var(--card)] shadow-md text-[var(--accent)]' : 'text-[var(--dim)] hover:text-[var(--ink)]'}`}>
                              {label}
                           </button>
                         ))}
                      </div>
                   </div>

                   {/* Desktop Sidebar Toggle */}
                   <div className="hidden lg:flex items-center justify-between">
                      <div>
                         <div className="text-sm font-black text-ink">Desktop Sidebar</div>
                         <div className="text-[10px] font-bold opacity-30 uppercase">Permanent fixiert</div>
                      </div>
                      <button onClick={() => setSidebarPinned(!sidebarPinned)}
                         className={`w-12 h-6 rounded-full transition-colors relative border ${sidebarPinned ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg2)] border-[var(--line)]'}`}>
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${sidebarPinned ? 'left-7' : 'left-1'}`} />
                      </button>
                   </div>

                   {/* Layout Scale */}
                   <div className="space-y-4">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Layout Skalierung</div>
                      <input type="range" min="70" max="150" step="5" value={layoutScale} onChange={(e) => setLayoutScale(parseInt(e.target.value))} className="w-full accent-[var(--accent)] h-1" />
                      <div className="flex justify-between text-[10px] font-black opacity-30 uppercase">
                         <span>70%</span>
                         <span>{layoutScale}%</span>
                         <span>150%</span>
                      </div>
                   </div>
                </div>
             )}
          </div>
       </div>
    </section>
  );
}
