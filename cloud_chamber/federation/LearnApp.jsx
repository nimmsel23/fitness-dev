/**
 * LearnApp — exposed von learn-dev als Module Federation Remote.
 *
 * Wird von learn.remote.vite.config.js als './LearnApp' exposed.
 * Kein Auth-Gate — host (fitness-dev) kümmert sich um Auth.
 * Kein createRoot — fitness-dev mounted diese Komponente in seinen React-Tree.
 *
 * @db Alias zeigt beim Remote-Build auf fitness-dev/src/db.js (:9100)
 * — Learn braucht kein eigenes Backend, nutzt fitness-dev API direkt.
 */

import Learn from '../../src/views/Learn/index.jsx'

export default function LearnApp() {
  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Learn />
    </div>
  )
}
