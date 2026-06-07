import { NAV_ITEMS } from "../../constants/NavigationItems";

export default function MobileNav({ tab, navigate }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-[var(--card)]/80 backdrop-blur-2xl border-t border-[var(--line)] px-4 flex items-center justify-around z-50 pb-4">
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = tab === id;
        return (
          <button key={id} onClick={() => navigate(id)}
            className={`flex flex-col items-center justify-center gap-1.5 min-w-[72px] h-16 rounded-2xl transition-all duration-300 active:scale-90 ${isActive ? 'text-[var(--accent)] bg-[var(--accent)]/5' : 'text-[var(--dim)] opacity-40 hover:opacity-100'}`}>
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 scale-110' : ''}`}>
              <Icon size={isActive ? 22 : 20} className={isActive ? 'stroke-[3]' : 'stroke-[2]'} />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-all ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
