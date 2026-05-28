import { useState, useEffect, Component } from "react";
import { Activity, BarChart3, BookOpen, Dumbbell, Layers, Search, Settings2, Brain, LogIn, LogOut, User, Target, Sparkles, RefreshCw } from "lucide-react";
import Dashboard from "./views/Dashboard.jsx";
import Session from "./views/Session.jsx";
import Journal from "./views/Journal.jsx";
import Muscles from "./views/Muscles.jsx";
import Learn from "./views/Learn.jsx";
import WeeklyReview from "./views/WeeklyReview.jsx";
import Habits from "./views/Habits.jsx";
import { getSettings, saveSettings, watchAuth, signIn, signOut, signInEmail, signUpEmail } from "./db.js";
import { registerServiceWorkerUpdate } from "./lib/pwa-update.js";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 24, color: "#ff6584", background: "var(--bg)", height: '100vh' }}>
        <strong>Fehler:</strong> {this.state.error.message}
        <br />
        <button onClick={() => this.setState({ error: null })} style={{ marginTop: 12, padding: "6px 14px", borderRadius: 8, border: "1px solid #ff6584", background: "transparent", color: "#ff6584", cursor: "pointer" }}>
          Zurück
        </button>
      </div>
    );
    return this.props.children;
  }
}

const VALID_TABS = new Set(['dash', 'session', 'review', 'learn', 'journal', 'habits', 'muscles', 'settings'])

const TABS = [
  { id: 'dash',     label: 'Heute',    Icon: Activity },
  { id: 'session',  label: 'Training', Icon: Dumbbell },
  { id: 'review',   label: 'Review',   Icon: BarChart3 },
  { id: 'habits',   label: 'Habits',   Icon: Target },
  { id: 'learn',    label: 'Lernen',   Icon: Search },
  { id: 'journal',  label: 'Journal',  Icon: BookOpen },
  { id: 'muscles',  label: 'Muskeln',  Icon: Layers },
  { id: 'settings', label: 'Setup',    Icon: Settings2 },
]

export const DARK_THEMES  = ['honey','mocha','macchiato','frappe','dracula','dracula-purple','nordic','nordic-darker','nordic-bluish','arc-dark','sweet','sweet-purple','sweet-mars','sweet-amber-blue','ant-dark','materia','solarized-dark','nothing','gruvbox','homunculus']
export const LIGHT_THEMES = ['latte','alucard','arc','solarized','ant']

const DAY_START = 6
const DAY_END   = 20

function getHashTab() {
  const hash = window.location.hash.slice(1)
  return VALID_TABS.has(hash) ? hash : 'dash'
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t === 'honey' ? '' : t)
}

