import { lazy, Suspense } from 'react'

const JournalApp = lazy(() => import('journal/JournalApp'))

export default function JournalShell() {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8b5cf6', fontSize: 13 }}>
          Journal lädt…
        </div>
      }>
        <JournalApp />
      </Suspense>
    </div>
  )
}
