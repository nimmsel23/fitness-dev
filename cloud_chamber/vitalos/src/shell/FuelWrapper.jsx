import { lazy, Suspense, useEffect } from 'react'
import { useApp } from '@fuel/store.js'

const FuelApp = lazy(() => import('fuel/FuelApp'))

export default function FuelWrapper({ user, subTab, onSubTab }) {
  const setActiveTab = useApp(s => s.setActiveTab)
  const activeTab    = useApp(s => s.activeTab)

  // Sidebar → Fuel: subTab-Änderung in Store schreiben
  useEffect(() => {
    if (subTab && subTab !== activeTab) setActiveTab(subTab)
  }, [subTab])

  // Fuel intern → Sidebar: Store-Änderung zurückmelden
  useEffect(() => {
    if (activeTab && onSubTab && activeTab !== subTab) onSubTab(activeTab)
  }, [activeTab])

  if (!user) return (
    <div className="flex items-center justify-center h-full text-fit-dim text-xs font-black uppercase tracking-widest">
      Fuel lädt…
    </div>
  )

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full text-fit-dim text-xs font-black uppercase tracking-widest">
        Fuel lädt…
      </div>
    }>
      <FuelApp />
    </Suspense>
  )
}
