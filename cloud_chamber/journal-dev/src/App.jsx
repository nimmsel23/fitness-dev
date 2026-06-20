import { useState, useEffect } from 'react'
import { BookOpen, CheckSquare, LogIn, Loader } from 'lucide-react'
import { watchAuth, signIn, isLocalMode } from '@db'
import Journal from './views/Journal/index.jsx'
import Habits from './views/Habits/index.jsx'

const TABS = [
  { id: 'journal', label: 'Journal', Icon: BookOpen,    View: Journal },
  { id: 'habits',  label: 'Habits',  Icon: CheckSquare, View: Habits  },
]

export default function App() {
  const [tab, setTab]         = useState('journal')
  const [user, setUser]       = useState(undefined) // undefined = loading
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    if (isLocalMode()) { setUser({ displayName: 'Local' }); return }
    return watchAuth(u => setUser(u ?? null))
  }, [])

  const Active = TABS.find(t => t.id === tab)?.View

  if (user === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100dvh', background:'#0a0a0f' }}>
      <Loader size={24} style={{ color:'#475569' }} />
    </div>
  )

  if (!user) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100dvh', background:'#0a0a0f', color:'#e2e8f0', gap:16 }}>
      <div style={{ fontSize:32 }}>📓</div>
      <div style={{ fontSize:16, fontWeight:600 }}>Journal</div>
      <div style={{ fontSize:13, color:'#64748b' }}>Bitte anmelden um fortzufahren</div>
      <button
        onClick={async () => { setSigning(true); try { await signIn() } finally { setSigning(false) } }}
        disabled={signing}
        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, border:'1px solid #334155', background:'#0f172a', color:'#e2e8f0', cursor:'pointer', fontSize:14 }}
      >
        <LogIn size={16} />{signing ? 'Anmelden…' : 'Mit Google anmelden'}
      </button>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'#0a0a0f', color:'#e2e8f0', fontFamily:'system-ui, sans-serif' }}>
      <nav style={{ display:'flex', borderBottom:'1px solid #1e293b', flexShrink:0 }}>
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1, display:'flex', alignItems:'center', justifyContent:'center',
            gap:6, padding:'12px 0', border:'none', cursor:'pointer', fontSize:14,
            fontWeight:500, transition:'all 0.15s',
            background: tab === id ? '#0f172a' : 'transparent',
            color: tab === id ? '#e2e8f0' : '#475569',
            borderBottom: tab === id ? '2px solid #3b82f6' : '2px solid transparent',
          }}>
            <Icon size={16} />{label}
          </button>
        ))}
      </nav>
      <div style={{ flex:1, overflowY:'auto' }}>
        {Active && <Active />}
      </div>
    </div>
  )
}
