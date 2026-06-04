import { NAV_ITEMS } from "@shared/components/NavigationItems";

export default function MobileNav({ tab, navigate }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--card)]/90 backdrop-blur-xl border-t border-[var(--line)] px-2 flex items-center justify-around z-50">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => navigate(id)}
          className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all ${tab === id ? 'text-[var(--accent)]' : 'text-[var(--dim)] opacity-50'}`}>
          <Icon size={tab === id ? 20 : 18} className={tab === id ? 'stroke-[2.5]' : ''} />
          <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
          {tab === id && <div className="w-1 h-1 rounded-full bg-[var(--accent)] mt-0.5 shadow-[0_0_8px_var(--accent)]" />}
        </button>
      ))}
    </nav>
  );
}
