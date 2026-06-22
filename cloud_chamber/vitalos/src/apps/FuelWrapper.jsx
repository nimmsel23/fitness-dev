import { lazy, Suspense, useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'

const FuelApp = lazy(() => import('fuel/FuelApp'))

export default function FuelWrapper() {
  const [authReady, setAuthReady] = useState(() => !!getAuth().currentUser)

  useEffect(() => {
    if (authReady) return
    return getAuth().onAuthStateChanged(u => { if (u) setAuthReady(true) })
  }, [authReady])

  if (!authReady) return (
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
