import { useState, useEffect, Component } from "react";
import { Activity, BarChart3, BookOpen, Dumbbell, Layers, Search, Settings2, Brain, LogIn, LogOut, User } from "lucide-react";
import Dashboard from "./views/Dashboard.jsx";
import Session from "./views/Session.jsx";
import Journal from "./views/Journal.jsx";
import Muscles from "./views/Muscles.jsx";
import Learn from "./views/Learn.jsx";
import WeeklyReview from "./views/WeeklyReview.jsx";
import { getSettings, saveSettings, watchAuth, signIn, signOut, signInEmail, signUpEmail } from "./db.js";

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

const VALID_TABS = new Set(['dash', 'session', 'review', 'learn', 'journal', 'muscles', 'settings'])

const TABS = [
  { id: 'dash',     label: 'Heute',    Icon: Activity },
  { id: 'session',  label: 'Training', Icon: Dumbbell },
  { id: 'review',   label: 'Review',   Icon: BarChart3 },
  { id: 'learn',    label: 'Lernen',   Icon: Search },
  { id: 'journal',  label: 'Journal',  Icon: BookOpen },
  { id: 'muscles',  label: 'Muskeln',  Icon: Layers },
  { id: 'settings', label: 'Setup',    Icon: Settings2 },
]

export const DARK_THEMES  = ['honey','mocha','macchiato','frappe','dracula','dracula-purple','nordic','nordic-darker','nordic-bluish','arc-dark','sweet','sweet-purple','ant-dark','materia','solarized-dark','nothing']
export const LIGHT_THEMES = ['latte','alucard','arc','solarized']

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
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab]             = useState(getHashTab)
  const [theme, setThemeState]    = useState('honey')
  const [themeMode, setModeState] = useState('manual')
  const [circDark,  setCircDark]  = useState('honey')
  const [circLight, setCircLight] = useState('latte')
  const [hitMode, setHitMode]     = useState(false)
  const [split, setSplit]         = useState('PPL')
  const [sessionDate, setSessionDate] = useState(null)

  // Auth form state
  const [isSignup, setIsSignup]   = useState(false)
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [name, setName]           = useState('')
  const [error, setError]         = useState(null)

  // Watch Auth State
  useEffect(() => {
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
      if (s.split) setSplit(s.split);
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
    const updated = { theme, themeMode, circDark, circLight, hitMode, split, ...newSettings };
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
    setModeState('manual')
    setThemeState(t)
    updateSettings({ theme: t, themeMode: 'manual' });
  }

  function navigate(id, date = null) {
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
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)', overflow: 'hidden' }}>

      <header style={{ background: 'var(--glass)', borderBottom: '1px solid var(--line)', backdropFilter: 'blur(20px)' }}
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

      <div className="flex-1 flex overflow-hidden main-wrapper">
        <aside className="desktop-sidebar hidden lg:flex">
          <div className="flex items-center gap-3 font-black text-xl tracking-tighter mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Dumbbell size={24} className="text-accent" />
            </div>
            <span>Fitness</span>
          </div>

          <nav className="flex-1 space-y-1">
            {TABS.map(({ id, Icon, label }) => (
              <button key={id} onClick={() => navigate(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${tab === id ? 'bg-accent/10 text-accent' : 'text-dim hover:bg-white/5 hover:text-ink'}`}>
                <Icon size={20} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-line">
            <button onClick={() => navigate('settings')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${tab === 'settings' ? 'bg-accent/10 text-accent' : 'text-dim hover:bg-white/5 hover:text-ink'}`}>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-line bg-bg2 flex items-center justify-center">
                {user.photoURL ? <img src={user.photoURL} alt="" /> : <User size={16} />}
              </div>
              <div className="flex-1 text-left truncate">
                <div className="text-xs truncate">{user.displayName || user.email?.split('@')[0]}</div>
                <div className="text-[10px] opacity-40 truncate">{user.email}</div>
              </div>
              <Settings2 size={16} />
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 py-6 lg:py-10 pb-28 lg:pb-10">
            <ErrorBoundary key={tab}>
              {tab === 'dash'     && <Dashboard onNavigate={navigate} />}
              {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} hitMode={hitMode} />}
              {tab === 'review'   && <WeeklyReview onNavigate={navigate} />}
              {tab === 'journal'  && <Journal />}
              {tab === 'muscles'  && <Muscles />}
              {tab === 'learn'    && <Learn />}
              {tab === 'settings' && (
                <div className="space-y-8 max-w-2xl">
                   <section className="card flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-accent/20 flex items-center justify-center bg-accent/10">
                         {user.photoURL ? (
                           <img src={user.photoURL} alt={user.displayName} />
                         ) : (
                           <User size={32} className="text-accent" />
                         )}
                      </div>
                      <h2 className="text-lg font-black mb-1">{user.displayName || user.email?.split('@')[0]}</h2>
                      <p className="text-xs opacity-40 mb-6">{user.email}</p>
                      <button onClick={signOut} className="btn btn-red px-6 py-2.5">
                         <LogOut size={16} /> Abmelden
                      </button>
                   </section>

                   <section className="card">
                      <h2 className="label-caps mb-4">Modus</h2>
                      <div className="flex items-center justify-between mb-6">
                         <div className="text-left">
                            <div className="text-sm font-bold text-ink">HIT Modus</div>
                            <div className="text-[10px] opacity-40">Rest-Hours statt Volumen</div>
                         </div>
                         <button onClick={toggleHitMode} 
                           className={`w-10 h-5 rounded-full transition-colors relative border ${hitMode ? 'bg-accent border-accent' : 'bg-bg2 border-line'}`}>
                           <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-transform bg-white ${hitMode ? 'right-0.5' : 'left-0.5'}`} />
                         </button>
                      </div>

                      <div className="text-left">
                         <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-3">Aktueller Split</div>
                         <div className="flex flex-wrap gap-2">
                            {['PPL', 'Upper/Lower', 'Full Body', 'Bro-Split', 'Custom'].map(s => (
                              <button key={s} onClick={() => setManualSplit(s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${split === s ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-bg2 text-muted'}`}>
                                {s}
                              </button>
                            ))}
                         </div>
                      </div>
                   </section>

                   <section>
                      <h2 className="label-caps mb-4 ml-1">Themen Auswahl</h2>
                      <div className="grid grid-cols-3 gap-2">
                         {DARK_THEMES.map(t => (
                           <button key={t} onClick={() => setManualTheme(t)} 
                             className="p-3 rounded-xl text-[10px] font-bold border truncate"
                             style={{ background: theme === t ? 'var(--accent)' : 'var(--bg2)', color: theme === t ? '#000' : 'var(--ink)', borderColor: theme === t ? 'var(--accent)' : 'var(--line)' }}>
                             {t}
                           </button>
                         ))}
                      </div>
                   </section>
                </div>
              )}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <nav style={{ background: 'var(--glass)', borderTop: '1px solid var(--line)', backdropFilter: 'blur(20px)' }}
        className="bottom-nav flex shrink-0 px-2 pb-safe z-20">
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
