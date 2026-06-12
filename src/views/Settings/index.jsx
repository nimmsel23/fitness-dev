import { RefreshCw, Zap, Target, User, LayoutGrid, Clock, Moon, Sun, Save, Check, Sparkles, Settings2, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { api, isLocalMode } from "@db";

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
  sidebarPinned, setSidebarPinned
}) {
  const [health, setHealth] = useState(null)
  const [wger, setWger] = useState(null)
  const [firestoreStatus, setFirestoreStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)

  const [collapsed, setCollapsed] = useState({
    system: true,
    training: false,
    biometry: false,
    design: false,
    experimental: true,
    info: true
  });

  const toggle = (key) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

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
    <div className="space-y-8 pb-32">
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

       {/* 1. Basic / Core Settings (Always Visible or grouped) */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="card p-8 space-y-8">
             <div className="label-caps flex items-center gap-2">
                <User size={14} className="text-accent" />
                Biometrie & Modell
             </div>
             <div className="space-y-6">
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Anatomie-Modell</div>
                   <div className="flex gap-1 p-1 bg-bg2 rounded-xl border border-line">
                      {['male', 'female'].map(g => (
                         <button key={g} onClick={() => { setGender(g); updateSettings?.({gender: g}); }}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${gender === g ? 'bg-card shadow-md text-accent' : 'text-dim hover:text-ink'}`}>
                            {g === 'male' ? 'Male' : 'Female'}
                         </button>
                      ))}
                   </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                   <div>
                      <div className="text-sm font-black text-ink">HIT Modus</div>
                      <div className="text-[10px] font-bold opacity-30 uppercase">Recovery-basiertes Training</div>
                   </div>
                   <button onClick={() => { const next = !hitMode; setHitMode(next); updateSettings?.({hitMode: next}); }}
                      className={`w-12 h-6 rounded-full transition-colors relative border ${hitMode ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hitMode ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
             </div>
          </section>

          <section className="card p-8 space-y-8">
             <div className="label-caps flex items-center gap-2">
                <LayoutGrid size={14} className="text-accent" />
                Interface
             </div>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                      <div className="text-sm font-black text-ink">Sidebar</div>
                      <div className="text-[10px] font-bold opacity-30 uppercase">Permanent fixiert</div>
                   </div>
                   <button onClick={() => { setSidebarPinned(!sidebarPinned); updateSettings?.({ sidebarPinned: !sidebarPinned }); }}
                      className={`w-12 h-6 rounded-full transition-colors relative border ${sidebarPinned ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${sidebarPinned ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1 mb-3">Theme Auswahl</div>
                   <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                      {Object.entries(themes).slice(0, 12).map(([id, t]) => (
                         <button key={id} onClick={() => { setThemeState(id); updateSettings?.({ theme: id, themeMode: 'manual' }); }}
                            className={`shrink-0 w-10 h-10 rounded-xl border-2 transition-all ${theme === id ? 'border-accent scale-110 shadow-lg shadow-accent/20' : 'border-line hover:border-accent/40'}`} 
                            style={{ background: t.bg }}
                            title={id}
                         >
                            <div className="w-2 h-2 mx-auto rounded-full" style={{ background: t.accent }} />
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          </section>
       </div>

       {/* 2. Advanced Sections (Only shown if showAdvanced is true) */}
       {showAdvanced && (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sync & System Status */}
            {isLocalMode() && (
               <section className="card overflow-hidden border-accent/20">
                  <button onClick={() => toggle('system')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all text-left">
                     <div className="flex items-center gap-4">
                        <Sparkles size={20} className={syncing ? 'animate-spin text-accent' : 'text-accent'} />
                        <h3 className="text-lg font-black text-ink">Coach Backend & Sync</h3>
                     </div>
                     {collapsed.system ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {!collapsed.system && (
                     <div className="p-6 pt-0 flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in duration-300">
                        <p className="text-xs font-medium opacity-50 max-w-md">Verwalte die lokale Datenbank und synchronisiere Daten mit Firestore.</p>
                        <div className="flex flex-col gap-3 min-w-[240px]">
                           <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-line">
                              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Firestore Status</span>
                              {firestoreStatus?.ok 
                                 ? <span className="text-[8px] font-black uppercase bg-green/10 text-green px-2 py-0.5 rounded-md border border-green/20">Verbunden</span>
                                 : <span className="text-[8px] font-black uppercase bg-red/10 text-red px-2 py-0.5 rounded-md border border-red/20">Offline</span>
                              }
                           </div>
                           <button onClick={handleSync} disabled={syncing} className="btn btn-primary py-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20">
                              {syncing ? 'Synchronisiere...' : 'Jetzt Synchronisieren'}
                           </button>
                        </div>
                     </div>
                  )}
               </section>
            )}

            {/* Detailed Training Logic */}
            <section className="card overflow-hidden">
               <button onClick={() => toggle('training')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all text-left">
                  <div className="flex items-center gap-4">
                     <Zap size={20} className="text-accent" />
                     <h3 className="text-lg font-black text-ink">Detaillierte Trainingslogik</h3>
                  </div>
                  {collapsed.training ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
               </button>
               {!collapsed.training && (
                  <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                     <div className="space-y-6">
                        <div>
                           <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-black">Recent-Fenster</div>
                              <span className="text-xs font-black text-accent">{recentDays} Tage</span>
                           </div>
                           <input type="range" min="1" max="30" value={recentDays} onChange={(e) => setRecentDays(parseInt(e.target.value))} className="w-full accent-accent h-1" />
                        </div>
                        <div>
                           <div className="flex items-center justify-between mb-2">
                              <div className="text-xs font-black">Coverage Threshold</div>
                              <span className="text-xs font-black text-accent">{coverageThreshold} Sätze</span>
                           </div>
                           <input type="range" min="0.5" max="10" step="0.5" value={coverageThreshold} onChange={(e) => setCoverageThreshold(parseFloat(e.target.value))} className="w-full accent-accent h-1" />
                        </div>
                     </div>
                     <div className="flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                           <div className="text-xs font-black">Plan Modus</div>
                           <button onClick={() => setPlanMode(!planMode)} className={`w-10 h-5 rounded-full relative transition-all ${planMode ? 'bg-accent' : 'bg-bg2 border border-line'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${planMode ? 'left-5' : 'left-0.5'}`} />
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </section>

            {/* Design & Scaling */}
            <section className="card overflow-hidden">
               <button onClick={() => toggle('design')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all text-left">
                  <div className="flex items-center gap-4">
                     <LayoutGrid size={20} className="text-accent" />
                     <h3 className="text-lg font-black text-ink">Design & Automatisierung</h3>
                  </div>
                  {collapsed.design ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
               </button>
               {!collapsed.design && (
                  <div className="p-6 pt-0 space-y-8 animate-in fade-in duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <div className="text-xs font-black uppercase opacity-30">Layout Skalierung</div>
                           <input type="range" min="70" max="150" step="5" value={layoutScale} onChange={(e) => setLayoutScale(parseInt(e.target.value))} className="w-full accent-accent h-1" />
                           <div className="flex justify-between text-[10px] font-black opacity-30 uppercase">
                              <span>70%</span>
                              <span>{layoutScale}%</span>
                              <span>150%</span>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="text-xs font-black uppercase opacity-30">Circadianer Modus</div>
                              <button onClick={() => setModeState(themeMode === 'circadian' ? 'manual' : 'circadian')} 
                                 className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all ${themeMode === 'circadian' ? 'border-accent bg-accent/10 text-accent' : 'border-line text-dim'}`}>
                                 {themeMode === 'circadian' ? 'Aktiv' : 'Inaktiv'}
                              </button>
                           </div>
                           {themeMode === 'circadian' && (
                              <div className="grid grid-cols-2 gap-4">
                                 <select value={circLight} onChange={e => setCircLight(e.target.value)} className="bg-bg2 border border-line rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none">
                                    {Object.keys(themes).map(t => <option key={t} value={t}>☀️ {t}</option>)}
                                 </select>
                                 <select value={circDark} onChange={e => setCircDark(e.target.value)} className="bg-bg2 border border-line rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none">
                                    {Object.keys(themes).map(t => <option key={t} value={t}>🌙 {t}</option>)}
                                 </select>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </section>

            {/* Experimental & Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <section className="card overflow-hidden border-dashed border-accent/20">
                  <button onClick={() => toggle('experimental')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all text-left">
                     <div className="flex items-center gap-3">
                        <Sparkles size={18} className="text-accent" />
                        <h3 className="text-sm font-black text-ink uppercase tracking-widest">Labor</h3>
                     </div>
                     {collapsed.experimental ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {!collapsed.experimental && (
                     <div className="p-6 pt-0 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black opacity-40 uppercase">Highlighter</span>
                           <div className="flex bg-bg2 p-1 rounded-lg border border-line">
                              {['body', 'muscles'].map(m => (
                                 <button key={m} onClick={() => setDashboardHighlighter(m)} className={`px-2 py-1 text-[8px] font-black uppercase rounded ${dashboardHighlighter === m ? 'bg-accent text-black' : 'text-dim'}`}>{m}</button>
                              ))}
                           </div>
                        </div>
                     </div>
                  )}
               </section>

               <section className="card overflow-hidden">
                  <button onClick={() => toggle('info')} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all text-left">
                     <div className="flex items-center gap-3">
                        <Settings2 size={18} className="text-dim" />
                        <h3 className="text-sm font-black text-ink uppercase tracking-widest text-dim">System Info</h3>
                     </div>
                     {collapsed.info ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {!collapsed.info && (
                     <div className="p-6 pt-0 space-y-2 animate-in fade-in duration-300">
                        {[
                          ['API', health?.ok ? 'OK' : 'FAIL'],
                          ['wger', wger ? 'OK' : 'FAIL'],
                          ['Storage', '~/.aos/fitness/']
                        ].map(([l, v]) => (
                           <div key={l} className="flex justify-between text-[10px] font-mono">
                              <span className="opacity-40">{l}:</span>
                              <span className={v === 'FAIL' ? 'text-red' : 'text-accent'}>{v}</span>
                           </div>
                        ))}
                     </div>
                  )}
               </section>
            </div>
         </div>
       )}
    </div>
  );
}
