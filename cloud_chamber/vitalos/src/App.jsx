import { useState, useEffect, lazy, Suspense } from 'react'
import { RefreshCw } from 'lucide-react'
import { watchAuth, signIn, signInEmail, signUpEmail, signOut, isLocalMode, auth } from '@db'
import { VALID_TABS, SUB_NAV } from './shell/NavigationItems.js'
import { THEMES } from '@constants/Themes.js'
import Settings from '@view/settings/index.jsx'
import Sidebar from './shell/layout/Sidebar.jsx'
import MobileShell from './shell/layout/MobileShell.jsx'
import UserProfile from './components/common/UserProfile.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

const FitnessApp  = lazy(() => import('./shell/FitnessApp.jsx'))
const FuelWrapper = lazy(() => import('./shell/FuelWrapper.jsx'))
const JournalApp  = lazy(() => import('./shell/JournalApp.jsx'))
const HabitsApp   = lazy(() => import('./shell/HabitsApp.jsx'))
const LearnApp    = lazy(() => import('./shell/LearnApp.jsx'))

const DAY_START = 8
const DAY_END   = 20

const Loader = ({ label }) => (
  <div className="flex items-center justify-center h-full text-fit-dim text-xs font-black uppercase tracking-widest">
    {label}…
  </div>
)

function Views({ tab, fitnessProps, fuelTab, setFuelTab, user, settingsProps, openSession, compact, muscleLanguage, taxonomy }) {
  const p = compact ? 'p-4' : 'p-4 sm:p-8 lg:p-12'
  return (
    <Suspense fallback={<Loader label={tab} />}>
      {tab === 'fitness'  && <FitnessApp  {...fitnessProps} />}
      {tab === 'fuel'     && <FuelWrapper user={user} subTab={fuelTab} onSubTab={setFuelTab} />}
      {tab === 'journal'  && <JournalApp onOpenSession={openSession} />}
      {tab === 'habits'   && <HabitsApp />}
      {tab === 'learn'    && <LearnApp muscleLanguage={muscleLanguage} taxonomy={taxonomy} />}
      {tab === 'settings' && <div className={`${p} max-w-[1600px] mx-auto`}><Settings {...settingsProps} /></div>}
    </Suspense>
  )
}

