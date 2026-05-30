import { useState, useEffect, Component } from "react";
import { Activity, BarChart3, BookOpen, Dumbbell, Layers, Search, Settings2, Brain, LogIn, LogOut, User, Target, Sparkles, RefreshCw } from "lucide-react";
import Dashboard from "./views/Dashboard/index.jsx";
import Session from "./views/Session/index.jsx";
import Journal from "./views/Journal/index.jsx";
import Muscles from "./views/Muscles/index.jsx";
import Learn from "./views/Learn/index.jsx";
import WeeklyReview from "./views/WeeklyReview/index.jsx";
import Habits from "./views/Habits/index.jsx";
import Settings from "./views/Settings/index.jsx";
import { getSettings, saveSettings, watchAuth, signIn, signOut, signInEmail, signUpEmail } from "./db.js";
import { registerServiceWorkerUpdate } from "./lib/pwa-update.js";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div className="p-8 bg-red/10 text-red rounded-3xl border border-red/20 m-4">
        <h2 className="font-black mb-2 uppercase tracking-widest text-xs">Runtime Error</h2>
        <p className="text-sm opacity-80 font-bold">{this.state.error.message}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red text-white rounded-xl text-xs font-black uppercase">Reload App</button>
      </div>
    );
    return this.props.children;
  }
}

const DARK_THEMES = ['nordic', 'dracula', 'midnight', 'matrix', 'forest', 'crimson', 'slate', 'zinc'];
const LIGHT_THEMES = ['honey', 'snow', 'rose', 'latte', 'mint', 'cyan', 'gold'];

const THEMES = {
  nordic:   { bg: '#2e3440', accent: '#88c0d0' },
  dracula:  { bg: '#282a36', accent: '#bd93f9' },
  midnight: { bg: '#090b10', accent: '#3b82f6' },
  matrix:   { bg: '#000000', accent: '#00ff41' },
  forest:   { bg: '#1a2f23', accent: '#4ade80' },
  crimson:  { bg: '#1a0f12', accent: '#f43f5e' },
  slate:    { bg: '#0f172a', accent: '#38bdf8' },
  zinc:     { bg: '#18181b', accent: '#a1a1aa' },
  honey:    { bg: '#fffaf0', accent: '#f59e0b' },
  snow:     { bg: '#ffffff', accent: '#3b82f6' },
  rose:     { bg: '#fff1f2', accent: '#f43f5e' },
  latte:    { bg: '#f5e0dc', accent: '#1e66f5' },
  mint:     { bg: '#f0fff4', accent: '#10b981' },
  cyan:     { bg: '#ecfeff', accent: '#06b6d4' },
  gold:     { bg: '#fffbeb', accent: '#d97706' }
};

const VALID_TABS = new Set(['dash', 'session', 'review', 'learn', 'journal', 'habits', 'muscles', 'settings'])

