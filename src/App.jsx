import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import Dashboard from './views/Dashboard/index.jsx'
import Session from './views/Session/index.jsx'
import Journal from './views/Journal/index.jsx'
import Habits  from './views/Habits/index.jsx'
import Learn   from './views/Learn/index.jsx'
import WeeklyReview from './views/WeeklyReview/index.jsx'
import Settings from './views/Settings/index.jsx'
import Coach from './views/Coach/index.jsx'
import Inbox from './views/Inbox/index.js'
import ExerciseInsightModal from './components/ExerciseInsightModal.jsx'
import { isLocalMode, getAnatomy } from '@db'

import { NAV_ITEMS, VALID_TABS } from './constants/NavigationItems.js'

import Sidebar from './components/layout/Sidebar.jsx'
import MobileNav from './components/layout/MobileNav.jsx'
import UserProfile from './components/common/UserProfile.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

import AppGate from './views/AppGate.jsx'

import { useUser } from './contexts/UserContext'
import { useSettings } from './contexts/SettingsContext'
import { useSwipeNavigation } from './hooks/useSwipeNavigation'

export default function App() {
  const {
    user, authLoading,
    gender, split, cycleLength, defaultLocation,
    signIn, signInEmail, signUpEmail, signOut
  } = useUser();

  const {
    theme, setThemeState, themeMode, setModeState,
    circDark, setCircDark, circLight, setCircLight,
    layoutScale, setLayoutScale, recentDays, setRecentDays,
    coverageThreshold, setCoverageThreshold, showAdvanced, setShowAdvanced,
    dashboardHighlighter, setDashboardHighlighter, sidebarPinned, setSidebarPinned,
    swipeEnabled, setSwipeEnabled, muscleLanguage, setMuscleLanguage,
    navMode, setNavMode
  } = useSettings();

  const [tab, setTab]             = useState(() => {
     const hash = window.location.hash.replace(/^#\/?/, '');
     if (VALID_TABS.has(hash)) return hash;
     const initialNavMode = localStorage.getItem('fitness-navMode') || 'tabs';
     return initialNavMode === 'home' ? 'gate' : 'dash';
  });
  const [subTab, setSubTab] = useState(null);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authRegistering, setAuthRegistering] = useState(false);

  const [sessionDate, setSessionDate]   = useState(null)
  const [sessionDraft, setSessionDraft] = useState(null)
  const [inspectorExercise, setInspectorExercise] = useState(null)
  const [taxonomy, setTaxonomy] = useState(null);

  const { mainRef, swipeHint, slideDirection, setSlideDirection } = useSwipeNavigation({
    navMode, tab, swipeEnabled, setTab, NAV_ITEMS
  });

  useEffect(() => {
    if (isLocalMode()) {
      fetch('http://localhost:9100/fitness/muscles')
        .then(r => r.json())
        .then(data => setTaxonomy(data?.muscles || null))
        .catch(() => {});
    }
  }, []);

  const navigateToTab = (newTabId) => {
    if (newTabId === tab) return;
    const oldIdx = NAV_ITEMS.findIndex(i => i.id === tab);
    const newIdx = NAV_ITEMS.findIndex(i => i.id === newTabId);
    if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
      setSlideDirection(newIdx > oldIdx ? 'left' : 'right');
    } else {
      setSlideDirection('bottom');
    }
    setSubTab(null);
    setTab(newTabId);
  };

  function navigate(id) { navigateToTab(id) }
  function navigateSub(id) { setSubTab(id) }

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
    <div className="min-h-screen flex items-center justify-center bg-fit-bg">
      <div className="text-fit-dim text-xs font-black uppercase tracking-widest">…</div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-fit-bg text-fit-ink p-6">
      <div className="w-full max-w-sm card p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">AlphaOS Fitness</h1>
          <p className="text-fit-dim text-[10px] font-bold uppercase tracking-widest mt-2">Anmelden</p>
        </div>
        <form onSubmit={handleAuthSubmit} className="space-y-3">
          <input type="email"    placeholder="Email"    value={authEmail}    onChange={e => setAuthEmail(e.target.value)}    required className="w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-bold focus:border-fit-accent outline-none" />
          <input type="password" placeholder="Passwort" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required className="w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-bold focus:border-fit-accent outline-none" />
          {authError && <p className="text-fit-red text-[10px] font-bold uppercase text-center">{authError}</p>}
          <button type="submit" className="w-full btn btn-primary py-3 font-black uppercase tracking-widest">
            {authRegistering ? 'Account erstellen' : 'Anmelden'}
          </button>
        </form>
        <div className="flex items-center gap-3"><div className="h-px bg-fit-line flex-1 opacity-50" /><span className="text-[9px] font-black uppercase text-fit-dim">oder</span><div className="h-px bg-fit-line flex-1 opacity-50" /></div>
        <button onClick={signIn} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform">Google Login</button>
        <button onClick={() => setAuthRegistering(!authRegistering)} className="w-full text-[10px] font-black text-fit-dim uppercase hover:text-fit-accent">
          {authRegistering ? 'Bereits einen Account? Anmelden' : 'Neu hier? Account erstellen'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <ErrorBoundary>
        <div className="app-shell flex min-h-screen overflow-x-hidden w-full bg-fit-bg text-fit-ink font-sans transition-colors duration-500">

        <Sidebar
          tab={tab}
          navigate={navigate}
          subTab={subTab}
          navigateSub={navigateSub}
          pinned={sidebarPinned}
          setPinned={setSidebarPinned}
          user={user}
        >
          <UserProfile user={user} subtitle={isLocalMode() ? `${user?.email || 'localhost'} · localhost` : (user?.email || '')} />
          {!isLocalMode() && (
            <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-fit-red bg-fit-red/5 border border-fit-red/10 rounded-xl hover:bg-fit-red/10 transition-all">
              Logout
            </button>
          )}
          <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-fit-dim bg-fit-bg2 rounded-xl hover:bg-white/5 transition-all">
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
                  {/* Back-to-Gate handle (only in home mode, when not on gate) */}
                  {navMode === 'home' && tab !== 'gate' && (
                    <button
                      onClick={() => navigate('gate')}
                      aria-label="Zurück zum Menü"
                      className="sticky top-0 z-30 mx-auto flex flex-col items-center gap-1 pt-2 pb-3 w-full bg-gradient-to-b from-[var(--bg)] via-[var(--bg)] to-transparent active:opacity-60 transition-opacity"
                    >
                      <div className="w-10 h-1.5 rounded-full bg-fit-line" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-fit-dim opacity-60">Menü</span>
                    </button>
                  )}
                  <div key={tab} className={`${navMode === 'home' && tab !== 'gate' ? 'p-4 pb-20 sm:p-10' : ''} animate-in fade-in ${slideDirection === 'left' ? 'slide-in-from-right-8' : slideDirection === 'right' ? 'slide-in-from-left-8' : 'slide-in-from-bottom-4'} duration-500`}>
                      {/* Render content */}
                      {tab === 'dash'     && <Dashboard user={user} onOpenSession={openSession} onInspectExercise={inspectExercise} onOpenReview={() => navigate('review')} recentDays={recentDays} coverageThreshold={coverageThreshold} dashboardHighlighter={dashboardHighlighter} gender={gender} navMode={navMode} navigate={navigate} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />}
                      {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} onOpenSession={openSession} recentDays={recentDays} coverageThreshold={coverageThreshold} subTab={subTab} />}
                      {tab === 'review'   && <WeeklyReview onOpenSession={openSession} onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} gender={gender} recentDays={recentDays} subTab={subTab} onSubNav={navigateSub} />}
                      {tab === 'learn'    && <Learn subTab={subTab} />}
                      {tab === 'journal'  && <Journal />}
                      {tab === 'habits'   && <Habits />}
                      {tab === 'coach'    && (isLocalMode() || user?.email?.includes('alpha') || user?.uid === '59ole36uNpNwml5H6VDYCXyCME92') && <Coach onInspectExercise={inspectExercise} />}
                      {tab === 'inbox'    && <Inbox />}
                      {tab === 'settings' && <Settings />}
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
