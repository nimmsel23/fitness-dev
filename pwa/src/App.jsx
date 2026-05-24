import { useState, useEffect, Component } from "react";
import { Activity, BarChart3, BookOpen, Dumbbell, Layers, Search, Settings2, Brain, LogIn, LogOut, User } from "lucide-react";
import Dashboard from "./views/Dashboard.jsx";
import Session from "./views/Session.jsx";
import Journal from "./views/Journal.jsx";
import Muscles from "./views/Muscles.jsx";
import Learn from "./views/Learn.jsx";
import WeeklyReview from "./views/WeeklyReview.jsx";
import { getSettings, saveSettings, watchAuth, signIn, signOut } from "./db.js";

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
  const [sessionDate, setSessionDate] = useState(null)

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
    const updated = { theme, themeMode, circDark, circLight, ...newSettings };
    saveSettings(updated);
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

  if (authLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#090b10]">
      <div className="spinner" />
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-screen px-8 bg-[#090b10] text-white text-center">
      <div className="mb-8 p-6 rounded-full bg-accent/10 border border-accent/20">
        <Dumbbell size={64} className="text-accent" />
      </div>
      <h1 className="text-3xl font-black mb-2 tracking-tight">Fitness PWA</h1>
      <p className="text-dim text-sm mb-12 max-w-xs">
        Logge deine Workouts, tracke deinen Fortschritt und verbessere deine Form.
      </p>
      <button onClick={signIn} className="btn btn-primary px-8 py-4 text-lg shadow-xl">
        <LogIn size={20} /> Mit Google anmelden
      </button>
      <div className="mt-12 label-caps opacity-30">
        AlphaOS Ecosystem
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)', overflow: 'hidden' }}>

      <header style={{ background: 'var(--glass)', borderBottom: '1px solid var(--line)', backdropFilter: 'blur(20px)' }}
        className="flex items-center justify-between px-4 py-2.5 z-20 shrink-0">
        <div className="flex items-center gap-2 font-extrabold text-base tracking-tight">
          <Dumbbell size={22} style={{ color: 'var(--accent)' }} />
          Fitness
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
             <span className="label-caps leading-none">{user.displayName?.split(' ')[0]}</span>
          </div>
          <button onClick={() => navigate('settings')} className="p-2 rounded-xl" style={{ background: tab === 'settings' ? 'var(--bg2)' : 'transparent' }}>
             <User size={18} className={tab === 'settings' ? 'text-accent' : 'text-dim'} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 pb-28">
          <ErrorBoundary key={tab}>
            {tab === 'dash'     && <Dashboard onNavigate={navigate} />}
            {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} />}
            {tab === 'review'   && <WeeklyReview onNavigate={navigate} />}
            {tab === 'journal'  && <Journal />}
            {tab === 'muscles'  && <Muscles />}
            {tab === 'learn'    && <Learn />}
            {tab === 'settings' && (
              <div className="space-y-8">
                 <section className="card flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border-2 border-accent/20">
                       <img src={user.photoURL} alt={user.displayName} />
                    </div>
                    <h2 className="text-lg font-black mb-1">{user.displayName}</h2>
                    <p className="text-xs opacity-40 mb-6">{user.email}</p>
                    <button onClick={signOut} className="btn btn-red px-6 py-2.5">
                       <LogOut size={16} /> Abmelden
                    </button>
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

      <nav style={{ background: 'var(--glass)', borderTop: '1px solid var(--line)', backdropFilter: 'blur(20px)' }}
        className="flex shrink-0 px-2 pb-safe z-20">
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
