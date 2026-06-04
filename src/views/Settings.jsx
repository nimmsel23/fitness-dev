import { useState, useEffect } from 'react'
import { Activity, Dumbbell, Settings2, Sparkles, RefreshCw, User, LayoutGrid, Clock, Moon, Sun, Check } from 'lucide-react'
import { api } from '../api.js'

export default function Settings({
  hitMode, setHitMode,
  planMode, setPlanMode,
  gender, setGender,
  split, setSplit,
  cycleLength, setCycleLength,
  defaultLocation, setDefaultLocation,
  themeMode, setModeState,
  circLight, setCircLight,
  circDark, setCircDark,
  themes, theme, setThemeState,
  darkThemes, lightThemes,
  age, setAge,
  weightKg, setWeightKg,
  freqPerWeek, setFreqPerWeek,
  DAY_START_PROP, DAY_END_PROP
}) {
  const [health, setHealth] = useState(null)
  const [wger, setWger] = useState(null)
  const [firestoreStatus, setFirestoreStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
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
    <div className="space-y-12 pb-24">
       
       {/* 1. Sync & System Status */}
       <section className="card p-8 border-accent/20 bg-gradient-to-br from-card to-bg2 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
             <div>
                <div className="label-caps !mb-3 text-accent flex items-center gap-2">
                   <Sparkles size={14} className={syncing ? 'animate-spin' : ''} />
                   System & Data
                </div>
                <h3 className="text-2xl font-black text-ink mb-2">Coach Backend</h3>
                <p className="text-sm font-medium opacity-50 max-w-md leading-relaxed">
                   Verwalte die lokale Datenbank und synchronisiere Daten mit Firestore für deine Klienten.
                </p>
             </div>
             
             <div className="flex flex-col gap-3 min-w-[240px]">
                <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-line">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Firestore</span>
                   {firestoreStatus?.ok 
                      ? <span className="text-[9px] font-black uppercase bg-green/10 text-green px-2 py-0.5 rounded-md border border-green/20">Verbunden</span>
                      : <span className="text-[9px] font-black uppercase bg-red/10 text-red px-2 py-0.5 rounded-md border border-red/20">Offline</span>
                   }
                </div>
                <button onClick={handleSync} disabled={syncing} className="btn btn-primary py-4 px-8 font-black uppercase tracking-widest shadow-xl shadow-accent/20">
                   {syncing ? 'Synchronisiere...' : 'Jetzt Synchronisieren'}
                </button>
             </div>
          </div>
       </section>

       {/* 2. Training Settings */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="card p-8 space-y-8">
             <div className="label-caps flex items-center gap-2">
                <Activity size={14} className="text-accent" />
                Training Logik
             </div>
             
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                      <div className="text-sm font-black text-ink">HIT Modus</div>
                      <div className="text-[10px] font-bold opacity-30 uppercase">Recovery-basiertes Training</div>
                   </div>
                   <button onClick={() => setHitMode(!hitMode)}
                      className={`w-12 h-6 rounded-full transition-colors relative border ${hitMode ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hitMode ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>

                <div className="flex items-center justify-between">
                   <div>
                      <div className="text-sm font-black text-ink">Plan Modus</div>
                      <div className="text-[10px] font-bold opacity-30 uppercase">Vorgefertigte Pläne nutzen</div>
                   </div>
                   <button onClick={() => setPlanMode(!planMode)}
                      className={`w-12 h-6 rounded-full transition-colors relative border ${planMode ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${planMode ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
             </div>
          </section>

          <section className="card p-8 space-y-8 text-ink">
             <div className="label-caps flex items-center gap-2 text-dim">
                <User size={14} />
                Biometrie & Split
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Anatomie-Modell</div>
                   <div className="flex gap-1 p-1 bg-bg2 rounded-xl border border-line">
                      {['male', 'female'].map(g => (
                         <button key={g} onClick={() => setGender(g)}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${gender === g ? 'bg-card shadow-md text-accent' : 'text-dim hover:text-ink'}`}>
                            {g === 'male' ? 'Male' : 'Female'}
                         </button>
                      ))}
                   </div>
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Standard Split</div>
                   <div className="flex gap-1 p-1 bg-bg2 rounded-xl border border-line overflow-x-auto hide-scrollbar">
                      {['PPL', 'UL', 'GK'].map(s => (
                         <button key={s} onClick={() => setSplit(s)}
                            className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${split === s ? 'bg-card shadow-md text-accent' : 'text-dim hover:text-ink'}`}>
                            {s}
                         </button>
                      ))}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 block ml-1">Alter</label>
                   <input type="number" value={age} onChange={e => setAge(Number(e.target.value))}
                      className="w-full bg-bg2 border border-line rounded-xl px-4 py-3 text-sm font-bold focus:border-accent outline-none" />
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 block ml-1">Gewicht (kg)</label>
                   <input type="number" value={weightKg} onChange={e => setWeightKg(Number(e.target.value))}
                      className="w-full bg-bg2 border border-line rounded-xl px-4 py-3 text-sm font-bold focus:border-accent outline-none" />
                </div>
             </div>
          </section>
       </div>

       {/* 3. Design & Theme Settings */}
       <section className="card p-8 space-y-10">
          <div className="flex items-center justify-between">
             <div className="label-caps !mb-0 flex items-center gap-2">
                <LayoutGrid size={14} className="text-accent" />
                Interface Design
             </div>
             <button onClick={() => setModeState(themeMode === 'circadian' ? 'manual' : 'circadian')}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${themeMode === 'circadian' ? 'border-accent bg-accent/10 text-accent shadow-lg shadow-accent/10' : 'border-line bg-bg2 text-dim'}`}>
                {themeMode === 'circadian' ? <Clock size={12} /> : <Moon size={12} />}
                {themeMode === 'circadian' ? 'Circadian Aktiv' : 'Manuell'}
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div className="space-y-6">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Theme Palette</div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                   {Object.entries(themes).map(([id, t]) => (
                      <button key={id} onClick={() => { setThemeState(id); setModeState('manual'); }}
                         className={`group relative flex flex-col items-center gap-2 transition-all ${theme === id ? 'scale-110' : 'hover:scale-105'}`}>
                         <div className={`w-12 h-12 rounded-2xl border-4 transition-all shadow-xl flex items-center justify-center ${theme === id ? 'border-accent' : 'border-line group-hover:border-accent/40'}`} style={{ background: t.bg }}>
                            <div className="w-4 h-4 rounded-full" style={{ background: t.accent }} />
                            {theme === id && <Check size={12} className="absolute -top-1 -right-1 text-black bg-accent rounded-full p-0.5" />}
                         </div>
                         <span className={`text-[8px] font-black uppercase tracking-tighter transition-colors ${theme === id ? 'text-accent' : 'opacity-30'}`}>{id}</span>
                      </button>
                   ))}
                </div>
             </div>

             <div className="space-y-8 bg-bg2/50 p-6 rounded-[24px] border border-dashed border-line">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-30 flex items-center gap-2 ml-1">
                   <Clock size={12} /> Circadiane Automatik
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-ink opacity-60">
                         <Sun size={14} className="text-orange" /> Tag
                      </div>
                      <select value={circLight} onChange={e => setCircLight(e.target.value)}
                         className="w-full bg-card border border-line rounded-xl px-4 py-3 text-sm font-bold focus:border-accent outline-none shadow-sm">
                         {Object.keys(themes).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-ink opacity-60">
                         <Moon size={14} className="text-accent" /> Nacht
                      </div>
                      <select value={circDark} onChange={e => setCircDark(e.target.value)}
                         className="w-full bg-card border border-line rounded-xl px-4 py-3 text-sm font-bold focus:border-accent outline-none shadow-sm">
                         {Object.keys(themes).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>
                </div>
                <p className="text-[9px] font-medium opacity-30 leading-relaxed text-center px-4 italic">
                   Das Interface wechselt automatisch zwischen Tag- und Nacht-Theme basierend auf deiner Systemzeit ({DAY_START_PROP}:00 - {DAY_END_PROP}:00 Uhr).
                </p>
             </div>
          </div>
       </section>

       {/* 4. System Info */}
       <section className="card p-8 text-ink">
          <div className="label-caps flex items-center gap-2 text-dim mb-6">
             <Settings2 size={14} />
             System Information
          </div>
          <div className="grid gap-3">
             {[
               ['fitness-dev', health === null ? 'Prüfe…' : health.ok ? `online :${health.port}` : 'offline', health?.ok],
               ['wger', wger === null ? 'Prüfe…' : wger ? 'online :8000' : 'offline', wger],
               ['Daten', '~/.aos/fitness/', true],
               ['Katalog', '~/fitness-dev/catalog/kb/', true],
             ].map(([label, value, ok]) => (
               <div key={label} className="flex items-center justify-between bg-bg2 p-4 rounded-xl border border-line">
                 <span className="text-xs font-bold text-dim">{label}</span>
                 <span className={`text-[11px] font-black uppercase tracking-wider ${ok ? 'text-green' : 'text-red'}`}>{value}</span>
               </div>
             ))}
          </div>
       </section>
    </div>
  )
}
