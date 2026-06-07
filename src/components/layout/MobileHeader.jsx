import { Activity, Settings2, User } from "lucide-react";
import { NAV_ITEMS } from "../../constants/NavigationItems";

export default function MobileHeader({ navigate, tab }) {
  return (
    <header className="lg:hidden h-24 flex flex-col bg-[var(--card)]/80 backdrop-blur-xl border-b border-[var(--line)] sticky top-0 z-40 overflow-hidden">
      <div className="flex-1 flex items-center justify-between px-6 pt-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight text-[var(--ink)]">
            <Activity size={22} className="text-[var(--accent)]" />
            Fitness
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)] ml-8 -mt-1 opacity-80">AlphaOS</div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('settings')} className="w-11 h-11 rounded-2xl bg-[var(--bg2)] border border-[var(--line)] flex items-center justify-center active:scale-90 transition-all">
             <Settings2 size={20} className="text-[var(--dim)]" />
          </button>
        </div>
      </div>

      {/* Subtle Tab Indicator Row */}
      <div className="h-8 flex items-center justify-center gap-4 pb-3 overflow-x-auto hide-scrollbar px-6">
        {NAV_ITEMS.map((item) => {
          const isActive = tab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => navigate(item.id)}
              className={`h-1.5 rounded-full transition-all duration-500 shrink-0 ${isActive ? 'w-8 bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]' : 'w-2 bg-[var(--dim)] opacity-20 hover:opacity-40'}`}
            />
          );
        })}
      </div>
    </header>
  );
}
