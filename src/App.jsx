import { useState, useEffect, Component } from 'react'
import { Activity, BarChart3, BookOpen, Dumbbell, Settings2, Brain, Target, Sparkles, User, RefreshCw } from 'lucide-react'
import Dashboard from './views/Dashboard.jsx'
import Session from './views/Session.jsx'
import Journal from './views/Journal/index.jsx'
import Learn from './views/Learn/index.jsx'
import Habits from './views/Habits/index.jsx'
import WeeklyReview from './views/WeeklyReview.jsx'
import Settings from './views/Settings.jsx'
import ExerciseInsightModal from './components/ExerciseInsightModal.jsx'
import { api } from './api.js'

import { NAV_ITEMS, VALID_TABS } from '../shared/components/NavigationItems.js'
import { THEMES, DARK_THEMES, LIGHT_THEMES } from '../shared/components/Themes.js'
import Sidebar from '../shared/components/Sidebar.jsx'
import MobileNav from '../shared/components/MobileNav.jsx'
import MobileHeader from '../shared/components/MobileHeader.jsx'
import UserProfile from '../shared/components/UserProfile.jsx'
import ErrorBoundary from '../shared/components/ErrorBoundary.jsx'

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
  const [age, setAge] = useState(() => parseInt(localStorage.getItem('fitness-age') || '30', 10));
  const [weightKg, setWeightKg] = useState(() => parseFloat(localStorage.getItem('fitness-weightKg') || '80', 10));
  const [freqPerWeek, setFreqPerWeek] = useState(() => parseInt(localStorage.getItem('fitness-freqPerWeek') || '4', 10));
  const [sessionDate, setSessionDate]   = useState(null)
  const [sessionDraft, setSessionDraft] = useState(null)
  const [inspectorExercise, setInspectorExercise] = useState(null)

  // Persistence Effects
  useEffect(() => { localStorage.setItem('fitness-hitMode', hitMode) }, [hitMode]);
  useEffect(() => { localStorage.setItem('fitness-planMode', planMode) }, [planMode]);
  useEffect(() => { localStorage.setItem('fitness-gender', gender) }, [gender]);
  useEffect(() => { localStorage.setItem('fitness-split', split) }, [split]);
  useEffect(() => { localStorage.setItem('fitness-cycleLength', cycleLength) }, [cycleLength]);
  useEffect(() => { localStorage.setItem('fitness-defaultLocation', defaultLocation) }, [defaultLocation]);
  useEffect(() => { localStorage.setItem('fitness-age', age) }, [age]);
  useEffect(() => { localStorage.setItem('fitness-weightKg', weightKg) }, [weightKg]);
  useEffect(() => { localStorage.setItem('fitness-freqPerWeek', freqPerWeek) }, [freqPerWeek]);
  useEffect(() => { localStorage.setItem('fitness-theme', theme) }, [theme]);
  useEffect(() => { localStorage.setItem('fitness-theme-mode', themeMode) }, [themeMode]);
  useEffect(() => { localStorage.setItem('fitness-circ-dark', circDark) }, [circDark]);
  useEffect(() => { localStorage.setItem('fitness-circ-light', circLight) }, [circLight]);

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

  function setManualTheme(t) {
    setModeState('manual')
    setThemeState(t)
  }

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

        <Sidebar tab={tab} navigate={navigate}>
          <UserProfile user={user} subtitle={`${user.email} · localhost`} />
          <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--dim)] bg-[var(--bg2)] rounded-xl hover:bg-white/5 transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
        </Sidebar>

        <div className="flex-1 lg:ml-[280px]">
          <MobileHeader navigate={navigate} />

          <main className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {tab === 'dash'     && <Dashboard onOpenSession={openSession} onInspectExercise={inspectExercise} onOpenReview={() => navigate('review')} />}
                  {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} />}
                  {tab === 'review'   && <WeeklyReview onOpenSession={openSession} onInspectExercise={inspectExercise} hitMode={hitMode} />}
                  {tab === 'learn'    && <Learn onInspectExercise={inspectExercise} hitMode={hitMode} gender={gender} />}
                  {tab === 'habits'   && <Habits />}
                  {tab === 'journal'  && <Journal />}
                  {tab === 'settings' && (
                     <Settings
                       user={user}
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
                       darkThemes={DARK_THEMES} lightThemes={LIGHT_THEMES}
                       age={age} setAge={setAge}
                       weightKg={weightKg} setWeightKg={setWeightKg}
                       freqPerWeek={freqPerWeek} setFreqPerWeek={setFreqPerWeek}
                       DAY_START_PROP={DAY_START} DAY_END_PROP={DAY_END}
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

