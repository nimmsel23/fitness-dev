import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import Dashboard from './views/Dashboard/index.jsx'
import Session from './views/Session/index.jsx'
import Journal from './views/Journal/index.jsx'
import Learn from './views/Learn/index.jsx'
import Habits from './views/Habits/index.jsx'
import WeeklyReview from './views/WeeklyReview/index.jsx'
import Settings from './views/Settings/index.jsx'
import ExerciseInsightModal from './components/ExerciseInsightModal.jsx'
import { api } from './api.js'
import { watchAuth, signIn, signInEmail, signUpEmail, signOut, isLocalMode } from '@db'

import { NAV_ITEMS, VALID_TABS } from './constants/NavigationItems.js'
import { THEMES } from './constants/Themes.js'
import Sidebar from './components/layout/Sidebar.jsx'
import MobileNav from './components/layout/MobileNav.jsx'
import MobileHeader from './components/layout/MobileHeader.jsx'
import UserProfile from './components/common/UserProfile.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

const DAY_START = 8; // 8 AM
const DAY_END   = 20; // 8 PM


export default function App() {
  const [tab, setTab]             = useState(() => {
     const hash = window.location.hash.replace(/^#\/?/, '');
     return VALID_TABS.has(hash) ? hash : 'dash';
  });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authRegistering, setAuthRegistering] = useState(false);

  useEffect(() => watchAuth((u) => {
    setUser(u);
    setAuthLoading(false);
  }), []);

  const [theme, setThemeState]    = useState(() => localStorage.getItem('fitness-theme') || 'nordic');
  const [themeMode, setModeState] = useState(() => localStorage.getItem('fitness-theme-mode') || 'manual');
  // Circadian: which dark + which light to use
  const [circDark,  setCircDark]  = useState(() => localStorage.getItem('fitness-circ-dark') || 'nordic');
  const [circLight, setCircLight] = useState(() => localStorage.getItem('fitness-circ-light') || 'honey');
  const [hitMode, setHitMode] = useState(() => localStorage.getItem('fitness-hitMode') !== 'false');
  const [planMode, setPlanMode] = useState(() => localStorage.getItem('fitness-planMode') === 'true');
  const [gender, setGender] = useState(() => localStorage.getItem('fitness-gender') || 'male');
  const [split, setSplit] = useState(() => localStorage.getItem('fitness-split') || 'PPL');
  const [cycleLength, setCycleLength] = useState(() => parseInt(localStorage.getItem('fitness-cycleLength') || '4', 10));
  const [defaultLocation, setDefaultLocation] = useState(() => localStorage.getItem('fitness-defaultLocation') || 'Home');
  const [sessionDate, setSessionDate]   = useState(null)
  const [sessionDraft, setSessionDraft] = useState(null)
  const [inspectorExercise, setInspectorExercise] = useState(null)
  const [layoutScale, setLayoutScale] = useState(() => parseInt(localStorage.getItem('fitness-layoutScale') || '100', 10));
  const [swipeHint, setSwipeHint] = useState(null);
  const [recentDays, setRecentDays] = useState(() => parseInt(localStorage.getItem('fitness-recentDays') || '7', 10));
  const [coverageThreshold, setCoverageThreshold] = useState(() => parseFloat(localStorage.getItem('fitness-coverageThreshold') || '1.0'));
  const [showAdvanced, setShowAdvanced] = useState(() => localStorage.getItem('fitness-showAdvanced') === 'true');
  const [dashboardHighlighter, setDashboardHighlighter] = useState(() => localStorage.getItem('fitness-dashboardHighlighter') || 'body');
  const [sidebarPinned, setSidebarPinned] = useState(() => localStorage.getItem('fitness-sidebarPinned') !== 'false');
  const [navMode, setNavMode] = useState(() => localStorage.getItem('fitness-navMode') || 'tabs');

  // Swipe Navigation — refs to avoid re-registering listeners on every touch event
  const touchStartRef = useRef(null);
  const touchEndRef   = useRef(null);
  const tabRef        = useRef(tab);
  const navModeRef    = useRef(navMode);
  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { navModeRef.current = navMode; }, [navMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${layoutScale}%`;
  }, [layoutScale]);

  useEffect(() => {
    const MIN_SWIPE  = 70;
    const HINT_START = 30;

    const onTouchStart = (e) => {
      if (navModeRef.current !== 'tabs') return;
      touchEndRef.current   = null;
      touchStartRef.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e) => {
      if (!touchStartRef.current) return;
      touchEndRef.current = e.targetTouches[0].clientX;
      const dist  = touchStartRef.current - touchEndRef.current;
      const idx   = NAV_ITEMS.findIndex(i => i.id === tabRef.current);
      if (idx === -1) return;
      if      (dist >  HINT_START && idx < NAV_ITEMS.length - 1) setSwipeHint('left');
      else if (dist < -HINT_START && idx > 0)                    setSwipeHint('right');
      else                                                        setSwipeHint(null);
    };

    const onTouchEnd = () => {
      setSwipeHint(null);
      if (!touchStartRef.current || !touchEndRef.current) return;
      const dist = touchStartRef.current - touchEndRef.current;
      const idx  = NAV_ITEMS.findIndex(i => i.id === tabRef.current);
      touchStartRef.current = null;
      touchEndRef.current   = null;
      if (idx === -1) return;
      if      (dist >  MIN_SWIPE && idx < NAV_ITEMS.length - 1) setTab(NAV_ITEMS[idx + 1].id);
      else if (dist < -MIN_SWIPE && idx > 0)                    setTab(NAV_ITEMS[idx - 1].id);
    };

    const main = document.querySelector('main');
    if (main) {
      main.addEventListener('touchstart', onTouchStart, { passive: true });
      main.addEventListener('touchmove',  onTouchMove,  { passive: true });
      main.addEventListener('touchend',   onTouchEnd);
    }
    return () => {
      if (main) {
        main.removeEventListener('touchstart', onTouchStart);
        main.removeEventListener('touchmove',  onTouchMove);
        main.removeEventListener('touchend',   onTouchEnd);
      }
    };
  }, []);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('fitness-hitMode', hitMode) }, [hitMode]);
  useEffect(() => { localStorage.setItem('fitness-planMode', planMode) }, [planMode]);
  useEffect(() => { localStorage.setItem('fitness-gender', gender) }, [gender]);
  useEffect(() => { localStorage.setItem('fitness-split', split) }, [split]);
  useEffect(() => { localStorage.setItem('fitness-cycleLength', cycleLength) }, [cycleLength]);
  useEffect(() => { localStorage.setItem('fitness-defaultLocation', defaultLocation) }, [defaultLocation]);
  useEffect(() => { localStorage.setItem('fitness-theme', theme) }, [theme]);
  useEffect(() => { localStorage.setItem('fitness-theme-mode', themeMode) }, [themeMode]);
  useEffect(() => { localStorage.setItem('fitness-circ-dark', circDark) }, [circDark]);
  useEffect(() => { localStorage.setItem('fitness-circ-light', circLight) }, [circLight]);
  useEffect(() => { localStorage.setItem('fitness-layoutScale', layoutScale) }, [layoutScale]);
  useEffect(() => { localStorage.setItem('fitness-recentDays', recentDays) }, [recentDays]);
  useEffect(() => { localStorage.setItem('fitness-coverageThreshold', coverageThreshold) }, [coverageThreshold]);
  useEffect(() => { localStorage.setItem('fitness-showAdvanced', showAdvanced) }, [showAdvanced]);
  useEffect(() => { localStorage.setItem('fitness-dashboardHighlighter', dashboardHighlighter) }, [dashboardHighlighter]);
  useEffect(() => { localStorage.setItem('fitness-sidebarPinned', sidebarPinned) }, [sidebarPinned]);
  useEffect(() => { localStorage.setItem('fitness-navMode', navMode) }, [navMode]);

  // Theme Logic from PWA
  useEffect(() => {
    if (themeMode === 'manual') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      const hour = new Date().getHours();
      const current = (hour >= DAY_START && hour < DAY_END) ? circLight : circDark;
      document.documentElement.setAttribute('data-theme', current);
    }
  }, [theme, themeMode, circLight, circDark]);

  // Sync tab → URL hash
  useEffect(() => {
    if (window.location.hash.slice(1) !== tab) history.pushState(null, '', `#${tab}`)
  }, [tab])

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      setTab(VALID_TABS.has(hash) ? hash : 'dash');
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function navigate(id) { setTab(id) }

  function openSession(date, draft = null) {
    setSessionDate(date || null)
    setSessionDraft(draft || null)
    navigate('session')
  }

  async function inspectExercise(exercise) {
    if (!exercise) return
    setInspectorExercise(exercise)
    const id = exercise.exercise_id || exercise.id
    if (!id || exercise.lesson) return
    try {
      const data = await api.get(`/exercise/${encodeURIComponent(id)}/teaching`)
      if (data?.ok && data.lesson)
        setInspectorExercise(prev => prev ? { ...prev, lesson: data.lesson } : prev)
    } catch {}
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError('');
    try {
      if (authRegistering) await signUpEmail(authEmail, authPassword);
      else                 await signInEmail(authEmail, authPassword);
    } catch {
      setAuthError('Anmeldung fehlgeschlagen.');
    }
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-[var(--dim)] text-xs font-black uppercase tracking-widest">…</div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--ink)] p-6">
      <div className="w-full max-w-sm card p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">AlphaOS Fitness</h1>
          <p className="text-[var(--dim)] text-[10px] font-bold uppercase tracking-widest mt-2">Anmelden</p>
        </div>
        <form onSubmit={handleAuthSubmit} className="space-y-3">
          <input type="email"    placeholder="Email"    value={authEmail}    onChange={e => setAuthEmail(e.target.value)}    required className="w-full bg-[var(--bg2)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-bold focus:border-[var(--accent)] outline-none" />
          <input type="password" placeholder="Passwort" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required className="w-full bg-[var(--bg2)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm font-bold focus:border-[var(--accent)] outline-none" />
          {authError && <p className="text-[var(--red)] text-[10px] font-bold uppercase text-center">{authError}</p>}
          <button type="submit" className="w-full btn btn-primary py-3 font-black uppercase tracking-widest">
            {authRegistering ? 'Account erstellen' : 'Anmelden'}
          </button>
        </form>
        <div className="flex items-center gap-3"><div className="h-px bg-[var(--line)] flex-1 opacity-50" /><span className="text-[9px] font-black uppercase text-[var(--dim)]">oder</span><div className="h-px bg-[var(--line)] flex-1 opacity-50" /></div>
        <button onClick={signIn} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform">Google Login</button>
        <button onClick={() => setAuthRegistering(!authRegistering)} className="w-full text-[10px] font-black text-[var(--dim)] uppercase hover:text-[var(--accent)]">
          {authRegistering ? 'Bereits einen Account? Anmelden' : 'Neu hier? Account erstellen'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <ErrorBoundary>
        <div className="flex min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans transition-colors duration-500">

        <Sidebar tab={tab} navigate={navigate} pinned={sidebarPinned} setPinned={setSidebarPinned}>
          <UserProfile user={user} subtitle={isLocalMode() ? `${user?.email || 'localhost'} · localhost` : (user?.email || '')} />
          {!isLocalMode() && (
            <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--red)] bg-[var(--red)]/5 border border-[var(--red)]/10 rounded-xl hover:bg-[var(--red)]/10 transition-all">
              Logout
            </button>
          )}
          <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--dim)] bg-[var(--bg2)] rounded-xl hover:bg-white/5 transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
        </Sidebar>

        <div className={`flex-1 transition-all duration-500 ease-in-out ${sidebarPinned ? 'lg:ml-[280px]' : 'lg:ml-24'}`}>
          {/* Main Header - hidden on mobile when a sheet is open in home mode */}
          <div className={navMode === 'home' && tab !== 'dash' ? 'hidden lg:block' : ''}>
            <MobileHeader navigate={navigate} tab={tab} navMode={navMode} />
          </div>

          <main className={`relative ${navMode === 'tabs' ? 'pb-28' : 'pb-4'} sm:pb-10 lg:pb-16 min-h-screen overflow-x-hidden`}>
              {/* Background Hub (Dashboard) - always mounted in home mode for speed/transitions */}
              {navMode === 'home' && (
                <div className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] p-4 sm:p-10 lg:p-16 max-w-[1600px] mx-auto ${tab !== 'dash' ? 'scale-[0.98] opacity-30 blur-[2px] pointer-events-none' : 'scale-100 opacity-100'}`}>
                   <Dashboard 
                     onOpenSession={openSession} 
                     onInspectExercise={inspectExercise} 
                     onOpenReview={() => navigate('review')} 
                     recentDays={recentDays} 
                     coverageThreshold={coverageThreshold} 
                     dashboardHighlighter={dashboardHighlighter} 
                     gender={gender} 
                     navMode={navMode} 
                     navigate={navigate} 
                   />
                </div>
              )}

              {/* Foreground Sheet (or normal Tab content) */}
              <div 
                className={`
                  ${navMode === 'home' ? 'fixed inset-0 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]' : 'p-4 sm:p-10 lg:p-16 max-w-[1600px] mx-auto'}
                  ${navMode === 'home' && tab === 'dash' ? 'translate-y-full pointer-events-none' : 'translate-y-0'}
                `}
              >
                <div className={`${navMode === 'home' ? 'h-full bg-[var(--bg)] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] overflow-y-auto rounded-t-[40px] border-t border-[var(--line)]/30 relative' : ''}`}>
                  {/* Sheet Pull Handle (Visual only for now) */}
                  {navMode === 'home' && tab !== 'dash' && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-[var(--line)]/40 z-[60] lg:hidden" />
                  )}

                  {/* Sheet Header (only in home mode sheets) */}
                  {navMode === 'home' && tab !== 'dash' && (
                    <div className="sticky top-0 z-50 lg:hidden">
                       <MobileHeader navigate={navigate} tab={tab} navMode={navMode} />
                    </div>
                  )}

                  <div className={`${navMode === 'home' && tab !== 'dash' ? 'p-4 pb-20 sm:p-10' : ''} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                      {/* Only render non-dash tabs here in home mode, OR everything in tabs mode */}
                      {(navMode === 'tabs' || tab !== 'dash') && (
                        <>
                          {tab === 'dash'     && navMode === 'tabs' && <Dashboard onOpenSession={openSession} onInspectExercise={inspectExercise} onOpenReview={() => navigate('review')} recentDays={recentDays} coverageThreshold={coverageThreshold} dashboardHighlighter={dashboardHighlighter} gender={gender} navMode={navMode} navigate={navigate} />}
                          {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} />}
                          {tab === 'review'   && <WeeklyReview onOpenSession={openSession} onInspectExercise={inspectExercise} hitMode={hitMode} />}
                          {tab === 'learn'    && <Learn onInspectExercise={inspectExercise} hitMode={hitMode} gender={gender} />}
                          {tab === 'habits'   && <Habits />}
                          {tab === 'journal'  && <Journal />}
                          {tab === 'settings' && (
                             <Settings
                               hitMode={hitMode} setHitMode={setHitMode}
                               planMode={planMode} setPlanMode={setPlanMode}
                               layoutScale={layoutScale} setLayoutScale={setLayoutScale}
                               recentDays={recentDays} setRecentDays={setRecentDays}
                               coverageThreshold={coverageThreshold} setCoverageThreshold={setCoverageThreshold}
                               showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
                               dashboardHighlighter={dashboardHighlighter} setDashboardHighlighter={setDashboardHighlighter}
                               gender={gender} setGender={setGender}
                               split={split} setSplit={setSplit}
                               cycleLength={cycleLength} setCycleLength={setCycleLength}
                               defaultLocation={defaultLocation} setDefaultLocation={setDefaultLocation}
                               themeMode={themeMode} setModeState={setModeState}
                               circLight={circLight} setCircLight={setCircLight}
                               circDark={circDark} setCircDark={setCircDark}
                               themes={THEMES} theme={theme} setThemeState={setThemeState}
                               sidebarPinned={sidebarPinned} setSidebarPinned={setSidebarPinned}
                               navMode={navMode} setNavMode={setNavMode}
                             />
                          )}
                        </>
                      )}
                  </div>
                </div>
              </div>
            </main>

            {navMode === 'tabs' && <MobileNav tab={tab} navigate={navigate} swipeHint={swipeHint} />}
          </div>
        </div>
      </ErrorBoundary>
      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} />
    </>
  );
}

