import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { NAV_ITEMS } from "../../constants/NavigationItems";

export default function Sidebar({ tab, navigate, pinned, setPinned, children }) {
  return (
    <aside className={`hidden lg:flex flex-col bg-[var(--card)] border-r border-[var(--line)] fixed inset-y-0 z-50 transition-all duration-300 ${pinned ? 'w-[280px]' : 'w-20'}`}>
      <div className={`p-6 flex flex-col h-full ${!pinned ? 'items-center' : ''}`}>
        <div className="flex items-center gap-3 mb-10 relative">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-[var(--accent)] text-black flex items-center justify-center shadow-lg shadow-[var(--accent)]/30">
            <Activity size={22} />
          </div>
          {pinned && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <h2 className="text-lg font-black tracking-tight text-[var(--ink)]">Fitness</h2>
              <div className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] -mt-1">AlphaOS System</div>
            </div>
          )}
          
          <button 
            onClick={() => setPinned(!pinned)}
            className={`absolute -right-3 top-2 w-6 h-6 rounded-full bg-[var(--bg2)] border border-[var(--line)] flex items-center justify-center text-[var(--dim)] hover:text-[var(--accent)] transition-all z-10 ${!pinned ? 'right-auto' : ''}`}
          >
            {pinned ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
        
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => navigate(id)} title={!pinned ? label : ''}
              className={`w-full flex items-center transition-all ${pinned ? 'gap-4 px-4 py-3 rounded-2xl' : 'justify-center p-3 rounded-xl'} ${tab === id ? 'bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 font-black' : 'text-[var(--dim)] hover:bg-white/5 font-bold'}`}>
              <Icon size={18} className={tab === id ? 'stroke-[2.5]' : ''} />
              {pinned && <span className="text-sm truncate animate-in fade-in slide-in-from-left-2 duration-300">{label}</span>}
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
