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

export default function FuelTab() {
  const src = import.meta.env.DEV ? 'http://localhost:9000' : 'https://fuel-aos.web.app';
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <iframe
        src={src}
        style={{
          flex: 1,
          border: 'none',
          width: '100%',
          height: '100%',
          background: 'var(--bg)',
        }}
        title="Fuel"
      />
    </div>
  )
}
