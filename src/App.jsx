import { useState, useEffect, Component } from 'react'
import { Activity, BarChart3, BookOpen, Dumbbell, Settings2, Brain, Target, Sparkles, User } from 'lucide-react'
import Dashboard from './views/Dashboard.jsx'
import Session from './views/Session.jsx'
import Journal from './views/Journal/index.jsx'
import Muscles from './views/Muscles.jsx'
import Learn from './views/Learn.jsx'
import Habits from './views/Habits/index.jsx'
import WeeklyReview from './views/WeeklyReview.jsx'
import Settings from './views/Settings.jsx'
import ExerciseInsightModal from './components/ExerciseInsightModal.jsx'
import { api } from './api.js'

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

const VALID_TABS = new Set(['dash', 'session', 'review', 'learn', 'journal', 'habits', 'muscles', 'settings'])

const DARK_THEMES = ['nordic', 'dracula', 'midnight', 'matrix', 'forest', 'crimson', 'slate', 'zinc'];
const LIGHT_THEMES = ['honey', 'snow', 'rose', 'latte', 'mint', 'cyan', 'gold'];

const THEMES = {
  latte: { bg: '#eff1f5', accent: '#1e66f5' },
  frappe: { bg: '#303446', accent: '#8caaee' },
  macchiato: { bg: '#24273a', accent: '#8aadf4' },
  mocha: { bg: '#1e1e2e', accent: '#89b4fa' },
  nordic: { bg: '#2e3440', accent: '#88c0d0' },
  dracula: { bg: '#1e1f29', accent: '#bd93f9' },
  'dracula-purple': { bg: '#1a1526', accent: '#ff79c6' },
  'nordic-darker': { bg: '#2e3440', accent: '#88c0d0' },
  'nordic-bluish': { bg: '#2e3440', accent: '#81a1c1' },
  'arc-dark': { bg: '#2f3445', accent: '#5294e2' },
  sweet: { bg: '#101013', accent: '#ff4081' },
  'sweet-purple': { bg: '#161925', accent: '#c50ed2' },
  'sweet-mars': { bg: '#2b1d1f', accent: '#ff5f5f' },
  'sweet-amber-blue': { bg: '#0f172a', accent: '#f59e0b' },
  'ant-dark': { bg: '#222e32', accent: '#9bbfbf' },
  materia: { bg: '#1e1e1e', accent: '#8ab4f8' },
  'solarized-dark': { bg: '#002b36', accent: '#268bd2' },
  homunculus: { bg: '#18181b', accent: '#a16262' },
  nothing: { bg: '#000000', accent: '#ffffff' },
  ant: { bg: '#f0f2f5', accent: '#1677ff' },
  arc: { bg: '#ffffff', accent: '#5294e2' },
  solarized: { bg: '#fdf6e3', accent: '#268bd2' },
  alucard: { bg: '#fffbeb', accent: '#644ac9' },
  gruvbox: { bg: '#282828', accent: '#fabd2f' },
  honey: { bg: '#fffaf0', accent: '#f59e0b' },
  midnight: { bg: '#090b10', accent: '#3b82f6' },
  matrix: { bg: '#000000', accent: '#00ff41' },
  forest: { bg: '#1a2f23', accent: '#4ade80' },
  crimson: { bg: '#1a0f12', accent: '#f43f5e' },
  slate: { bg: '#0f172a', accent: '#38bdf8' },
  zinc: { bg: '#18181b', accent: '#a1a1aa' },
  snow: { bg: '#ffffff', accent: '#3b82f6' },
  rose: { bg: '#fff1f2', accent: '#f43f5e' },
  mint: { bg: '#f0fff4', accent: '#10b981' },
  cyan: { bg: '#ecfeff', accent: '#06b6d4' },
  gold: { bg: '#fffbeb', accent: '#d97706' }
};

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
                     <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center overflow-hidden">
                        <User size={20} className="text-[var(--accent)]" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black text-[var(--ink)] truncate">{user.displayName}</div>
                        <div className="text-[9px] font-bold text-[var(--dim)] truncate opacity-50">{user.email} · localhost</div>
                     </div>
                  </div>
               </div>
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
                  {tab === 'dash'     && <Dashboard onOpenSession={openSession} onInspectExercise={inspectExercise} onOpenReview={() => navigate('review')} />}
                  {tab === 'session'  && <Session key={sessionDate || 'today'} initialDate={sessionDate} initialDraft={sessionDraft} onInspectExercise={inspectExercise} />}
                  {tab === 'review'   && <WeeklyReview onOpenSession={openSession} onInspectExercise={inspectExercise} hitMode={hitMode} />}
                  {tab === 'learn'    && <Learn onInspectExercise={inspectExercise} />}
                  {tab === 'habits'   && <Habits />}
                  {tab === 'journal'  && <Journal />}
                  {tab === 'muscles'  && <Muscles hitMode={hitMode} gender={gender} />}
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
      <ExerciseInsightModal exercise={inspectorExercise} onClose={() => setInspectorExercise(null)} />
    </>
  );
}
