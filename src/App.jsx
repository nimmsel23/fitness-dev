import { useState, useEffect } from 'react'
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
  const user = { displayName: 'Local Host', email: 'localhost', photoURL: null };
  
  const [theme, setThemeState]    = useState(() => localStorage.getItem('fitness-theme') || 'nordic');
  const [themeMode, setModeState] = useState(() => localStorage.getItem('fitness-theme-mode') || 'manual');
  // Circadian: which dark + which light to use
  const [circDark,  setCircDark]  = useState(() => localStorage.getItem('fitness-circ-dark') || 'nordic');
  const [circLight, setCircLight] = useState(() => localStorage.getItem('fitness-circ-light') || 'honey');
  const [hitMode, setHitMode] = useState(() => localStorage.getItem('fitness-hitMode') === 'true');
  const [planMode, setPlanMode] = useState(() => localStorage.getItem('fitness-planMode') === 'true');
  const [gender, setGender] = useState(() => localStorage.getItem('fitness-gender') || 'male');
  const [split, setSplit] = useState(() => localStorage.getItem('fitness-split') || 'PPL');
  const [cycleLength, setCycleLength] = useState(() => parseInt(localStorage.getItem('fitness-cycleLength') || '4', 10));
  const [defaultLocation, setDefaultLocation] = useState(() => localStorage.getItem('fitness-defaultLocation') || 'Home');
  const [sessionDate, setSessionDate]   = useState(null)
  const [sessionDraft, setSessionDraft] = useState(null)
  const [inspectorExercise, setInspectorExercise] = useState(null)
  const [layoutScale, setLayoutScale] = useState(() => parseInt(localStorage.getItem('fitness-layoutScale') || '100', 10));
  const [recentDays, setRecentDays] = useState(() => parseInt(localStorage.getItem('fitness-recentDays') || '7', 10));
  const [coverageThreshold, setCoverageThreshold] = useState(() => parseFloat(localStorage.getItem('fitness-coverageThreshold') || '1.0'));
  const [showAdvanced, setShowAdvanced] = useState(() => localStorage.getItem('fitness-showAdvanced') === 'true');
  const [dashboardHighlighter, setDashboardHighlighter] = useState(() => localStorage.getItem('fitness-dashboardHighlighter') || 'body');
  const [sidebarPinned, setSidebarPinned] = useState(() => localStorage.getItem('fitness-sidebarPinned') !== 'false');

  // Swipe Navigation Logic
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 70;

  useEffect(() => {
    document.documentElement.style.fontSize = `${layoutScale}%`;
  }, [layoutScale]);

  useEffect(() => {
    const onTouchStart = (e) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe || isRightSwipe) {
        const items = NAV_ITEMS;
        const currentIndex = items.findIndex(i => i.id === tab);
        if (currentIndex === -1) return; // Not in main nav items (e.g. session/review)

        if (isLeftSwipe && currentIndex < items.length - 1) {
          navigate(items[currentIndex + 1].id);
        } else if (isRightSwipe && currentIndex > 0) {
          navigate(items[currentIndex - 1].id);
        }
      }
    };

    const main = document.querySelector('main');
    if (main) {
      main.addEventListener('touchstart', onTouchStart);
      main.addEventListener('touchmove', onTouchMove);
      main.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      if (main) {
        main.removeEventListener('touchstart', onTouchStart);
        main.removeEventListener('touchmove', onTouchMove);
        main.removeEventListener('touchend', onTouchEnd);
      }
    };
  }, [touchStart, touchEnd, tab]);

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

  return (
    <>
      <ErrorBoundary>
        <div className="flex min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans transition-colors duration-500">

        <Sidebar tab={tab} navigate={navigate} pinned={sidebarPinned} setPinned={setSidebarPinned}>
          <UserProfile user={user} subtitle={`${user.email} · localhost`} />
          <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--dim)] bg-[var(--bg2)] rounded-xl hover:bg-white/5 transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
        </Sidebar>

        <div className={`flex-1 transition-all duration-300 ${sidebarPinned ? 'lg:ml-[280px]' : 'lg:ml-20'}`}>
          <MobileHeader navigate={navigate} tab={tab} sidebarPinned={sidebarPinned} setSidebarPinned={setSidebarPinned} />

          <main className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {tab === 'dash'     && <Dashboard onOpenSession={openSession} onInspectExercise={inspectExercise} onOpenReview={() => navigate('review')} recentDays={recentDays} coverageThreshold={coverageThreshold} dashboardHighlighter={dashboardHighlighter} />}
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
                     />
                  )}
              </div>
            </main>

            <MobileNav tab={tab} navigate={navigate} />
          </div>
        </div>
      </ErrorBoundary>
      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} />
    </>
  );
}

