import { useState, lazy, Suspense } from 'react'
import VitalOSSidebar from './components/layout/VitalOSSidebar.jsx'
import Hub from './views/Hub.jsx'

const FuelApp       = lazy(() => import('fuel/FuelApp'))
const JournalApp    = lazy(() => import('journal/JournalApp'))
const LearnApp      = lazy(() => import('learn/LearnApp'))
const FitnessShell  = lazy(() => import('./views/FitnessShell.jsx'))

const LOADERS = {
  fitness: FitnessShell,
  fuel:    FuelApp,
  journal: JournalApp,
  learn:   LearnApp,
}

function AppLoader({ id }) {
  const Component = LOADERS[id]
  if (!Component) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: 13 }}>
      {id} — coming soon
    </div>
  )
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: 13 }}>
        Lädt…
      </div>
    }>
      <Component />
    </Suspense>
  )
}

export default function App() {
  const [app, setApp]       = useState(null)
  const [pinned, setPinned] = useState(() => localStorage.getItem('vitalos-sidebarPinned') !== 'false')

  const handlePinned = (v) => {
    setPinned(v)
    localStorage.setItem('vitalos-sidebarPinned', v)
  }

  return (
    <div className="flex h-dvh bg-fit-bg text-fit-ink font-sans overflow-hidden">
      <VitalOSSidebar app={app} navigate={setApp} pinned={pinned} setPinned={handlePinned} />

      <main className={`flex-1 overflow-y-auto transition-all duration-500 ${pinned ? 'lg:ml-[220px]' : 'lg:ml-24'}`}>
        {app === null
          ? <Hub navigate={setApp} />
          : <AppLoader id={app} />
        }
      </main>
    </div>
  )
}
