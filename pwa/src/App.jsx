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

import Sidebar from "../../../shared/components/Sidebar.jsx";
import MobileNav from "../../../shared/components/MobileNav.jsx";
import MobileHeader from "../../../shared/components/MobileHeader.jsx";
import UserProfile from "../../../shared/components/UserProfile.jsx";
import ErrorBoundary from "../../../shared/components/ErrorBoundary.jsx";
import { NAV_ITEMS, VALID_TABS } from "../../../shared/components/NavigationItems.js";
import { THEMES, DARK_THEMES, LIGHT_THEMES } from "../../../shared/components/Themes.js";

const DAY_START = 8;
const DAY_END = 20;

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState(() => {
     const hash = window.location.hash.replace(/^#\/?/, '');
     return VALID_TABS.has(hash) ? hash : 'dash';
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
    setTab(id);
    window.location.hash = `/${id}`;
  }

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      setTab(VALID_TABS.has(hash) ? hash : 'dash');
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

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
        
        <Sidebar tab={tab} navigate={navigate}>
          <UserProfile user={user} />
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--red)] bg-[var(--red)]/5 border border-[var(--red)]/10 rounded-xl hover:bg-[var(--red)]/10 transition-all">
            <LogOut size={14} /> Abmelden
          </button>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-[280px]">
          <MobileHeader navigate={navigate} />

          <main className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {tab === 'dash' && <Dashboard onNavigate={navigate} />}
                {tab === 'session' && <Session hitMode={hitMode} planMode={planMode} />}
                {tab === 'habits' && <Habits />}
                {tab === 'journal' && <Journal />}
                {tab === 'muscles' && <Muscles hitMode={hitMode} gender={gender} />}
                {tab === 'review' && <WeeklyReview onNavigate={navigate} />}
                {tab === 'learn' && <Learn hitMode={hitMode} gender={gender} />}
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

          <MobileNav tab={tab} navigate={navigate} />
        </div>
      </div>
    </ErrorBoundary>
  )
}
