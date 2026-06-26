/**
 * JournalTab — fitness-dev Tab-Komponente die journal/JournalApp konsumiert.
 *
 * In NavigationItems.js eintragen (wenn aktiviert):
 *   { id: 'journal', label: 'Journal', Icon: BookOpen,
 *     view: lazy(() => import('../cloud_chamber/federation/JournalTab')) }
 *
 * Voraussetzung: fitness-dev wurde mit fitness.host.vite.config.js gebaut
 * und journal-vos Remote ist erreichbar (lokal: :9173, prod: journal-aos.web.app).
 */

import React from 'react'

const JournalApp = React.lazy(() => import.meta.env.VITE_FEDERATION === 'true' ? import('journal/JournalApp') : import('../../src/views/Journal/index.jsx'))

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
