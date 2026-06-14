import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { NAV_ITEMS } from "../../constants/NavigationItems";

export default function Sidebar({ tab, navigate, pinned, setPinned, children }) {
  return (
    <aside className={`hidden lg:flex flex-col alpha-glass border-r border-[var(--line)] fixed inset-y-0 z-50 transition-all duration-500 ease-in-out ${pinned ? 'w-[280px]' : 'w-24'}`}>
      <div className={`p-8 flex flex-col h-full ${!pinned ? 'items-center' : ''}`}>
        <div className="flex items-center gap-4 mb-12 relative">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-[var(--accent)] text-black flex items-center justify-center shadow-2xl shadow-[var(--accent)]/40 transition-transform hover:scale-105">
            <Activity size={26} />
          </div>
          {pinned && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-xl font-black tracking-tight text-[var(--ink)]">Fitness</h2>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] -mt-1">AlphaOS System</div>
            </div>
          )}
          
          <button 
            onClick={() => setPinned(!pinned)}
            className={`absolute -right-11 top-3 w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--line)] flex items-center justify-center text-[var(--dim)] hover:text-[var(--accent)] transition-all z-10 shadow-lg hover:scale-110 active:scale-90 ${!pinned ? 'right-auto' : ''}`}
          >
            {pinned ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        
        <nav className="space-y-2 flex-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => navigate(id)} title={!pinned ? label : ''}
              className={`w-full flex items-center transition-all duration-300 ${pinned ? 'gap-4 px-5 py-4 rounded-2xl' : 'justify-center p-4 rounded-2xl'} ${tab === id ? 'bg-[var(--accent)] text-black shadow-xl shadow-[var(--accent)]/20 font-black scale-[1.02]' : 'text-[var(--dim)] hover:bg-white/5 font-bold hover:translate-x-1'}`}>
              <Icon size={20} className={tab === id ? 'stroke-[3]' : ''} />
              {pinned && <span className="text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">{label}</span>}
            </button>
          ))}
        </nav>

        <div className={`mt-auto space-y-4 pt-6 border-t border-[var(--line)]/30 ${!pinned ? 'w-full flex flex-col items-center overflow-hidden' : ''}`}>
          {pinned ? children : (
            <div className="w-10 h-10 rounded-full bg-[var(--bg2)] border border-[var(--line)]" />
          )}
        </div>
      </div>
    </aside>
  );
}
