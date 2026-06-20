/**
 * JournalApp — exposed von journal-dev als Module Federation Remote.
 *
 * Wird von journal.remote.vite.config.js als './JournalApp' exposed.
 * Kein Auth-Gate — host (fitness-dev) kümmert sich um Auth.
 * Kein createRoot — fitness-dev mounted diese Komponente in seinen React-Tree.
 *
 * @db Alias zeigt beim Remote-Build auf journal-dev/src/db.js (:9170)
 * oder journal-dev/src/db.firestore.js (--mode firebase).
 */

import { useState } from 'react'
import { BookOpen, CheckSquare } from 'lucide-react'
import Journal from '../journal-dev/src/views/Journal/index.jsx'
import Habits  from '../journal-dev/src/views/Habits/index.jsx'

const TABS = [
  { id: 'journal', label: 'Journal', Icon: BookOpen, View: Journal },
  { id: 'habits',  label: 'Habits',  Icon: CheckSquare, View: Habits  },
]

export default function JournalApp() {
  const [tab, setTab] = useState('journal')
  const Active = TABS.find(t => t.id === tab)?.View

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <nav style={{
        display: 'flex',
        gap: 4,
        padding: '6px 12px',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              background: tab === id ? '#3b82f6' : 'transparent',
              color: tab === id ? '#fff' : '#64748b',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            <Icon size={13} />{label}
          </button>
        ))}
      </nav>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {Active && <Active />}
      </div>
    </div>
  )
}
