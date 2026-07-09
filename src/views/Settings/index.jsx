import { useState, useEffect } from "react";
import { Settings2 } from "lucide-react";
import { api, isLocalMode } from "@db";
import AppearanceSection from "./AppearanceSection";
import TrainingSection from "./TrainingSection";
import AdvancedSection from "./AdvancedSection";
import LocalDevSection from "./LocalDevSection";
import ProfileSection from "./ProfileSection";

export default function Settings({
  user,
  layoutScale, setLayoutScale,
  gender, setGender,
  split, setSplit,
  cycleLength, setCycleLength,
  defaultLocation, setDefaultLocation,
  recentDays, setRecentDays,
  coverageThreshold, setCoverageThreshold,
  showAdvanced, setShowAdvanced,
  dashboardHighlighter, setDashboardHighlighter,
  themeMode, setModeState, circLight, setCircLight, circDark, setCircDark,
  themes, theme, setThemeState,
  sidebarPinned, setSidebarPinned,
  navMode, setNavMode,
  muscleLanguage, setMuscleLanguage,
  swipeEnabled, setSwipeEnabled,
}) {
  const [health, setHealth] = useState(null)
  const [wger, setWger] = useState(null)
  const [firestoreStatus, setFirestoreStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [swVersion, setSwVersion] = useState(null)
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)
  const [swChecking, setSwChecking] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const sw = navigator.serviceWorker
    const askVersion = () => { if (sw.controller) sw.controller.postMessage({ type: 'GET_VERSION' }) }
    const onMsg = (e) => { if (e.data?.type === 'VERSION') setSwVersion(e.data.version) }
    sw.addEventListener('message', onMsg)
    askVersion()
    const reg = window.__swRegistration
    if (reg?.waiting) setSwUpdateAvailable(true)
    const onUpdate = () => setSwUpdateAvailable(true)
    window.addEventListener('sw-update-available', onUpdate)
    return () => {
      sw.removeEventListener('message', onMsg)
      window.removeEventListener('sw-update-available', onUpdate)
    }
  }, [])

  async function handleSwCheck() {
    setSwChecking(true)
    try {
      const reg = window.__swRegistration || await navigator.serviceWorker?.getRegistration()
      if (reg) await reg.update()
      if (reg?.waiting) setSwUpdateAvailable(true)
    } catch {}
    setTimeout(() => setSwChecking(false), 600)
  }

  function handleSwApply() {
    const reg = window.__swRegistration
    if (reg?.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    else window.location.reload()
  }

  useEffect(() => {
    if (!isLocalMode()) {
      // Im Firebase-Build läuft die App direkt auf Firestore — Status implizit "verbunden"
      setFirestoreStatus({ ok: true, project: 'fitness-aos', source: 'native' })
      return
    }
    if (!api) return;
    let alive = true;
    api.get('/health').then(d => alive && setHealth(d)).catch(() => alive && setHealth({ ok: false }))
    fetch('http://localhost:8000/api/v2/language/?format=json')
      .then(r => alive && setWger(r.ok))
      .catch(() => alive && setWger(false))
    api.get('/firestore/status').then(d => alive && setFirestoreStatus(d)).catch(() => alive && setFirestoreStatus({ ok: false }))
    return () => { alive = false }
  }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      await api.post('/firestore/sync', {})
      const s = await api.get('/firestore/status')
      setFirestoreStatus(s)
    } catch {
      setFirestoreStatus({ ok: false })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto">
    <header className="mb-4 animate-in fade-in duration-700">
    <h2 className="text-3xl font-black text-fit-ink">Settings</h2>
    <p className="text-sm font-medium opacity-40">Konfiguriere dein AlphaOS Fitness Erlebnis.</p>
    </header>

    {/* HIER KOMMT DIE NEUE PROFIL-SEKTION HIN */}
    <ProfileSection user={user} />

    {/* DAS BESTEHENDE GRID FÜR APPEARANCE UND TRAINING */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <AppearanceSection
    themeMode={themeMode} setModeState={setModeState}
    circLight={circLight} setCircLight={setCircLight}
    circDark={circDark} setCircDark={setCircDark}
    themes={themes} theme={theme} setThemeState={setThemeState}
    />
    <TrainingSection
    split={split} setSplit={setSplit}
    gender={gender} setGender={setGender}
    defaultLocation={defaultLocation} setDefaultLocation={setDefaultLocation}
    cycleLength={cycleLength} setCycleLength={setCycleLength}
    recentDays={recentDays} setRecentDays={setRecentDays}
    coverageThreshold={coverageThreshold} setCoverageThreshold={setCoverageThreshold}
    swVersion={swVersion} swUpdateAvailable={swUpdateAvailable} swChecking={swChecking}
    onSwCheck={handleSwCheck} onSwApply={handleSwApply}
    />
    </div>

    {isLocalMode() && (
      <LocalDevSection
      firestoreStatus={firestoreStatus}
      syncing={syncing} onSync={handleSync}
      health={health} wger={wger}
      />
    )}

    <div className="flex justify-center pt-2">
    <button
    onClick={() => setShowAdvanced(!showAdvanced)}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-black text-[9px] uppercase tracking-widest ${showAdvanced ? 'border-fit-accent bg-fit-accent/5 text-fit-accent shadow-lg shadow-fit-accent/5' : 'border-fit-line bg-fit-bg2 text-fit-dim hover:text-fit-ink'}`}
    >
    <Settings2 size={12} className={showAdvanced ? 'animate-pulse' : ''} />
    {showAdvanced ? 'Advanced Mode: Ein' : 'Advanced Mode: Aus'}
    </button>
    </div>

    {showAdvanced && (
      <AdvancedSection
      swipeEnabled={swipeEnabled} setSwipeEnabled={setSwipeEnabled}
      dashboardHighlighter={dashboardHighlighter} setDashboardHighlighter={setDashboardHighlighter}
      navMode={navMode} setNavMode={setNavMode}
      sidebarPinned={sidebarPinned} setSidebarPinned={setSidebarPinned}
      layoutScale={layoutScale} setLayoutScale={setLayoutScale}
      muscleLanguage={muscleLanguage} setMuscleLanguage={setMuscleLanguage}
      user={user}
      />
    )}
    </div>
  );
}