export default function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab]             = useState(getHashTab)
  const [theme, setThemeState]    = useState('honey')
  const [themeMode, setModeState] = useState('manual')
  const [circDark,  setCircDark]  = useState('honey')
  const [circLight, setCircLight] = useState('latte')
  const [hitMode, setHitMode]     = useState(false)
  const [planMode, setPlanMode]   = useState(false)
  const [gender, setGender]       = useState('male')
  const [split, setSplit]         = useState('PPL')
  const [cycleLength, setCycleLength] = useState(4)
  const [trainingGoal, setTrainingGoal] = useState('Hypertrophie')
  const [defaultLocation, setDefaultLocation] = useState('Gym')
  const [sessionDate, setSessionDate] = useState(null)

  // Auth form state
  const [isSignup, setIsSignup]   = useState(false)
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [name, setName]           = useState('')
  const [error, setError]         = useState(null)

  // Watch Auth State
  useEffect(() => {
    registerServiceWorkerUpdate(() => setUpdateAvailable(true));
    return watchAuth((u) => {
      setUser(user); // Force refresh context if needed
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  // Load settings from Firestore when user changes
  useEffect(() => {
    if (!user) return;
    getSettings().then(s => {
      if (s.theme) setThemeState(s.theme);
      if (s.themeMode) setModeState(s.themeMode);
      if (s.circDark) setCircDark(s.circDark);
      if (s.circLight) setCircLight(s.circLight);
      if (s.hitMode !== undefined) setHitMode(s.hitMode);
      if (s.planMode !== undefined) setPlanMode(s.planMode);
      if (s.gender) setGender(s.gender);
      if (s.split) setSplit(s.split);
      if (s.cycleLength) setCycleLength(s.cycleLength);
      if (s.trainingGoal) setTrainingGoal(s.trainingGoal);
      if (s.defaultLocation) setDefaultLocation(s.defaultLocation);
      if (s.themeMode !== 'circadian') applyTheme(s.theme || 'honey');
    });
  }, [user]);

  // Circadian: tick every minute
  useEffect(() => {
    if (themeMode !== 'circadian') return
    function tick() {
      const h = new Date().getHours()
      const t = h >= DAY_START && h < DAY_END ? circLight : circDark
      setThemeState(t)
      applyTheme(t)
    }
    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [themeMode, circDark, circLight])

  // Manual theme → apply to DOM
  useEffect(() => {
    if (themeMode !== 'circadian') applyTheme(theme)
  }, [theme, themeMode])

  // Sync tab → URL hash
  useEffect(() => {
    if (window.location.hash.slice(1) !== tab) history.pushState(null, '', `#${tab}`)
  }, [tab])

  useEffect(() => {
    function onPopState() { setTab(getHashTab()) }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function updateSettings(newSettings) {
    const updated = { theme, themeMode, circDark, circLight, hitMode, planMode, gender, split, ...newSettings };
    saveSettings(updated);
  }

  function toggleHitMode() {
    const next = !hitMode;
    setHitMode(next);
    updateSettings({ hitMode: next });
  }

  function setManualSplit(s) {
    setSplit(s);
    updateSettings({ split: s });
  }

  function setManualTheme(t) {
    console.log("Setting manual theme:", t);
    setModeState('manual')
    setThemeState(t)
    updateSettings({ theme: t, themeMode: 'manual' });
  }

  function navigate(id, date = null) {
    console.log("Navigating to:", id);
    setTab(id);
    if (date) setSessionDate(date);
    else if (id !== 'session') setSessionDate(null);
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setError(null);
    try {
      if (isSignup) {
        await signUpEmail(email, password, name);
      } else {
        await signInEmail(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (authLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#090b10]">
      <div className="spinner" />
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 py-12 bg-[#090b10] text-white text-center">
      <div className="mb-8 p-6 rounded-full bg-accent/10 border border-accent/20">
        <Dumbbell size={64} className="text-accent" />
      </div>
      <h1 className="text-3xl font-black mb-2 tracking-tight">Fitness PWA</h1>
      <p className="text-dim text-sm mb-12 max-w-xs">
        Logge deine Workouts, tracke deinen Fortschritt und verbessere deine Form.
      </p>
      
      <div className="w-full max-w-sm space-y-4">
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignup && (
            <input 
              type="text" 
              placeholder="Name" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          )}
          <input 
            type="email" 
            placeholder="E-Mail" 
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Passwort" 
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-accent outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          
          {error && <p className="text-red-400 text-xs text-left px-1">{error}</p>}

          <button type="submit" className="btn btn-primary w-full py-4 text-lg shadow-xl">
            {isSignup ? 'Registrieren' : 'Anmelden'}
          </button>
        </form>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] uppercase tracking-widest opacity-30 font-bold">oder</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button onClick={signIn} className="w-full flex items-center justify-center gap-3 px-8 py-3.5 bg-white text-black rounded-xl font-bold transition-transform active:scale-95">
          <LogIn size={20} /> Mit Google anmelden
        </button>

        <button 
          onClick={() => setIsSignup(!isSignup)} 
          className="text-xs text-dim hover:text-white transition-colors mt-4"
        >
          {isSignup ? 'Bereits ein Konto? Hier anmelden' : 'Noch kein Konto? Hier registrieren'}
        </button>
      </div>

      <div className="mt-12 label-caps opacity-30">
        AlphaOS Ecosystem
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-dvh" style={{ background: 'var(--bg)', color: 'var(--ink)', overflow: 'hidden' }}>

      <header style={{ background: 'var(--glass)', borderBottom: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)' }}
        className="flex lg:hidden items-center justify-between px-4 py-2.5 z-20 shrink-0">
        <div className="flex items-center gap-2 font-extrabold text-base tracking-tight">
          <Dumbbell size={22} style={{ color: 'var(--accent)' }} />
          Fitness
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
             <span className="label-caps leading-none">
               {user.displayName ? user.displayName.split(' ')[0] : user.email?.split('@')[0]}
             </span>
          </div>
          <button onClick={() => navigate('settings')} className="p-2 rounded-xl" style={{ background: tab === 'settings' ? 'var(--bg2)' : 'transparent' }}>
             <User size={18} className={tab === 'settings' ? 'text-accent' : 'text-dim'} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 main-wrapper">
        <aside className="desktop-sidebar hidden lg:flex">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter mb-12 px-2">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Dumbbell size={28} className="text-black" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight">Fitness</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 -mt-1">AlphaOS</span>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {TABS.map(({ id, Icon, label }) => (
              <button key={id} onClick={() => navigate(id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === id ? 'bg-accent text-black shadow-lg shadow-accent/10' : 'text-dim hover:bg-white/5 hover:text-ink'}`}>
                <Icon size={18} className={tab === id ? 'text-black' : 'text-dim group-hover:text-accent'} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-line/50">
            <button onClick={() => navigate('settings')} 
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${tab === 'settings' ? 'bg-white/5 border border-line' : 'hover:bg-white/5'}`}>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-accent/20 bg-bg2 flex items-center justify-center shrink-0">
                {user.photoURL ? <img src={user.photoURL} alt="" /> : <User size={20} className="text-accent" />}
              </div>
              <div className="flex-1 text-left truncate">
                <div className="text-xs font-black text-ink truncate">{user.displayName || user.email?.split('@')[0]}</div>
                <div className="text-[10px] font-bold opacity-30 truncate uppercase tracking-tighter">{user.email}</div>
              </div>
              <Settings2 size={16} className={tab === 'settings' ? 'text-accent' : 'text-dim'} />
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 py-6 lg:py-10 pb-28 lg:pb-10">
            <ErrorBoundary key={tab}>
              {tab === 'dash'     && <Dashboard onNavigate={navigate} />}
              {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} hitMode={hitMode} planMode={planMode} />}
              {tab === 'review'   && <WeeklyReview onNavigate={navigate} />}
              {tab === 'habits'   && <Habits />}
              {tab === 'journal'  && <Journal />}
              {tab === 'muscles'  && <Muscles hitMode={hitMode} gender={gender} />}
              {tab === 'learn'    && <Learn />}
              {tab === 'settings' && (
                <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                   {/* 1. Account */}
                   <section className="card flex flex-row items-center gap-6 p-6">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent/20 flex items-center justify-center bg-accent/10">
                         {user.photoURL ? (
                           <img src={user.photoURL} alt={user.displayName} />
                         ) : (
                           <User size={32} className="text-accent" />
                         )}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-black text-ink">{user.displayName || user.email?.split('@')[0]}</h2>
                        <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{user.email}</p>
                      </div>
                      <button onClick={signOut} className="btn btn-red px-6 py-2">
                         <LogOut size={16} />
                      </button>
                   </section>

                   {/* 2. Training Settings */}
                   <section className="card p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Dumbbell size={18} className="text-accent" />
                        <h2 className="text-base font-black uppercase tracking-widest text-ink">Training Einstellungen</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="text-left">
                                 <div className="text-sm font-bold text-ink">HIT Modus</div>
                                 <div className="text-[10px] font-bold opacity-30 uppercase tracking-tight">Standard-Modus für neue Sessions</div>
                              </div>
                              <button onClick={() => { const next = !hitMode; setHitMode(next); updateSettings({hitMode: next}); }} 
                                className={`w-12 h-6 rounded-full transition-colors relative border-2 ${hitMode ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform bg-white shadow-sm ${hitMode ? 'right-0.5' : 'left-0.5'}`} />
                              </button>
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="text-left">
                                 <div className="text-sm font-bold text-ink">Plan Mode</div>
                                 <div className="text-[10px] font-bold opacity-30 uppercase tracking-tight">Zukünftige Workouts planen</div>
                              </div>
                              <button onClick={() => { const next = !planMode; setPlanMode(next); updateSettings({planMode: next}); }} 
                                className={`w-12 h-6 rounded-full transition-colors relative border-2 ${planMode ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform bg-white shadow-sm ${planMode ? 'right-0.5' : 'left-0.5'}`} />
                              </button>
                           </div>
                           <div className="flex items-center justify-between">
                              <div className="text-left">
                                 <div className="text-sm font-bold text-ink">Geschlecht</div>
                                 <div className="text-[10px] font-bold opacity-30 uppercase tracking-tight">Für anatomische Darstellung</div>
                              </div>
                              <div className="flex bg-bg2 rounded-lg p-1">
                                 {['male', 'female'].map(g => (
                                   <button key={g} onClick={() => { setGender(g); updateSettings({gender: g}); }}
                                     className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${gender === g ? 'bg-accent text-black' : 'text-dim'}`}>
                                     {g}
                                   </button>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="text-left">
                              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-3">Aktueller Split</div>
                              <div className="flex flex-wrap gap-2">
                                 {['PPL', 'Upper/Lower', 'Full Body', 'Bro-Split', 'Custom'].map(s => (
                                   <button key={s} onClick={() => { setSplit(s); updateSettings({split: s}); }}
                                     className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${split === s ? 'border-accent bg-accent text-black shadow-lg shadow-accent/20' : 'border-line bg-bg2 text-muted hover:text-ink'}`}>
                                     {s}
                                   </button>
                                 ))}
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="label-caps !mb-2">Zyklus (Wochen)</label>
                                 <input type="number" value={cycleLength} onChange={e => { setCycleLength(Number(e.target.value)); updateSettings({cycleLength: Number(e.target.value)}) }}
                                    className="bg-bg2 border-line rounded-xl px-3 py-2 text-xs font-bold w-full" />
                              </div>
                              <div>
                                 <label className="label-caps !mb-2">Standard-Ort</label>
                                 <input type="text" value={defaultLocation} onChange={e => { setDefaultLocation(e.target.value); updateSettings({defaultLocation: e.target.value}) }}
                                    className="bg-bg2 border-line rounded-xl px-3 py-2 text-xs font-bold w-full" />
                              </div>
                           </div>
                        </div>
                      </div>
                   </section>

                   {/* 3. Appearance */}
                   <section className="card p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Activity size={18} className="text-accent" />
                        <h2 className="text-base font-black uppercase tracking-widest text-ink">Darstellung</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                        <div>
                          <h3 className="label-caps mb-4 ml-1">Dark Themes</h3>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                             {DARK_THEMES.map(t => (
                               <button key={t} onClick={() => setManualTheme(t)} 
                                 className={`p-2 rounded-xl text-[9px] font-black border truncate transition-all active:scale-95 ${theme === t ? 'border-accent bg-accent text-black' : 'bg-bg2 border-line text-ink'}`}
                                 style={{ borderColor: theme === t ? 'var(--accent)' : '' }}>
                                 {t}
                               </button>
                             ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="label-caps mb-4 ml-1">Light Themes</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                             {LIGHT_THEMES.map(t => (
                               <button key={t} onClick={() => setManualTheme(t)} 
                                 className={`p-2 rounded-xl text-[9px] font-black border truncate transition-all active:scale-95 ${theme === t ? 'border-accent bg-accent text-black' : 'bg-bg2 border-line text-ink'}`}
                                 style={{ borderColor: theme === t ? 'var(--accent)' : '' }}>
                                 {t}
                               </button>
                             ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-line/50 flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-ink">🌅 Circadian Mode</span>
                            <span className="text-[10px] font-bold opacity-30 uppercase tracking-tight">Tag/Nacht Automatik</span>
                         </div>
                         <button onClick={() => { const next = themeMode === 'circadian' ? 'manual' : 'circadian'; setModeState(next); updateSettings({themeMode: next}); }}
                           className={`w-12 h-6 rounded-full transition-colors relative border-2 ${themeMode === 'circadian' ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                           <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform bg-white shadow-sm ${themeMode === 'circadian' ? 'right-0.5' : 'left-0.5'}`} />
                         </button>
                      </div>
                   </section>

                   {/* 4. Roadmap & System */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <section className="card p-6 opacity-80 border-dashed">
                        <div className="flex items-center gap-2 mb-6">
                          <Sparkles size={18} className="text-accent" />
                          <h2 className="text-sm font-black uppercase tracking-widest text-ink">Roadmap</h2>
                        </div>
                        <div className="text-[11px] font-bold space-y-2 text-ink/60">
                           <div><span className="text-accent">V1.2:</span> Progress (1RM, Charts, Fatigue)</div>
                           <div><span className="text-accent">V1.5:</span> Social (Shared, Profiles)</div>
                           <div><span className="text-accent">V2.0:</span> Intelligence (AI Coach, Form)</div>
                        </div>
                     </section>

                     <section className="card p-6 opacity-80 border-dashed">
                        <div className="flex items-center gap-2 mb-4">
                          <Settings2 size={18} className="text-dim" />
                          <h2 className="text-sm font-black uppercase tracking-widest text-muted">System</h2>
                        </div>
                        <div className="flex items-center justify-between py-1">
                           <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Plattform</span>
                           <span className="text-[10px] font-black text-ink">Firebase</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-t border-line/30 mt-2 pt-2">
                           <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Status</span>
                           <span className="text-[9px] font-black px-2 py-0.5 rounded bg-green/10 text-green border border-green/20">CONNECTED</span>
                        </div>
                     </section>
                   </div>
                </div>
              )}
            </ErrorBoundary>
          </div>
        </main>
        </div>

        {updateAvailable && (
        <button onClick={() => window.location.reload()}
          className="fixed bottom-24 right-6 bg-accent text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest animate-bounce z-50">
          <RefreshCw size={18} /> Update verfügbar – Jetzt laden
        </button>
        )}

        <nav style={{ background: 'var(--glass)', borderTop: '1px solid var(--line)', backdropFilter: 'blur(20px)' }}
          className="bottom-nav flex lg:hidden shrink-0 px-2 pb-safe z-20">
        {TABS.map(({ id, Icon, label }) => (
          <button key={id} onClick={() => navigate(id)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-semibold tracking-wide transition-all"
            style={{ color: tab === id ? 'var(--accent)' : 'var(--dim)', background: 'none', border: 'none' }}>
            <Icon size={22} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
