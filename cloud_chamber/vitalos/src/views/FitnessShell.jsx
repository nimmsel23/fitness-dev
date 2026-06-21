import { lazy, Suspense } from 'react'

const FitnessApp = lazy(() => import('fitness/FitnessApp'))

export default function FitnessShell() {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#3b82f6', fontSize: 13 }}>
          Fitness lädt…
        </div>
      }>
        <FitnessApp />
      </Suspense>
    </div>
  )
}
