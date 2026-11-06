import { useState, useEffect } from 'react'
import { GraduationCap, LogIn, Loader } from 'lucide-react'
import { watchAuth, signIn, isLocalMode } from '@db'
import Learn from '@learn/views/Learn/index.jsx'

export default function App() {
  const [user, setUser]       = useState(undefined)
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    if (isLocalMode()) { setUser({ displayName: 'Local' }); return }
    return watchAuth(u => setUser(u ?? null))
  }, [])

  if (user === undefined) return (
    <div className="flex items-center justify-center h-[100dvh] bg-fit-bg">
      <Loader size={24} className="text-fit-dim animate-spin" />
    </div>
  )

  if (!user) return (
    <div className="flex flex-col items-center justify-center gap-4 h-[100dvh] bg-fit-bg text-fit-ink">
      <GraduationCap size={32} className="text-fit-accent" />
      <div className="text-base font-semibold">Learn</div>
      <div className="text-[13px] text-fit-dim">Bitte anmelden um fortzufahren</div>
      <button
        onClick={async () => { setSigning(true); try { await signIn() } finally { setSigning(false) } }}
        disabled={signing}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-fit-line bg-fit-card text-fit-ink text-sm cursor-pointer transition-colors hover:border-fit-accent/40 disabled:opacity-60 disabled:cursor-default"
      >
        <LogIn size={16} />{signing ? 'Anmelden…' : 'Mit Google anmelden'}
      </button>
    </div>
  )

  return (
    <div className="min-h-[100dvh] bg-fit-bg text-fit-ink font-sans pt-[var(--safe-top)]">
      <Learn />
    </div>
  )
}
