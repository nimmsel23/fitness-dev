/**
 * FuelTab — fitness-dev Tab-Komponente die fuel/FuelApp konsumiert.
 *
 * In NavigationItems.js eintragen (wenn aktiviert):
 *   { id: 'fuel', label: 'Fuel', view: lazy(() => import('../cloud_chamber/federation/FuelTab')) }
 *
 * Voraussetzung: fitness-dev wurde mit fitness.host.vite.config.js gebaut
 * und fuel-dev Remote ist erreichbar.
 */

import React from 'react'

const FuelApp = React.lazy(() => import('fuel/FuelApp'))

export default function FuelTab() {
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
          Fuel lädt…
        </div>
      }>
        <FuelApp />
      </React.Suspense>
    </div>
  )
}
