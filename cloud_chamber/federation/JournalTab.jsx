/**
 * JournalTab — fitness-dev Tab-Komponente die journal/JournalApp konsumiert.
 *
 * In NavigationItems.js eintragen (wenn aktiviert):
 *   { id: 'journal_tab', label: 'Journal', view: lazy(() => import('../cloud_chamber/federation/JournalTab')) }
 *
 * Voraussetzung: fitness-dev wurde mit fitness.host.vite.config.js gebaut
 * und journal-dev Remote ist erreichbar.
 */

import React from 'react'

const JournalApp = React.lazy(() => import('journal/JournalApp'))

export default function JournalTab() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <React.Suspense fallback={
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: 13,
        }}>
          Journal lädt…
        </div>
      }>
        <JournalApp />
      </React.Suspense>
    </div>
  )
}
