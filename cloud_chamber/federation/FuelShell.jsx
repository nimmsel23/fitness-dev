import { lazy, Suspense } from 'react'

const FuelApp = lazy(() => import('fuel/FuelApp'))

export default function FuelShell() {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#f97316', fontSize: 13 }}>
          Fuel lädt…
        </div>
      }>
        <FuelApp />
      </Suspense>
    </div>
  )
}
