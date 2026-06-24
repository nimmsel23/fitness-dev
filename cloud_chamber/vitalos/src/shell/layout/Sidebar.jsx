import { ChevronLeft, ChevronRight, Shield, Zap } from "lucide-react";
import { NAV_ITEMS } from '@shell/NavigationItems';
import { isLocalMode } from "@db";

export default function Sidebar({ tab, navigate, pinned, setPinned, children, user, subNav, subTab, onSubTab }) {
  const inSubApp = !!subNav

  return (
    <aside className={`hidden lg:flex flex-col alpha-glass border-r border-fit-line fixed inset-y-0 z-50 transition-all duration-500 ease-in-out ${pinned ? 'w-[280px]' : 'w-24'}`}>
      <div className={`p-6 flex flex-col h-full ${!pinned ? 'items-center' : ''}`}>

        {/* Logo */}
        <div className="flex items-center gap-4 mb-8 relative">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-fit-accent text-black flex items-center justify-center shadow-xl shadow-fit-accent/30 transition-transform hover:scale-105">
            <Zap size={20} />
          </div>
          {pinned && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-lg font-black tracking-tight text-fit-ink">VitalOS</h2>
            </div>
          )}
          <button
            onClick={() => setPinned(!pinned)}
            className={`absolute top-1 w-7 h-7 rounded-full bg-fit-card border border-fit-line flex items-center justify-center text-fit-dim hover:text-fit-accent transition-all z-10 shadow-lg hover:scale-110 active:scale-90 ${pinned ? '-right-10' : '-right-3 translate-x-full'}`}
          >
            {pinned ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Haupt-Nav — fett im Shell-Modus, schlank im Sub-App-Modus */}
        <nav className={`${inSubApp ? 'flex gap-1 flex-wrap justify-center mb-4 pb-4 border-b border-fit-line/30' : 'space-y-1 flex-1'}`}>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = tab === id
            if (inSubApp) {
              // Kompakt: nur Icon + Tooltip
              return (
                <button key={id} onClick={() => navigate(id)} title={label}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-fit-accent text-black shadow-lg shadow-fit-accent/20' : 'text-fit-dim hover:bg-white/5'}`}>
                  <Icon size={16} className={isActive ? 'stroke-[3]' : ''} />
                </button>
              )
            }
            // Normal: fett
            return (
              <button key={id} onClick={() => navigate(id)} title={!pinned ? label : ''}
                className={`w-full flex items-center transition-all duration-300 ${pinned ? 'gap-4 px-5 py-4 rounded-2xl' : 'justify-center p-4 rounded-2xl'} ${isActive ? 'bg-fit-accent text-black shadow-xl shadow-fit-accent/20 font-black scale-[1.02]' : 'text-fit-dim hover:bg-white/5 font-bold hover:translate-x-1'}`}>
                <Icon size={20} className={isActive ? 'stroke-[3]' : ''} />
                {pinned && <span className="text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">{label}</span>}
              </button>
            )
          })}

          {!inSubApp && (isLocalMode() || user?.email?.includes('alpha') || user?.uid === '59ole36uNpNwml5H6VDYCXyCME92') && (
            <button onClick={() => navigate('coach')} title={!pinned ? 'Coach' : ''}
              className={`w-full flex items-center transition-all duration-300 mt-2 ${pinned ? 'gap-4 px-5 py-4 rounded-2xl' : 'justify-center p-4 rounded-2xl'} ${tab === 'coach' ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 font-black scale-[1.02]' : 'text-fit-dim hover:bg-red-500/10 font-bold'}`}>
              <Shield size={20} className={tab === 'coach' ? 'stroke-[3]' : ''} />
              {pinned && <span className="text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">Coach</span>}
            </button>
          )}
        </nav>

        {/* Sub-Nav — fette primäre Nav wenn Sub-App aktiv */}
        {inSubApp && (
          <nav className="flex-1 space-y-1.5">
            {subNav.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => onSubTab?.(id)}
                className={`w-full flex items-center transition-all duration-200 ${pinned ? 'gap-4 px-5 py-4 rounded-2xl' : 'justify-center p-4 rounded-2xl'} ${subTab === id ? 'bg-fit-accent text-black shadow-xl shadow-fit-accent/20 font-black scale-[1.02]' : 'text-fit-dim hover:bg-white/5 font-bold hover:translate-x-1'}`}>
                <Icon size={20} className={subTab === id ? 'stroke-[3]' : ''} />
                {pinned && <span className="text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">{label}</span>}
              </button>
            ))}

            {(isLocalMode() || user?.email?.includes('alpha') || user?.uid === '59ole36uNpNwml5H6VDYCXyCME92') && (
              <button onClick={() => navigate('coach')} title={!pinned ? 'Coach' : ''}
                className={`w-full flex items-center transition-all duration-300 mt-2 ${pinned ? 'gap-4 px-5 py-4 rounded-2xl' : 'justify-center p-4 rounded-2xl'} ${tab === 'coach' ? 'bg-red-500 text-white shadow-xl shadow-red-500/20 font-black scale-[1.02]' : 'text-fit-dim hover:bg-red-500/10 font-bold'}`}>
                <Shield size={20} />
                {pinned && <span className="text-sm truncate animate-in fade-in slide-in-from-left-4 duration-500">Coach</span>}
              </button>
            )}
          </nav>
        )}

        {/* Footer */}
        <div className={`mt-auto space-y-3 pt-5 border-t border-fit-line/30 ${!pinned ? 'w-full flex flex-col items-center overflow-hidden' : ''}`}>
          {pinned ? children : (
            <div className="w-9 h-9 rounded-full bg-fit-bg2 border border-fit-line" />
          )}
        </div>
      </div>
    </aside>
  );
}
