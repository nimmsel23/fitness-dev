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
import { TAB_CONFIG } from '@fuel/tabs/index.jsx'
import TabContent from '@fuel/components/TabContent.jsx'
import { useAppData } from '@fuel/hooks/useAppData.js'
import '@fuel/styles.css'

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
      <nav style={{
        display: 'flex',
        gap: 4,
        padding: '6px 12px',
        borderBottom: '1px solid #1e293b',
        overflowX: 'auto',
        flexShrink: 0,
      }}>
        {TAB_CONFIG.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              background: activeTab === key ? '#3b82f6' : 'transparent',
              color: activeTab === key ? '#fff' : '#64748b',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </nav>

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
