/**
 * FuelTab — fitness-dev Tab-Komponente die fuel/FuelApp konsumiert.
 *
 * In NavigationItems.js eintragen (wenn aktiviert):
 *   { id: 'fuel', label: 'Fuel', view: lazy(() => import('../cloud_chamber/federation/FuelTab')) }
 *
 * Voraussetzung: fitness-dev wurde mit fitness.host.vite.config.js gebaut
 * und fuel-dev Remote ist erreichbar.
 */

export default function FuelTab() {
  const src = import.meta.env.DEV ? 'http://localhost:9000' : 'https://fuel-vos.web.app'
  return (
    <iframe
      src={src}
      style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
      title="Fuel"
    />
  )
}
