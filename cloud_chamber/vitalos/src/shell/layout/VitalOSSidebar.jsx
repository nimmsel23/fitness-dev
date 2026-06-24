import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VOS_APPS } from '../VitalOSApps.js'

export default function VitalOSSidebar({ app, navigate, pinned, setPinned }) {
  return (
    <aside className={`hidden lg:flex flex-col alpha-glass border-r border-fit-line fixed inset-y-0 z-50 transition-all duration-500 ease-in-out ${pinned ? 'w-[220px]' : 'w-24'}`}>
      <div className={`p-8 flex flex-col h-full ${!pinned ? 'items-center' : ''}`}>

        {/* Logo */}
        <div className="flex items-center gap-4 mb-12 relative">
          <button
            onClick={() => navigate(null)}
            className="w-12 h-12 shrink-0 rounded-2xl bg-fit-accent text-black flex items-center justify-center shadow-2xl shadow-fit-accent/40 transition-transform hover:scale-105 font-black text-lg"
          >
            V
          </button>
          {pinned && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-xl font-black tracking-tight text-fit-ink">VitalOS</h2>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-accent -mt-1">VOS</div>
            </div>
          )}
          <button
            onClick={() => setPinned(!pinned)}
            className={`absolute top-2 w-8 h-8 rounded-full bg-fit-card border border-fit-line flex items-center justify-center text-fit-dim hover:text-fit-accent transition-all z-10 shadow-lg hover:scale-110 active:scale-90 ${pinned ? '-right-11' : '-right-4 translate-x-full'}`}
          >
            {pinned ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* App Nav */}
        <nav className="space-y-2 flex-1">
          {VOS_APPS.map(({ id, label, Icon, color }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              title={!pinned ? label : ''}
              style={app === id ? { background: color, boxShadow: `0 8px 24px ${color}33` } : {}}
              className={`w-full flex items-center transition-all duration-300 ${pinned ? 'gap-4 px-5 py-4 rounded-2xl' : 'justify-center p-4 rounded-2xl'} ${app === id ? 'text-black font-black scale-[1.02]' : 'text-fit-dim hover:bg-white/5 font-bold hover:translate-x-1'}`}
            >
              <Icon size={20} className={app === id ? 'stroke-[3]' : ''} />
              {pinned && (
                <span className="text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">
                  {label}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
