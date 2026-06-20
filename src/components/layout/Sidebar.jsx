import { Activity, ChevronLeft, ChevronRight, Shield, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "../../constants/NavigationItems";
import { isLocalMode } from "@db";

export default function Sidebar({ tab, navigate, pinned, setPinned, children, user }) {
  return (
    <aside className={`hidden lg:flex flex-col alpha-glass border-r border-fit-line fixed inset-y-0 z-50 transition-all duration-500 ease-in-out ${pinned ? 'w-[280px]' : 'w-24'}`}>
      <div className={`p-8 flex flex-col h-full ${!pinned ? 'items-center' : ''}`}>
        <div className="flex items-center gap-4 mb-12 relative">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-fit-accent text-black flex items-center justify-center shadow-2xl shadow-fit-accent/40 transition-transform hover:scale-105">
            <Activity size={26} />
          </div>
          {pinned && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-xl font-black tracking-tight text-fit-ink">Fitness</h2>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-accent -mt-1">AlphaOS System</div>
            </div>
          )}
          
          <button 
            onClick={() => setPinned(!pinned)}
            className={`absolute top-2 w-8 h-8 rounded-full bg-fit-card border border-fit-line flex items-center justify-center text-fit-dim hover:text-fit-accent transition-all z-10 shadow-lg hover:scale-110 active:scale-90 ${pinned ? '-right-11' : '-right-4 translate-x-full'}`}
          >
            {pinned ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
        
        <nav className="space-y-2 flex-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            // Placeholder metrics for demonstration. 
            // In a real scenario, these would come from props/context.
            let metric = null;
            if (id === 'habits' && pinned) metric = <span className="ml-auto text-[10px] font-black bg-fit-accent/20 text-fit-accent px-2 py-0.5 rounded-md">80%</span>;
            if (id === 'journal' && pinned) metric = <span className="ml-auto w-2 h-2 rounded-full bg-fit-accent animate-pulse" />;

            return (
              <button key={id} onClick={() => navigate(id)} title={!pinned ? label : ''}
                className={`w-full flex items-center transition-all duration-300 ${pinned ? 'gap-4 px-5 py-4 rounded-2xl' : 'justify-center p-4 rounded-2xl'} ${tab === id ? 'bg-fit-accent text-black shadow-xl shadow-fit-accent/20 font-black scale-[1.02]' : 'text-fit-dim hover:bg-white/5 font-bold hover:translate-x-1'}`}>
                <Icon size={20} className={tab === id ? 'stroke-[3]' : ''} />
                {pinned && <span className="text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">{label}</span>}
                {metric}
              </button>
            )
          })}

          <button onClick={() => navigate('inbox')} title={!pinned ? 'Inbox' : ''}
            className={`w-full flex items-center transition-all duration-300 mt-4 ${pinned ? 'gap-4 px-5 py-4 rounded-2xl' : 'justify-center p-4 rounded-2xl'} ${tab === 'inbox' ? 'bg-fit-accent text-black shadow-xl shadow-fit-accent/20 font-black scale-[1.02]' : 'text-fit-dim hover:bg-white/5 font-bold hover:translate-x-1'}`}>
            <Sparkles size={20} className={tab === 'inbox' ? 'stroke-[3]' : ''} />
            {pinned && <span className="text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">Inbox</span>}
          </button>

          {(isLocalMode() || user?.email?.includes('alpha')) && (
            <button onClick={() => navigate('coach')} title={!pinned ? 'Coach' : ''}
              className={`w-full flex items-center transition-all duration-300 mt-2 ${pinned ? 'gap-4 px-5 py-4 rounded-2xl' : 'justify-center p-4 rounded-2xl'} ${tab === 'coach' ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 font-black scale-[1.02]' : 'text-fit-dim hover:bg-red-500/10 font-bold'}`}>
              <Shield size={20} className={tab === 'coach' ? 'stroke-[3]' : ''} />
              {pinned && <span className="text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">Coach</span>}
            </button>
          )}
        </nav>

        <div className={`mt-auto space-y-4 pt-6 border-t border-fit-line/30 ${!pinned ? 'w-full flex flex-col items-center overflow-hidden' : ''}`}>
          {pinned ? children : (
            <div className="w-10 h-10 rounded-full bg-fit-bg2 border border-fit-line" />
          )}
        </div>
      </div>
    </aside>
  );
}
