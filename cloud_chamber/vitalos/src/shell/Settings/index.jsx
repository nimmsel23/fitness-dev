import { useState, useEffect } from "react";
import { api, isLocalMode } from "@db";
import AppearanceSection from "./AppearanceSection";
import TrainingSection from "./TrainingSection";
import AdvancedSection from "./AdvancedSection";
import LocalDevSection from "./LocalDevSection";
import AccountSection from "./AccountSection";
import ProfileSection from "./ProfileSection";
import FuelSection from "./FuelSection";

export default function Settings({
  user, signOut,
  layoutScale, setLayoutScale,
  gender, setGender,
  age, setAge,
  heightCm, setHeightCm,
  weightKg, setWeightKg,
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
  mobileLayout, setMobileLayout,
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
    if (!isLocalMode() || !api) return;
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
          <p className="text-sm font-medium opacity-40">VitalOS — Fitness, Ernährung, Journal</p>
       </header>

       <AccountSection user={user} signOut={signOut} />

       <ProfileSection
         gender={gender} setGender={setGender}
         age={age} setAge={setAge}
         heightCm={heightCm} setHeightCm={setHeightCm}
         weightKg={weightKg} setWeightKg={setWeightKg}
       />

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
            showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
            swVersion={swVersion} swUpdateAvailable={swUpdateAvailable} swChecking={swChecking}
            onSwCheck={handleSwCheck} onSwApply={handleSwApply}
          />
          <FuelSection />
       </div>

       {isLocalMode() && (
         <LocalDevSection
           firestoreStatus={firestoreStatus}
           syncing={syncing} onSync={handleSync}
           health={health} wger={wger}
         />
       )}

       {showAdvanced && (
         <AdvancedSection
           swipeEnabled={swipeEnabled} setSwipeEnabled={setSwipeEnabled}
           dashboardHighlighter={dashboardHighlighter} setDashboardHighlighter={setDashboardHighlighter}
           mobileLayout={mobileLayout} setMobileLayout={setMobileLayout}
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
