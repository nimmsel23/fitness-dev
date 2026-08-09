import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'
import Session from './views/Session/index.jsx'
import Learn   from '@learn/views/Learn/index.jsx'
import WeeklyReview from './views/WeeklyReview/index.jsx'
import Settings from './views/Settings/index.jsx'
import Anamnese from './views/Anamnese/index.jsx'
import Fokus from './views/Fokus/index.jsx'
import Coach from './views/Coach/index.jsx'
import Inbox from './views/Inbox/index.js'
import ExerciseInsightModal from './components/ExerciseInsightModal.jsx'
import { isLocalMode, getAnatomy, getAllMuscles } from '@db'

import { getNavItems, VALID_TABS } from './constants/NavigationItems.js'

import Sidebar from './components/layout/Sidebar.jsx'
import MobileNav from './components/layout/MobileNav.jsx'
import UserProfile from './components/common/UserProfile.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import PwaUpdateBanner from './components/common/PwaUpdateBanner.jsx'
import { IosInstallHint } from './components/IosInstallHint.jsx'
import { InstallPromptHandler } from './components/InstallPromptHandler.jsx'

import AppGate from './views/AppGate.jsx'

import { useUser } from './contexts/UserContext'
import { useSettings } from './contexts/SettingsContext'
import { useSwipeNavigation } from './hooks/useSwipeNavigation'

const SESSION_SUB_TABS = new Set(['today', 'plan', 'history'])
const REVIEW_SUB_TABS = new Set(['report', 'muscles', 'readiness', 'strength', 'verlauf'])
const LEARN_SUB_TABS = new Set(['exercises', 'anatomy', 'quiz'])
const FOCUS_LAYERS = new Set(['focus', 'anamnese', 'freedom'])

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
}