const NAV_ITEMS = [
  { id: 'dash',     label: 'Heute',    Icon: Activity },
  { id: 'session',  label: 'Training', Icon: Dumbbell },
  { id: 'habits',   label: 'Habits',   Icon: Target },
  { id: 'journal',  label: 'Journal',  Icon: BookOpen },
  { id: 'muscles',  label: 'Muskeln',  Icon: Brain },
  { id: 'review',   label: 'Review',   Icon: BarChart3 },
  { id: 'learn',    label: 'Lernen',   Icon: Sparkles },
  { id: 'settings', label: 'Setup',    Icon: Settings2 },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState(() => {
     const p = window.location.pathname.replace(/^\//, '')
     return VALID_TABS.has(p) ? p : 'dash'
  });
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState('nordic');
  const [themeMode, setModeState] = useState('manual');
  const [circLight, setCircLight] = useState('honey');
  const [circDark, setCircDark] = useState('nordic');
  const [hitMode, setHitMode] = useState(false);
  const [planMode, setPlanMode] = useState(false);
  const [gender, setGender] = useState('male');
  const [split, setSplit] = useState('PPL');
  const [cycleLength, setCycleLength] = useState(4);
  const [defaultLocation, setDefaultLocation] = useState('Home');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  function navigate(id) {
    setTab(id)
    window.history.pushState(null, '', `/${id}`)
  }

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.replace(/^\//, '')
      setTab(VALID_TABS.has(p) ? p : 'dash')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    return watchAuth((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    getSettings().then(s => {
      if (s.theme) setThemeState(s.theme);
      if (s.themeMode) setModeState(s.themeMode);
      if (s.circLight) setCircLight(s.circLight);
      if (s.circDark) setCircDark(s.circDark);
      if (s.hitMode !== undefined) setHitMode(s.hitMode);
      if (s.planMode !== undefined) setPlanMode(s.planMode);
      if (s.gender) setGender(s.gender);
      if (s.split) setSplit(s.split);
      if (s.cycleLength) setCycleLength(s.cycleLength);
      if (s.defaultLocation) setDefaultLocation(s.defaultLocation);
    });
  }, [user]);

  useEffect(() => {
    if (themeMode === 'manual') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      const hour = new Date().getHours();
      const current = (hour >= 8 && hour < 20) ? circLight : circDark;
      document.documentElement.setAttribute('data-theme', current);
    }
  }, [theme, themeMode, circLight, circDark]);

  useEffect(() => {
    registerServiceWorkerUpdate(() => setUpdateAvailable(true));
  }, []);

  function updateSettings(newSettings) {
    const updated = { theme, themeMode, circDark, circLight, hitMode, planMode, gender, split, cycleLength, defaultLocation, ...newSettings };
    saveSettings(updated);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isRegistering) {
        await signUpEmail(email, password);
      } else {
        await signInEmail(email, password);
      }
    } catch (err) {
      setAuthError("Fehler bei der Authentifizierung.");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#090b10] flex items-center justify-center"><div className="spinner" /></div>;

  if (!user) return (
    <div className="min-h-screen bg-[#090b10] flex items-center justify-center p-6">
      <div className="w-full max-w-sm card p-8 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-accent border border-accent/20 shadow-lg shadow-accent/10">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">AlphaOS Fitness</h1>
          <p className="text-dim text-xs font-bold uppercase tracking-widest mt-2">Personal Coaching Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full bg-bg2 border border-line rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-accent outline-none transition-all" />
          <input type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full bg-bg2 border border-line rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-accent outline-none transition-all" />
          
          {authError && <p className="text-red text-[10px] font-bold uppercase text-center">{authError}</p>}

          <button type="submit" className="w-full btn btn-primary py-4 font-black uppercase tracking-widest shadow-xl shadow-accent/20">
            {isRegistering ? "Account erstellen" : "Anmelden"}
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-line flex-1 opacity-50" />
            <span className="text-[10px] font-black text-dim uppercase">oder</span>
            <div className="h-px bg-line flex-1 opacity-50" />
          </div>

          <button onClick={signIn} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest transition-transform active:scale-95 shadow-xl">
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Google Login
          </button>

          <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-[10px] font-black text-dim uppercase hover:text-accent transition-colors">
            {isRegistering ? "Bereits einen Account? Login" : "Neu hier? Account erstellen"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans transition-colors duration-500">
        
        {/* Desktop Sidebar (lg:flex) */}
        <aside className="hidden lg:flex flex-col w-[280px] bg-[var(--card)] border-r border-[var(--line)] fixed inset-y-0 z-50">
          <div className="p-8">
             <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-black flex items-center justify-center shadow-lg shadow-[var(--accent)]/30">
                   <Activity size={22} />
                </div>
                <div>
                   <h2 className="text-lg font-black tracking-tight text-[var(--ink)]">Fitness</h2>
                   <div className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] -mt-1">AlphaOS System</div>
                </div>
             </div>
             
             <nav className="space-y-1">
                {NAV_ITEMS.map(({ id, label, Icon }) => (
                  <button key={id} onClick={() => navigate(id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${tab === id ? 'bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 font-black' : 'text-[var(--dim)] hover:bg-white/5 font-bold'}`}>
                    <Icon size={18} className={tab === id ? 'stroke-[2.5]' : ''} />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
             </nav>
          </div>
          
          <div className="mt-auto p-6 space-y-4">
             <div className="p-4 rounded-2xl bg-[var(--bg2)] border border-[var(--line)]">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 overflow-hidden">
                      {user.photoURL ? <img src={user.photoURL} alt="Avatar" /> : <User size={20} className="m-2.5 text-[var(--accent)]" />}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-black text-[var(--ink)] truncate">{user.displayName || "Client"}</div>
                      <div className="text-[9px] font-bold text-[var(--dim)] truncate opacity-50">{user.email}</div>
                   </div>
                </div>
             </div>
             <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--red)] bg-[var(--red)]/5 border border-[var(--red)]/10 rounded-xl hover:bg-[var(--red)]/10 transition-all">
                <LogOut size={14} /> Abmelden
             </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-[280px]">
          {/* Mobile Header (lg:hidden) */}
          <header className="lg:hidden h-16 flex items-center justify-between px-6 bg-[var(--card)] border-b border-[var(--line)] sticky top-0 z-40">
            <div className="flex items-center gap-2 font-black text-lg">
              <Activity size={20} className="text-[var(--accent)]" />
              Fitness
            </div>
            <button onClick={() => navigate('settings')} className="p-2 rounded-xl bg-[var(--bg2)]">
               <Settings2 size={18} className="text-[var(--dim)]" />
            </button>
          </header>

          <main className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {tab === 'dash' && <Dashboard onNavigate={navigate} />}
                {tab === 'session' && <Session hitMode={hitMode} planMode={planMode} />}
                {tab === 'habits' && <Habits />}
                {tab === 'journal' && <Journal />}
                {tab === 'muscles' && <Muscles hitMode={hitMode} gender={gender} />}
                {tab === 'review' && <WeeklyReview onNavigate={navigate} />}
                {tab === 'learn' && <Learn />}
                {tab === 'settings' && (
                   <Settings 
                     hitMode={hitMode} setHitMode={setHitMode}
                     planMode={planMode} setPlanMode={setPlanMode}
                     gender={gender} setGender={setGender}
                     split={split} setSplit={setSplit}
                     cycleLength={cycleLength} setCycleLength={setCycleLength}
                     defaultLocation={defaultLocation} setDefaultLocation={setDefaultLocation}
                     themeMode={themeMode} setModeState={setModeState}
                     circLight={circLight} setCircLight={setCircLight}
                     circDark={circDark} setCircDark={setCircDark}
                     themes={THEMES} theme={theme} setThemeState={setThemeState}
                     updateSettings={updateSettings}
                   />
                )}
            </div>
          </main>

          {/* Update Notify (Toast) */}
          {updateAvailable && (
            <div className="fixed bottom-24 lg:bottom-10 right-6 z-[100] animate-in slide-in-from-right duration-500">
               <div className="bg-[var(--accent)] text-black p-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20">
                  <div className="flex-1">
                     <div className="text-[10px] font-black uppercase tracking-widest opacity-70">System Update</div>
                     <div className="text-xs font-black">Neue Version verfügbar!</div>
                  </div>
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                     Update
                  </button>
               </div>
            </div>
          )}

          {/* Mobile Navigation (lg:hidden) */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--card)]/90 backdrop-blur-xl border-t border-[var(--line)] px-2 flex items-center justify-around z-50">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => navigate(id)}
                className={`flex flex-col items-center gap-1.5 p-2 transition-all ${tab === id ? 'text-[var(--accent)]' : 'text-[var(--dim)]'}`}>
                <Icon size={22} className={tab === id ? 'stroke-[2.5]' : ''} />
                <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </ErrorBoundary>
  )
}
