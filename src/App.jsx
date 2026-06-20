import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import Dashboard from './views/Dashboard/index.jsx'
import Session from './views/Session/index.jsx'
import Journal from './views/Journal/index.jsx'
import Learn from './views/Learn/index.jsx'
import Habits from './views/Habits/index.jsx'
import WeeklyReview from './views/WeeklyReview/index.jsx'
import Settings from './views/Settings/index.jsx'
import Coach from './views/Coach/index.jsx'
import Inbox from './views/Inbox/index.js'
import ExerciseInsightModal from './components/ExerciseInsightModal.jsx'
import { watchAuth, signIn, signInEmail, signUpEmail, signOut, isLocalMode, getAnatomy } from '@db'

import { NAV_ITEMS, VALID_TABS } from './constants/NavigationItems.js'
import { THEMES } from './constants/Themes.js'
import Sidebar from './components/layout/Sidebar.jsx'
import MobileNav from './components/layout/MobileNav.jsx'
import UserProfile from './components/common/UserProfile.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

import AppGate from './views/AppGate.jsx'

const DAY_START = 8; // 8 AM
const DAY_END   = 20; // 8 PM


export default function App() {
  const [navMode, setNavMode] = useState(() => localStorage.getItem('fitness-navMode') || 'tabs');
  const [tab, setTab]             = useState(() => {
     const hash = window.location.hash.replace(/^#\/?/, '');
     if (VALID_TABS.has(hash)) return hash;
     // If no valid hash, default to 'gate' in home mode, else 'dash'
     const initialNavMode = localStorage.getItem('fitness-navMode') || 'tabs';
     return initialNavMode === 'home' ? 'gate' : 'dash';
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
  const [gender, setGender] = useState(() => localStorage.getItem('fitness-gender') || 'male');
  const [split, setSplit] = useState(() => localStorage.getItem('fitness-split') || 'PPL');
  const [cycleLength, setCycleLength] = useState(() => parseInt(localStorage.getItem('fitness-cycleLength') || '4', 10));
  const [defaultLocation, setDefaultLocation] = useState(() => localStorage.getItem('fitness-defaultLocation') || 'Home');
  const [sessionDate, setSessionDate]   = useState(null)
  const [sessionDraft, setSessionDraft] = useState(null)
  const [inspectorExercise, setInspectorExercise] = useState(null)
  const [layoutScale, setLayoutScale] = useState(() => parseInt(localStorage.getItem('fitness-layoutScale') || '100', 10));
  const [swipeHint, setSwipeHint] = useState(null);
  const [slideDirection, setSlideDirection] = useState('bottom');
  const hasVibratedRef  = useRef(false);
  const [recentDays, setRecentDays] = useState(() => parseInt(localStorage.getItem('fitness-recentDays') || '7', 10));
  const [coverageThreshold, setCoverageThreshold] = useState(() => parseFloat(localStorage.getItem('fitness-coverageThreshold') || '1.0'));
  const [showAdvanced, setShowAdvanced] = useState(() => localStorage.getItem('fitness-showAdvanced') === 'true');
  const [dashboardHighlighter, setDashboardHighlighter] = useState(() => localStorage.getItem('fitness-dashboardHighlighter') || 'body');
  const [sidebarPinned, setSidebarPinned] = useState(() => localStorage.getItem('fitness-sidebarPinned') !== 'false');
  const [swipeEnabled, setSwipeEnabled] = useState(() => localStorage.getItem('fitness-swipeEnabled') === 'true');
  const [muscleLanguage, setMuscleLanguage] = useState(() => localStorage.getItem('fitness-muscleLanguage') || 'de');
  const [taxonomy, setTaxonomy] = useState(null);

  useEffect(() => {
    if (isLocalMode()) {
      fetch('http://localhost:9100/fitness/muscles')
        .then(r => r.json())
        .then(data => setTaxonomy(data?.muscles || null))
        .catch(() => {});
    }
  }, []);

  // Swipe Navigation — refs to avoid re-registering listeners on every touch event
  const touchStartRef   = useRef(null);
  const gestureTypeRef  = useRef('none');
  const mainRef         = useRef(null);
  const tabRef          = useRef(tab);
  const navModeRef      = useRef(navMode);
  const swipeEnabledRef = useRef(swipeEnabled);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { navModeRef.current = navMode; }, [navMode]);
  useEffect(() => { swipeEnabledRef.current = swipeEnabled; }, [swipeEnabled]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${layoutScale}%`;
  }, [layoutScale]);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const triggerVibration = () => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    };

    const shouldIgnoreSwipe = (target) => {
      if (!target) return true;
      const isInteractive = target.closest('input, textarea, select, button, a, [role="button"], [data-no-swipe="true"]');
      if (isInteractive) return true;

      let el = target;
      while (el && el.nodeType === 1 && el !== document.body && el !== document.documentElement) {
        if (el.classList && (el.classList.contains('overflow-x-auto') || el.classList.contains('overflow-x-scroll'))) {
          if (el.scrollWidth > el.clientWidth) return true;
        }
        const style = window.getComputedStyle(el);
        if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
          if (el.scrollWidth > el.clientWidth) return true;
        }
        el = el.parentElement;
      }
      return false;
    };

    const onTouchStart = (e) => {
      if (!swipeEnabledRef.current || navModeRef.current !== 'tabs') return;

      const touch = e.touches[0];
      if (shouldIgnoreSwipe(touch.target)) {
        touchStartRef.current = null;
        gestureTypeRef.current = 'scrolling';
        return;
      }

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      gestureTypeRef.current = 'none';
      hasVibratedRef.current = false;
      setSwipeHint(null);
    };

    const onTouchMove = (e) => {
      if (!touchStartRef.current || gestureTypeRef.current === 'scrolling') return;

      const touch = e.touches[0];
      const deltaX = touchStartRef.current.x - touch.clientX;
      const deltaY = touchStartRef.current.y - touch.clientY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (gestureTypeRef.current === 'none') {
        if (absX > 10 || absY > 10) {
          if (absX > absY * 1.5) {
            gestureTypeRef.current = 'swiping';
          } else {
            gestureTypeRef.current = 'scrolling';
            return;
          }
        } else {
          return;
        }
      }

      if (gestureTypeRef.current === 'swiping') {
        if (e.cancelable) {
          e.preventDefault();
        }

        const HINT_START = 30;
        const MIN_SWIPE = 75;
        const idx = NAV_ITEMS.findIndex(i => i.id === tabRef.current);
        if (idx === -1) return;

        // Perform real-time visual page sliding with rubber-banding at boundaries
        let translation = -deltaX;
        const isAtLeftBoundary = deltaX < 0 && idx === 0;
        const isAtRightBoundary = deltaX > 0 && idx === NAV_ITEMS.length - 1;
        if (isAtLeftBoundary || isAtRightBoundary) {
          translation = translation * 0.25; // 4x resistance
        }
        mainEl.style.transform = `translateX(${translation}px)`;
        mainEl.style.transition = 'none';

        // Trigger detent haptic tick when crossing switch threshold
        const isFarEnough = Math.abs(deltaX) > MIN_SWIPE;
        const canMoveLeft = deltaX > 0 && idx < NAV_ITEMS.length - 1;
        const canMoveRight = deltaX < 0 && idx > 0;
        if (isFarEnough && (canMoveLeft || canMoveRight)) {
          if (!hasVibratedRef.current) {
            triggerVibration();
            hasVibratedRef.current = true;
          }
        } else {
          hasVibratedRef.current = false;
        }

        if      (deltaX >  HINT_START && idx < NAV_ITEMS.length - 1) setSwipeHint('left');
        else if (deltaX < -HINT_START && idx > 0)                    setSwipeHint('right');
        else                                                         setSwipeHint(null);
      }
    };

    const onTouchEnd = (e) => {
      const start = touchStartRef.current;
      const type = gestureTypeRef.current;

      touchStartRef.current = null;
      gestureTypeRef.current = 'none';
      setSwipeHint(null);

      if (!start || type !== 'swiping') {
        if (mainEl) {
          mainEl.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
          mainEl.style.transform = '';
        }
        return;
      }

      const touch = e.changedTouches ? e.changedTouches[0] : null;
      if (!touch) {
        if (mainEl) {
          mainEl.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
          mainEl.style.transform = '';
        }
        return;
      }

      const deltaX = start.x - touch.clientX;
      const deltaY = start.y - touch.clientY;
      const duration = Date.now() - start.time;

      const MIN_SWIPE = 75;
      const MAX_SWIPE_TIME = 300;
      const idx = NAV_ITEMS.findIndex(i => i.id === tabRef.current);
      if (idx === -1) {
        if (mainEl) {
          mainEl.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
          mainEl.style.transform = '';
        }
        return;
      }

      const isQuickFlick = duration < MAX_SWIPE_TIME && Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 2;
      const isFarSwipe = Math.abs(deltaX) > MIN_SWIPE;

      if (isQuickFlick || isFarSwipe) {
        if (deltaX > 0 && idx < NAV_ITEMS.length - 1) {
          if (!hasVibratedRef.current) {
            triggerVibration();
          }
          if (mainEl) {
            mainEl.style.transition = 'none';
            mainEl.style.transform = '';
          }
          setSlideDirection('left');
          setTab(NAV_ITEMS[idx + 1].id);
        } else if (deltaX < 0 && idx > 0) {
          if (!hasVibratedRef.current) {
            triggerVibration();
          }
          if (mainEl) {
            mainEl.style.transition = 'none';
            mainEl.style.transform = '';
          }
          setSlideDirection('right');
          setTab(NAV_ITEMS[idx - 1].id);
        } else {
          if (mainEl) {
            mainEl.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
            mainEl.style.transform = '';
          }
        }
      } else {
        if (mainEl) {
          mainEl.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
          mainEl.style.transform = '';
        }
      }
    };

    mainEl.addEventListener('touchstart', onTouchStart, { passive: false });
    mainEl.addEventListener('touchmove',  onTouchMove,  { passive: false });
    mainEl.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      mainEl.removeEventListener('touchstart', onTouchStart);
      mainEl.removeEventListener('touchmove',  onTouchMove);
      mainEl.removeEventListener('touchend',   onTouchEnd);
    };
  }, [user, authLoading, swipeEnabled]);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('fitness-muscleLanguage', muscleLanguage) }, [muscleLanguage]);
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
  useEffect(() => { localStorage.setItem('fitness-swipeEnabled', swipeEnabled) }, [swipeEnabled]);

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

  const navigateToTab = (newTabId) => {
    if (newTabId === tab) return;
    const oldIdx = NAV_ITEMS.findIndex(i => i.id === tab);
    const newIdx = NAV_ITEMS.findIndex(i => i.id === newTabId);
    if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
      setSlideDirection(newIdx > oldIdx ? 'left' : 'right');
    } else {
      setSlideDirection('bottom');
    }
    setTab(newTabId);
  };

  // Sync tab → URL hash
  useEffect(() => {
    if (window.location.hash.slice(1) !== tab) history.pushState(null, '', `#${tab}`)
  }, [tab])

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      navigateToTab(VALID_TABS.has(hash) ? hash : 'dash');
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [tab]);

  function navigate(id) { navigateToTab(id) }

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
      const lesson = await getAnatomy(id)
      if (lesson)
        setInspectorExercise(prev => prev ? { ...prev, lesson } : prev)
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

        <Sidebar
          tab={tab}
          navigate={navigate}
          pinned={sidebarPinned}
          setPinned={setSidebarPinned}
          user={user}
        >
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
          <main ref={mainRef} className={`relative ${navMode === 'tabs' ? 'pb-28' : ''} sm:pb-10 lg:pb-16 min-h-[100dvh] overflow-x-hidden`}>
              {/* Background Gate - only mounted in home mode */}
              {navMode === 'home' && (
                <div className={`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] max-w-[1600px] mx-auto min-h-[100dvh] flex flex-col ${tab !== 'gate' ? 'scale-[0.98] opacity-30 blur-[2px] pointer-events-none' : 'scale-100 opacity-100'}`}>
                   <AppGate navigate={navigate} />
                </div>
              )}

              {/* Foreground Sheet (or normal Tab content) */}
              <div 
                className={`
                  ${navMode === 'home' ? 'fixed inset-0 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]' : 'p-4 sm:p-10 lg:p-16 max-w-[1600px] mx-auto'}
                  ${navMode === 'home' && tab === 'gate' ? 'translate-y-full pointer-events-none' : 'translate-y-0'}
                `}
              >
                <div className={`${navMode === 'home' ? 'h-full bg-[var(--bg)] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] overflow-y-auto rounded-t-[40px] border-t border-[var(--line)]/30 relative pt-6' : ''}`}>
                  <div key={tab} className={`${navMode === 'home' && tab !== 'gate' ? 'p-4 pb-20 sm:p-10' : ''} animate-in fade-in ${slideDirection === 'left' ? 'slide-in-from-right-8' : slideDirection === 'right' ? 'slide-in-from-left-8' : 'slide-in-from-bottom-4'} duration-500`}>
                      {/* Render content */}
                      {tab === 'dash'     && <Dashboard onOpenSession={openSession} onInspectExercise={inspectExercise} onOpenReview={() => navigate('review')} recentDays={recentDays} coverageThreshold={coverageThreshold} dashboardHighlighter={dashboardHighlighter} gender={gender} navMode={navMode} navigate={navigate} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />}
                      {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} />}
                      {tab === 'review'   && <WeeklyReview onOpenSession={openSession} onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} gender={gender} />}
                      {tab === 'learn'    && <Learn onInspectExercise={inspectExercise} gender={gender} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />}
                      {tab === 'habits'   && <Habits />}
                      {tab === 'journal'  && <Journal />}
                      {tab === 'coach'    && isLocalMode() && <Coach onInspectExercise={inspectExercise} />}
                      {tab === 'inbox'    && <Inbox onInspectExercise={inspectExercise} />}
                      {tab === 'settings' && (
                         <Settings
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
                           muscleLanguage={muscleLanguage} setMuscleLanguage={setMuscleLanguage}
                           swipeEnabled={swipeEnabled} setSwipeEnabled={setSwipeEnabled}
                         />
                      )}
                  </div>
                </div>
              </div>
            </main>

            {navMode === 'tabs' && <MobileNav tab={tab} navigate={navigate} swipeHint={swipeHint} />}
          </div>
        </div>
      </ErrorBoundary>
      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />
    </>
  );
}