export default function App() {
  const [tab, setTab] = useState(() => {
    const hash = window.location.hash.replace(/^#\/?/, '')
    return VALID_TABS.has(hash) ? hash : 'fitness'
  })
  const [fitnessTab,    setFitnessTab]    = useState('dash')
  const [fuelTab,       setFuelTab]       = useState('dashboard')
  const [sessionDate,   setSessionDate]   = useState(null)
  const [sessionDraft,  setSessionDraft]  = useState(null)

  function openSession(date, draft = null) {
    setSessionDate(date || null)
    setSessionDraft(draft || null)
    setFitnessTab('session')
    setTab('fitness')
  }

  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authEmail, setAuthEmail]     = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError]     = useState('')
  const [authRegistering, setAuthRegistering] = useState(false)

  useEffect(() => {
    if (isLocalMode()) { setAuthLoading(false); return }
    // authStateReady() wartet bis Firebase die Session aus IndexedDB geladen hat —
    // verhindert Login-Screen-Flash bei jedem Reload
    auth.authStateReady().then(() => {
      setAuthLoading(false)
      watchAuth(u => setUser(u))
    })
  }, [])

  // Settings state
  const [theme, setThemeState]    = useState(() => localStorage.getItem('vitalos-theme') || 'nordic')
  const [themeMode, setModeState] = useState(() => localStorage.getItem('vitalos-theme-mode') || 'manual')
  const [circDark,  setCircDark]  = useState(() => localStorage.getItem('vitalos-circ-dark') || 'nordic')
  const [circLight, setCircLight] = useState(() => localStorage.getItem('vitalos-circ-light') || 'honey')
  const [gender, setGender]       = useState(() => localStorage.getItem('vitalos-gender') || 'm')
  const [age, setAge]             = useState(() => parseInt(localStorage.getItem('vitalos-age') || '30', 10))
  const [heightCm, setHeightCm]   = useState(() => parseInt(localStorage.getItem('vitalos-height') || '175', 10))
  const [weightKg, setWeightKg]   = useState(() => parseFloat(localStorage.getItem('vitalos-weight') || '80'))
  const [split, setSplit]         = useState(() => localStorage.getItem('vitalos-split') || 'PPL')
  const [cycleLength, setCycleLength] = useState(() => parseInt(localStorage.getItem('vitalos-cycleLength') || '4', 10))
  const [defaultLocation, setDefaultLocation] = useState(() => localStorage.getItem('vitalos-defaultLocation') || 'Home')
  const [layoutScale, setLayoutScale] = useState(() => parseInt(localStorage.getItem('vitalos-layoutScale') || '100', 10))
  const [recentDays, setRecentDays]   = useState(() => parseInt(localStorage.getItem('vitalos-recentDays') || '7', 10))
  const [coverageThreshold, setCoverageThreshold] = useState(() => parseFloat(localStorage.getItem('vitalos-coverageThreshold') || '1.0'))
  const [showAdvanced, setShowAdvanced]           = useState(() => localStorage.getItem('vitalos-showAdvanced') === 'true')
  const [dashboardHighlighter, setDashboardHighlighter] = useState(() => localStorage.getItem('vitalos-dashboardHighlighter') || 'body')
  const [sidebarPinned, setSidebarPinned] = useState(() => localStorage.getItem('vitalos-sidebarPinned') !== 'false')
  const [muscleLanguage, setMuscleLanguage] = useState(() => localStorage.getItem('vitalos-muscleLanguage') || 'de')
  const [swipeEnabled, setSwipeEnabled]     = useState(() => localStorage.getItem('vitalos-swipeEnabled') === 'true')
  const [mobileLayout, setMobileLayoutState] = useState(() => localStorage.getItem('vitalos-mobileLayout') || 'classic')
  const setMobileLayout = v => { setMobileLayoutState(v); localStorage.setItem('vitalos-mobileLayout', v) }
  const [taxonomy, setTaxonomy] = useState(null)

  useEffect(() => {
    if (isLocalMode()) {
      fetch('http://localhost:9100/fitness/muscles')
        .then(r => r.json())
        .then(data => setTaxonomy(data?.muscles || null))
        .catch(() => {})
    }
  }, [])

  useEffect(() => { document.documentElement.style.fontSize = `${layoutScale}%` }, [layoutScale])

  useEffect(() => {
    if (themeMode === 'manual') {
      document.documentElement.setAttribute('data-theme', theme)
    } else {
      const hour = new Date().getHours()
      document.documentElement.setAttribute('data-theme', (hour >= DAY_START && hour < DAY_END) ? circLight : circDark)
    }
  }, [theme, themeMode, circLight, circDark])

  // Persist settings
  useEffect(() => { localStorage.setItem('vitalos-theme', theme) }, [theme])
  useEffect(() => { localStorage.setItem('vitalos-theme-mode', themeMode) }, [themeMode])
  useEffect(() => { localStorage.setItem('vitalos-circ-dark', circDark) }, [circDark])
  useEffect(() => { localStorage.setItem('vitalos-circ-light', circLight) }, [circLight])
  useEffect(() => { localStorage.setItem('vitalos-gender', gender) }, [gender])
  useEffect(() => { localStorage.setItem('vitalos-age', age) }, [age])
  useEffect(() => { localStorage.setItem('vitalos-height', heightCm) }, [heightCm])
  useEffect(() => { localStorage.setItem('vitalos-weight', weightKg) }, [weightKg])
  useEffect(() => { localStorage.setItem('vitalos-split', split) }, [split])
  useEffect(() => { localStorage.setItem('vitalos-cycleLength', cycleLength) }, [cycleLength])
  useEffect(() => { localStorage.setItem('vitalos-defaultLocation', defaultLocation) }, [defaultLocation])
  useEffect(() => { localStorage.setItem('vitalos-layoutScale', layoutScale) }, [layoutScale])
  useEffect(() => { localStorage.setItem('vitalos-recentDays', recentDays) }, [recentDays])
  useEffect(() => { localStorage.setItem('vitalos-coverageThreshold', coverageThreshold) }, [coverageThreshold])
  useEffect(() => { localStorage.setItem('vitalos-showAdvanced', showAdvanced) }, [showAdvanced])
  useEffect(() => { localStorage.setItem('vitalos-dashboardHighlighter', dashboardHighlighter) }, [dashboardHighlighter])
  useEffect(() => { localStorage.setItem('vitalos-sidebarPinned', sidebarPinned) }, [sidebarPinned])
  useEffect(() => { localStorage.setItem('vitalos-muscleLanguage', muscleLanguage) }, [muscleLanguage])
  useEffect(() => { localStorage.setItem('vitalos-swipeEnabled', swipeEnabled) }, [swipeEnabled])

  // Sync tab ↔ URL hash
  useEffect(() => {
    if (window.location.hash.slice(1) !== tab) history.pushState(null, '', `#${tab}`)
  }, [tab])

  function navigate(id) {
    if (VALID_TABS.has(id)) setTab(id)
  }

  async function handleAuthSubmit(e) {
    e.preventDefault()
    setAuthError('')
    try {
      if (authRegistering) await signUpEmail(authEmail, authPassword)
      else                 await signInEmail(authEmail, authPassword)
    } catch {
      setAuthError('Anmeldung fehlgeschlagen.')
    }
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-fit-bg">
      <div className="text-fit-dim text-xs font-black uppercase tracking-widest">…</div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-fit-bg text-fit-ink p-6">
      <div className="w-full max-w-sm card p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">VitalOS</h1>
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
        <div className="flex items-center gap-3">
          <div className="h-px bg-fit-line flex-1 opacity-50" />
          <span className="text-[9px] font-black uppercase text-fit-dim">oder</span>
          <div className="h-px bg-fit-line flex-1 opacity-50" />
        </div>
        <button onClick={signIn} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform">
          Google Login
        </button>
        <button onClick={() => setAuthRegistering(!authRegistering)} className="w-full text-[10px] font-black text-fit-dim uppercase hover:text-fit-accent">
          {authRegistering ? 'Bereits einen Account? Anmelden' : 'Neu hier? Account erstellen'}
        </button>
      </div>
    </div>
  )

  const settingsProps = {
    user, signOut,
    layoutScale, setLayoutScale,
    recentDays, setRecentDays,
    coverageThreshold, setCoverageThreshold,
    showAdvanced, setShowAdvanced,
    dashboardHighlighter, setDashboardHighlighter,
    gender, setGender,
    age, setAge,
    heightCm, setHeightCm,
    weightKg, setWeightKg,
    split, setSplit,
    cycleLength, setCycleLength,
    defaultLocation, setDefaultLocation,
    themeMode, setModeState,
    circLight, setCircLight,
    circDark, setCircDark,
    themes: THEMES, theme, setThemeState,
    sidebarPinned, setSidebarPinned,
    navMode: 'tabs', setNavMode: () => {},
    muscleLanguage, setMuscleLanguage,
    swipeEnabled, setSwipeEnabled,
    mobileLayout, setMobileLayout,
  }

  const fitnessProps = {
    user, recentDays, coverageThreshold,
    gender, muscleLanguage, taxonomy, dashboardHighlighter,
    subTab: fitnessTab, onSubTab: setFitnessTab,
    sessionDate, sessionDraft, onOpenSession: openSession,
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen overflow-x-hidden w-full bg-fit-bg text-fit-ink font-sans transition-colors duration-500">
        <Sidebar tab={tab} navigate={navigate} pinned={sidebarPinned} setPinned={setSidebarPinned} user={user}
          subNav={SUB_NAV[tab] || null}
          subTab={tab === 'fitness' ? fitnessTab : tab === 'fuel' ? fuelTab : null}
          onSubTab={tab === 'fitness' ? setFitnessTab : tab === 'fuel' ? setFuelTab : null}>
          <UserProfile user={user} subtitle={isLocalMode() ? `${user?.email || 'localhost'} · localhost` : (user?.email || '')} onOpenSettings={() => navigate('settings')} />
          {!isLocalMode() && (
            <button onClick={signOut} className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-fit-red bg-fit-red/5 border border-fit-red/10 rounded-xl hover:bg-fit-red/10 transition-all">
              Logout
            </button>
          )}
          <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-fit-dim bg-fit-bg2 rounded-xl hover:bg-white/5 transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
        </Sidebar>

        <div className={`flex-1 min-w-0 transition-all duration-500 ease-in-out ${sidebarPinned ? 'lg:ml-[280px]' : 'lg:ml-24'}`}>
          {mobileLayout === 'fuel' ? (
            <>
              {/* Desktop: klassisches Layout */}
              <main className="hidden lg:block relative min-h-[100dvh]">
                <Views tab={tab} fitnessProps={fitnessProps} fuelTab={fuelTab} setFuelTab={setFuelTab} muscleLanguage={muscleLanguage} taxonomy={taxonomy}
                  user={user} settingsProps={settingsProps} openSession={openSession} />
              </main>
              {/* Mobile: Fuel-Layout */}
              <MobileShell tab={tab} navigate={navigate} mobileLayout="fuel">
                <Views tab={tab} fitnessProps={fitnessProps} fuelTab={fuelTab} setFuelTab={setFuelTab} muscleLanguage={muscleLanguage} taxonomy={taxonomy}
                  user={user} settingsProps={settingsProps} openSession={openSession} compact />
              </MobileShell>
            </>
          ) : (
            <>
              <main className="relative pb-28 sm:pb-10 lg:pb-0 min-h-[100dvh]">
                <Views tab={tab} fitnessProps={fitnessProps} fuelTab={fuelTab} setFuelTab={setFuelTab} muscleLanguage={muscleLanguage} taxonomy={taxonomy}
                  user={user} settingsProps={settingsProps} openSession={openSession} />
              </main>
              <MobileShell tab={tab} navigate={navigate} mobileLayout="classic" />
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