function parseHashRoute({ resolveFlowTab, navMode }) {
  const fallbackTab = resolveFlowTab(navMode === 'home' ? 'gate' : 'session')
  const rawHash = window.location.hash.replace(/^#\/?/, '')
  const [pathPart = '', queryPart = ''] = rawHash.split('?')
  const [rawTab = '', rawSub = ''] = pathPart.split('/').filter(Boolean)
  const params = new URLSearchParams(queryPart)
  const date = params.get('date')

  const next = {
    tab: fallbackTab,
    subTab: null,
    sessionDate: isIsoDate(date) ? date : null,
    focusLayer: null,
  }

  if (VALID_TABS.has(rawTab)) {
    next.tab = resolveFlowTab(rawTab)
  }

  if (next.tab === 'session') {
    if (SESSION_SUB_TABS.has(rawSub) && rawSub !== 'today') next.subTab = rawSub
    return next
  }

  if (next.tab === 'review') {
    if (REVIEW_SUB_TABS.has(rawSub) && rawSub !== 'report') next.subTab = rawSub
    return next
  }

  if (next.tab === 'learn') {
    if (LEARN_SUB_TABS.has(rawSub)) next.subTab = rawSub
    return next
  }

  if (next.tab === 'focus') {
    if (rawTab === 'anamnese') {
      next.focusLayer = 'anamnese'
      return next
    }
    if (FOCUS_LAYERS.has(rawSub) && rawSub !== 'focus') {
      next.focusLayer = rawSub
    }
  }

  return next
}

function buildHashRoute({ tab, subTab, sessionDate, focusLayer }) {
  const segments = [tab]
  const params = new URLSearchParams()

  if (tab === 'session') {
    if (SESSION_SUB_TABS.has(subTab)) {
      segments.push(subTab)
    } else if (sessionDate) {
      segments.push('today')
    }
    if (sessionDate && !subTab) params.set('date', sessionDate)
  } else if (tab === 'review') {
    if (REVIEW_SUB_TABS.has(subTab) && subTab !== 'report') segments.push(subTab)
  } else if (tab === 'learn') {
    if (LEARN_SUB_TABS.has(subTab)) segments.push(subTab)
  } else if (tab === 'focus') {
    if (FOCUS_LAYERS.has(focusLayer) && focusLayer !== 'focus') segments.push(focusLayer)
  }

  const query = params.toString()
  return `#${segments.join('/')}${query ? `?${query}` : ''}`
}

export default function App() {
  const {
    user, authLoading,
    gender, split, cycleLength, defaultLocation,
    hit1Fact, hit1Obstacle, hit1Strike, hit1Responsibility,
    hit2Fact, hit2Obstacle, hit2Strike, hit2Responsibility,
    hit3Fact, hit3Obstacle, hit3Strike, hit3Responsibility,
    hit4Fact, hit4Obstacle, hit4Strike, hit4Responsibility,
    signIn, signInEmail, signUpEmail, signOut
  } = useUser();
  const devBypassFlow = isLocalMode();

  const {
    theme, setThemeState, themeMode, setModeState,
    circDark, setCircDark, circLight, setCircLight,
    recentDays, setRecentDays,
    coverageThreshold, setCoverageThreshold, showAdvanced, setShowAdvanced,
    sidebarPinned, setSidebarPinned,
    swipeEnabled, setSwipeEnabled, muscleLanguage, setMuscleLanguage,
    navMode, setNavMode
  } = useSettings();

  const hasCompleteHit = (...values) => values.every((value) => value?.trim());
  const focusReady = (
    hasCompleteHit(hit1Fact, hit1Obstacle, hit1Strike, hit1Responsibility) ||
    hasCompleteHit(hit2Fact, hit2Obstacle, hit2Strike, hit2Responsibility) ||
    hasCompleteHit(hit3Fact, hit3Obstacle, hit3Strike, hit3Responsibility) ||
    hasCompleteHit(hit4Fact, hit4Obstacle, hit4Strike, hit4Responsibility)
  );
  const navItems = getNavItems({ focusReady, devBypass: devBypassFlow });
  const resolveFlowTab = (id) => {
    if (devBypassFlow) return id;
    if (id === 'anamnese' && focusReady) return 'focus';
    if (id === 'focus' && !focusReady) return 'anamnese';
    return id;
  };

  const initialRoute = parseHashRoute({
    resolveFlowTab,
    navMode: localStorage.getItem('fitness-navMode') || 'tabs',
  })

  const [tab, setTab]             = useState(() => {
     if (window.location.pathname === '/catalog-ui') return 'coach';
     return initialRoute.tab;
  });
  const [subTab, setSubTab] = useState(() => initialRoute.subTab);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authRegistering, setAuthRegistering] = useState(false);

  const [sessionDate, setSessionDate]   = useState(() => initialRoute.sessionDate)
  const [sessionDraft, setSessionDraft] = useState(null)
  const [inspectorExercise, setInspectorExercise] = useState(null)
  const [taxonomy, setTaxonomy] = useState(null);
  const [focusLayer, setFocusLayer] = useState(() => initialRoute.focusLayer);

  const { mainRef, swipeHint, slideDirection, setSlideDirection } = useSwipeNavigation({
    navMode, tab, swipeEnabled, setTab, NAV_ITEMS: navItems
  });

  useEffect(() => {
    if (!user) return;
    getAllMuscles().catch(() => {});
  }, [user]);

  useEffect(() => {
    if (isLocalMode()) {
      fetch('http://localhost:9100/fitness/muscles')
        .then(r => r.json())
        .then(data => setTaxonomy(data?.muscles || null))
        .catch(() => {});
    }
  }, []);

  const navigateToTab = (newTabId) => {
    const targetTabId = resolveFlowTab(newTabId);
    if (targetTabId === 'gate') {
      setSubTab(null);
      setTab('gate');
      return;
    }
    if (!navItems.some((item) => item.id === targetTabId)) return;
    if (targetTabId === tab) return;
    const oldIdx = navItems.findIndex(i => i.id === tab);
    const newIdx = navItems.findIndex(i => i.id === targetTabId);
    if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
      setSlideDirection(newIdx > oldIdx ? 'left' : 'right');
    } else {
      setSlideDirection('bottom');
    }
    setSubTab(null);
    setSessionDraft(null);
    if (targetTabId !== 'session') setSessionDate(null);
    if (targetTabId !== 'focus') setFocusLayer(null);
    setTab(targetTabId);
  };

  function navigate(id) { navigateToTab(id) }
  function navigateSub(id) { setSubTab(id) }
  function navigateFocusLayer(id) { setFocusLayer(id) }

  useEffect(() => {
    const targetHash = buildHashRoute({ tab, subTab, sessionDate, focusLayer })
    if (window.location.hash !== targetHash) {
      history.replaceState(null, '', targetHash)
    }
  }, [tab, subTab, sessionDate, focusLayer])

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.pathname === '/catalog-ui') {
        setSubTab(null)
        setSessionDate(null)
        setFocusLayer(null)
        setTab('coach')
        return
      }
      const route = parseHashRoute({ resolveFlowTab, navMode })
      setTab(route.tab)
      setSubTab(route.subTab)
      setSessionDate(route.sessionDate)
      setSessionDraft(null)
      setFocusLayer(route.focusLayer)
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [navMode, focusReady]);

  useEffect(() => {
    const resolvedTab = resolveFlowTab(tab);
    if (resolvedTab !== tab) {
      setSubTab(null);
      setFocusLayer(resolvedTab === 'focus' ? 'anamnese' : null);
      setTab(resolvedTab);
    }
  }, [tab, focusReady]);

  function openSession(date, draft = null) {
    setSessionDate(date || null)
    setSessionDraft(draft || null)
    setSubTab(null)
    setFocusLayer(null)
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
          <h1 className="text-2xl font-black tracking-tight">VitalOS Fitness</h1>
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
      <InstallPromptHandler />
      <IosInstallHint />
      <PwaUpdateBanner />
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
          navItems={navItems}
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
                   <AppGate navigate={navigate} navItems={navItems} />
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
                      {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} onOpenSession={openSession} recentDays={recentDays} coverageThreshold={coverageThreshold} subTab={subTab} onDateChange={setSessionDate} />}
                      {tab === 'review'   && <WeeklyReview onOpenSession={openSession} onInspectExercise={inspectExercise} muscleLanguage={muscleLanguage} taxonomy={taxonomy} gender={gender} recentDays={recentDays} subTab={subTab} onSubNav={navigateSub} />}
                      {tab === 'learn'    && <Learn subTab={subTab} />}
                      {tab === 'coach'    && (isLocalMode() || user?.email?.includes('alpha') || user?.uid === '59ole36uNpNwml5H6VDYCXyCME92') && <Coach onInspectExercise={inspectExercise} />}
                      {tab === 'inbox'    && <Inbox />}
                      {tab === 'anamnese' && <Anamnese />}
                      {tab === 'focus'    && <Fokus initialLayer={focusLayer} onLayerChange={navigateFocusLayer} />}
                      {tab === 'settings' && <Settings />}
                  </div>
                </div>
              </div>
            </main>

            {navMode === 'tabs' && <MobileNav tab={tab} navigate={navigate} swipeHint={swipeHint} navItems={navItems} />}
          </div>
        </div>
      </ErrorBoundary>
      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />
    </>
  );
}
