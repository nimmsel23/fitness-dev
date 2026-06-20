/**
 * LearnTab — fitness-dev Tab-Komponente die learn/LearnApp konsumiert.
 *
 * In NavigationItems.js eintragen (wenn aktiviert):
 *   { id: 'learn', label: 'Lernen', Icon: BookOpen,
 *     view: lazy(() => import('../cloud_chamber/federation/LearnTab')) }
 *
 * Voraussetzung: fitness-dev wurde mit fitness.host.vite.config.js gebaut
 * und learn Remote ist erreichbar (lokal: :9183, prod: learn-aos.web.app).
 */

import React from 'react'

const LearnApp = React.lazy(() => import('learn/LearnApp'))

export default function LearnTab() {
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
          Lernen lädt…
        </div>
      }>
        <LearnApp />
      </React.Suspense>
    </div>
  )
}
