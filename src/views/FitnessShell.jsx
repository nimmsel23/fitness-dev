import Dashboard from './Dashboard/index.jsx'
import Session   from './Session/index.jsx'
import { useState } from 'react'
import { Activity, Dumbbell } from 'lucide-react'

const TABS = [
  { id: 'dash',    label: 'Heute',    Icon: Activity, View: Dashboard },
  { id: 'session', label: 'Training', Icon: Dumbbell, View: Session   },
]

export default function FitnessShell() {
  const [tab, setTab] = useState('dash')
  const Active = TABS.find(t => t.id === tab)?.View

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <nav style={{ display: 'flex', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: '12px 0', border: 'none', cursor: 'pointer', fontSize: 14,
            fontWeight: 500, background: tab === id ? '#0f172a' : 'transparent',
            color: tab === id ? '#e2e8f0' : '#475569',
            borderBottom: tab === id ? '2px solid #3b82f6' : '2px solid transparent',
          }}>
            <Icon size={16} />{label}
          </button>
        ))}
      </nav>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {Active && <Active />}
      </div>
    </div>
  )
}
