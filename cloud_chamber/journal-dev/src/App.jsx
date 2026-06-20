import { useState } from 'react'
import { BookOpen, CheckSquare } from 'lucide-react'
import Journal from './views/Journal/index.jsx'
import Habits from './views/Habits/index.jsx'

const TABS = [
  { id: 'journal', label: 'Journal', Icon: BookOpen,    View: Journal },
  { id: 'habits',  label: 'Habits',  Icon: CheckSquare, View: Habits  },
]

export default function App() {
  const [tab, setTab] = useState('journal')
  const Active = TABS.find(t => t.id === tab)?.View

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh',
                  background: '#0a0a0f', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ display: 'flex', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: '12px 0', border: 'none', cursor: 'pointer', fontSize: 14,
            fontWeight: 500, transition: 'all 0.15s',
            background: tab === id ? '#0f172a' : 'transparent',
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
