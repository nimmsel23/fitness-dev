import { Activity } from "lucide-react";
import { NAV_ITEMS } from "../../constants/NavigationItems";

export default function Sidebar({ tab, navigate, children }) {
  return (
    <aside className="hidden lg:flex flex-col w-[280px] bg-[var(--card)] border-r border-[var(--line)] fixed inset-y-0 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-black flex items-center justify-center shadow-lg shadow-[var(--accent)]/30">
            <Activity size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-[var(--ink)]">Fitness</h2>
            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] -mt-1">AlphaOS System</div>
          </div>
        </div>
        
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => navigate(id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${tab === id ? 'bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 font-black' : 'text-[var(--dim)] hover:bg-white/5 font-bold'}`}>
              <Icon size={18} className={tab === id ? 'stroke-[2.5]' : ''} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-6 space-y-4">
        {children}
      </div>
    </aside>
  );
}
