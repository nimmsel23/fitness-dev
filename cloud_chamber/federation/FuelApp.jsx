/**
 * FuelApp — exposed von fuel-dev als Module Federation Remote.
 *
 * Wird von fuel.remote.vite.config.js als './FuelApp' exposed.
 * Importiert fuel-dev's Internals via @fuel Alias (→ fuel-dev/src/client/).
 *
 * Kein createRoot, kein document.getElementById — fitness-dev mounted diese
 * Komponente in seinen eigenen React-Tree.
 */

import { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useApp } from '@fuel/store.js'
import TabContent from '@fuel/components/TabContent.jsx'
import { useAppData } from '@fuel/hooks/useAppData.js'
import '@fuel/styles.embedded.css'

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
})

function FuelInner() {
  const { activeTab, setActiveTab, activeDate, setActiveDate } = useApp()
  const appData = useAppData(activeDate)

  const ctx = {
    activeTab,
    setActiveTab,
    activeDate,
    setActiveDate,
    ...appData,
  }

  return (
    <div data-fuel-embedded style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Suspense fallback={
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
            Laden…
          </div>
        }>
          <TabContent activeTab={activeTab} ctx={ctx} />
        </Suspense>
      </div>
    </div>
  )
}

export default function FuelApp() {
  return (
    <QueryClientProvider client={qc}>
      <FuelInner />
    </QueryClientProvider>
  )
}
