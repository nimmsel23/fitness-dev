import { Zap, LayoutGrid, Sparkles, Settings2, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { api, isLocalMode } from "@db";
import { DARK_THEMES, LIGHT_THEMES } from "../../constants/Themes";

export default function Settings({
  hitMode, setHitMode, planMode, setPlanMode,
  layoutScale, setLayoutScale,
  gender, setGender, split, setSplit,
  cycleLength, setCycleLength, defaultLocation, setDefaultLocation,
  recentDays, setRecentDays,
  coverageThreshold, setCoverageThreshold,
  showAdvanced, setShowAdvanced,
  dashboardHighlighter, setDashboardHighlighter,
  themeMode, setModeState, circLight, setCircLight, circDark, setCircDark,
  themes, theme, setThemeState, updateSettings,
  sidebarPinned, setSidebarPinned,
  navMode, setNavMode
}) {
  const [health, setHealth] = useState(null)
  const [wger, setWger] = useState(null)
  const [firestoreStatus, setFirestoreStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (!isLocalMode() || !api) return;
    api.get('/health').then(setHealth).catch(() => setHealth({ ok: false }))
    fetch('http://localhost:8000/api/v2/language/?format=json')
      .then(r => setWger(r.ok))
      .catch(() => setWger(false))
    api.get('/firestore/status').then(setFirestoreStatus).catch(() => setFirestoreStatus({ ok: false }))
  }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      await api.post('/firestore/sync', {})
      const s = await api.get('/firestore/status')
      setFirestoreStatus(s)
    } catch {
      setFirestoreStatus({ ok: false })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto">
       {/* 0. Header with Advanced Toggle */}
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
             <h2 className="text-3xl font-black text-ink">Settings</h2>
             <p className="text-sm font-medium opacity-40">Konfiguriere dein AlphaOS Fitness Erlebnis.</p>
          </div>
          <button 
             onClick={() => setShowAdvanced(!showAdvanced)}
             className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest ${showAdvanced ? 'border-accent bg-accent/5 text-accent shadow-lg shadow-accent/5' : 'border-line bg-bg2 text-dim hover:text-ink'}`}
          >
             <Settings2 size={16} className={showAdvanced ? 'animate-pulse' : ''} />
             {showAdvanced ? 'Advanced Mode: Ein' : 'Advanced Mode: Aus'}
          </button>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. Appearance & UI */}
          <section className="card p-8 space-y-10 border-t-4 border-t-[var(--accent)]">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                  <LayoutGrid size={20} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-xl font-black text-ink">Appearance & UI</h3>
             </div>

             <div className="space-y-8">
                {/* Mobile Navigation Mode */}
                <div className="lg:hidden">
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Mobile Navigation</div>
                   <div className="flex gap-1 p-1 bg-bg2 rounded-xl border border-line">
                      {[
                        { id: 'tabs', label: 'Tabs + Navbar' },
                        { id: 'home', label: 'Home Menü' },
                      ].map(({ id, label }) => (
                        <button key={id} onClick={() => setNavMode(id)}
                           className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${navMode === id ? 'bg-card shadow-md text-accent' : 'text-dim hover:text-ink'}`}>
                           {label}
                        </button>
                      ))}
                   </div>
                   <div className="text-[9px] font-bold opacity-20 uppercase mt-2 ml-1">
                     {navMode === 'home' ? 'Dashboard = Menü, keine Bottom-Bar' : 'Klassische Tab-Navigation'}
                   </div>
                </div>

                {/* Desktop Sidebar Toggle */}
                <div className="hidden lg:flex items-center justify-between">
                   <div>
                      <div className="text-sm font-black text-ink">Desktop Sidebar</div>
                      <div className="text-[10px] font-bold opacity-30 uppercase">Permanent fixiert</div>
                   </div>
                   <button onClick={() => { setSidebarPinned(!sidebarPinned); updateSettings?.({ sidebarPinned: !sidebarPinned }); }}
                      className={`w-12 h-6 rounded-full transition-colors relative border ${sidebarPinned ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${sidebarPinned ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                {/* Layout Scale */}
                <div className="space-y-4">
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Layout Skalierung</div>
                   <input type="range" min="70" max="150" step="5" value={layoutScale} onChange={(e) => setLayoutScale(parseInt(e.target.value))} className="w-full accent-accent h-1" />
                   <div className="flex justify-between text-[10px] font-black opacity-30 uppercase">
                      <span>70%</span>
                      <span>{layoutScale}%</span>
                      <span>150%</span>
                   </div>
                </div>

                {/* Theme Selector */}
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Theme System ({Object.keys(themes).length})</div>
                      <button onClick={() => setModeState(themeMode === 'circadian' ? 'manual' : 'circadian')} 
                         className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all ${themeMode === 'circadian' ? 'border-accent bg-accent/10 text-accent' : 'border-line text-dim hover:text-ink'}`}>
                         Auto-Theme: {themeMode === 'circadian' ? 'Ein' : 'Aus'}
                      </button>
                   </div>
                   
                   {themeMode === 'circadian' ? (
                      <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300 bg-[var(--bg2)] p-4 rounded-2xl border border-[var(--line)]">
                         <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-dim mb-2 ml-1">☀️ Tag (Light)</div>
                            <select value={circLight} onChange={e => setCircLight(e.target.value)} className="w-full bg-[var(--card)] border border-[var(--line)] rounded-lg px-2 py-2 text-[10px] font-black uppercase outline-none focus:border-[var(--accent)]">
                               {LIGHT_THEMES.filter(t => themes[t]).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                         </div>
                         <div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-dim mb-2 ml-1">🌙 Nacht (Dark)</div>
                            <select value={circDark} onChange={e => setCircDark(e.target.value)} className="w-full bg-[var(--card)] border border-[var(--line)] rounded-lg px-2 py-2 text-[10px] font-black uppercase outline-none focus:border-[var(--accent)]">
                               {DARK_THEMES.filter(t => themes[t]).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                         </div>
                      </div>
                   ) : (
                      <div className="space-y-4 animate-in fade-in duration-300">
                         {/* Dark Themes */}
                         <div>
                           <div className="text-[9px] font-bold uppercase tracking-widest text-dim mb-2 ml-1">Dark Mode</div>
                           <div className="flex flex-wrap gap-2">
                              {DARK_THEMES.filter(id => themes[id]).map(id => {
                                 const t = themes[id];
                                 return (
                                   <button key={id} onClick={() => { setThemeState(id); updateSettings?.({ theme: id, themeMode: 'manual' }); }}
                                      className={`w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center ${theme === id ? 'border-[var(--accent)] scale-110 shadow-lg shadow-[var(--accent)]/20' : 'border-[var(--line)] hover:border-[var(--accent)]/40'}`} 
                                      style={{ background: t.bg }} title={id}>
                                      <div className="w-2 h-2 rounded-full" style={{ background: t.accent }} />
                                   </button>
                                 );
                              })}
                           </div>
                         </div>
                         {/* Light Themes */}
                         <div>
                           <div className="text-[9px] font-bold uppercase tracking-widest text-dim mb-2 ml-1">Light Mode</div>
                           <div className="flex flex-wrap gap-2">
                              {LIGHT_THEMES.filter(id => themes[id]).map(id => {
                                 const t = themes[id];
                                 return (
                                   <button key={id} onClick={() => { setThemeState(id); updateSettings?.({ theme: id, themeMode: 'manual' }); }}
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
             </div>
          </section>

          {/* 2. Training Preferences */}
          <section className="card p-8 space-y-10 border-t-4 border-t-dim">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg2)] border border-[var(--line)] flex items-center justify-center">
                  <Zap size={20} className="text-[var(--dim)]" />
                </div>
                <h3 className="text-xl font-black text-ink">Training Preferences</h3>
             </div>

             <div className="space-y-8">
                {/* Anatomy Model */}
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Anatomie-Modell (Visualisierung)</div>
                   <div className="flex gap-1 p-1 bg-bg2 rounded-xl border border-line">
                      {['male', 'female'].map(g => (
                         <button key={g} onClick={() => { setGender(g); updateSettings?.({gender: g}); }}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${gender === g ? 'bg-card shadow-md text-accent' : 'text-dim hover:text-ink'}`}>
                            {g === 'male' ? 'Male' : 'Female'}
                         </button>
                      ))}
                   </div>
                </div>

                {/* Dashboard Highlighter */}
                <div className="flex items-center justify-between">
                   <div>
                      <div className="text-sm font-black text-ink">Highlighter Detailgrad</div>
                      <div className="text-[10px] font-bold opacity-30 uppercase">Muskelkarte auf dem Dashboard</div>
                   </div>
                   <div className="flex bg-bg2 p-1 rounded-xl border border-line">
                      {['body', 'muscles'].map(m => (
                         <button key={m} onClick={() => setDashboardHighlighter(m)} 
                            className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${dashboardHighlighter === m ? 'bg-card shadow-sm text-accent' : 'text-dim hover:text-ink'}`}>
                            {m}
                         </button>
                      ))}
                   </div>
                </div>

                {/* Tracking Mode */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]/50">
                   <div>
                      <div className="text-sm font-black text-ink">Volume Tracking Modus</div>
                      <div className="text-[10px] font-bold opacity-30 uppercase">Satz / Wdh / Gewicht erfassen</div>
                   </div>
                   <button onClick={() => { const next = !hitMode; setHitMode(next); updateSettings?.({hitMode: next}); }}
                      className={`w-12 h-6 rounded-full transition-colors relative border ${!hitMode ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!hitMode ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                {/* Plan Mode */}
                <div className="flex items-center justify-between">
                   <div>
                      <div className="text-sm font-black text-ink">Smart Plan Modus</div>
                      <div className="text-[10px] font-bold opacity-30 uppercase">KI-gestützte Trainingsplanung</div>
                   </div>
                   <button onClick={() => setPlanMode(!planMode)} 
                      className={`w-12 h-6 rounded-full transition-colors relative border ${planMode ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${planMode ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                {/* Sliders */}
                <div className="pt-4 border-t border-[var(--line)]/50 space-y-6">
                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Analyse-Fenster (Recent)</div>
                         <span className="text-[10px] font-black text-accent bg-[var(--accent)]/10 px-2 py-0.5 rounded-md">{recentDays} Tage</span>
                      </div>
                      <input type="range" min="1" max="30" value={recentDays} onChange={(e) => setRecentDays(parseInt(e.target.value))} className="w-full accent-[var(--accent)] h-1" />
                   </div>
                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Coverage Threshold</div>
                         <span className="text-[10px] font-black text-accent bg-[var(--accent)]/10 px-2 py-0.5 rounded-md">{coverageThreshold} Sätze</span>
                      </div>
                      <input type="range" min="0.5" max="10" step="0.5" value={coverageThreshold} onChange={(e) => setCoverageThreshold(parseFloat(e.target.value))} className="w-full accent-[var(--accent)] h-1" />
                   </div>
                </div>

             </div>
          </section>
       </div>

       {/* 3. System & Cloud (Advanced Mode) */}
       {showAdvanced && (
         <section className="card p-8 mt-8 border-dashed border-red-500/20 bg-red-500/5 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                 <ShieldAlert size={20} className="text-red-500" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-ink">System & Cloud</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Entwickler-Werkzeuge</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Sync Panel */}
               {isLocalMode() && (
                  <div className="bg-[var(--bg2)] p-6 rounded-3xl border border-[var(--line)]">
                     <div className="flex items-center gap-3 mb-6">
                        <Sparkles size={18} className={syncing ? 'animate-spin text-[var(--accent)]' : 'text-[var(--accent)]'} />
                        <h4 className="text-sm font-black text-ink uppercase tracking-widest">Firestore Sync</h4>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between bg-[var(--bg)] p-3 rounded-xl border border-[var(--line)]">
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Status</span>
                           {firestoreStatus?.ok 
                              ? <span className="text-[9px] font-black uppercase bg-green-500/10 text-green-500 px-2 py-1 rounded-md border border-green-500/20">Verbunden</span>
                              : <span className="text-[9px] font-black uppercase bg-red-500/10 text-red-500 px-2 py-1 rounded-md border border-red-500/20">Offline</span>
                           }
                        </div>
                        <button onClick={handleSync} disabled={syncing} className="w-full btn btn-primary py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[var(--accent)]/20">
                           {syncing ? 'Synchronisiere...' : 'Jetzt Synchronisieren'}
                        </button>
                     </div>
                  </div>
               )}

               {/* Info Panel */}
               <div className="bg-[var(--bg2)] p-6 rounded-3xl border border-[var(--line)]">
                  <div className="flex items-center gap-3 mb-6">
                     <Settings2 size={18} className="text-dim" />
                     <h4 className="text-sm font-black text-ink uppercase tracking-widest text-dim">Diagnose</h4>
                  </div>
                  <div className="space-y-3">
                     {[
                       ['Node API (Local)', health?.ok ? 'OK' : 'FAIL'],
                       ['wger (Docker)', wger ? 'OK' : 'FAIL'],
                       ['Storage Path', '~/.aos/fitness/']
                     ].map(([l, v]) => (
                        <div key={l} className="flex items-center justify-between text-[11px] font-mono bg-[var(--bg)] p-3 rounded-xl border border-[var(--line)]">
                           <span className="opacity-40">{l}</span>
                           <span className={`font-black ${v === 'FAIL' ? 'text-red-500' : 'text-[var(--accent)]'}`}>{v}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>
       )}
    </div>
  );
}
