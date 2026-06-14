import { Activity, Settings2 } from "lucide-react";
import { NAV_ITEMS } from "../../constants/NavigationItems";

export default function MobileHeader({ navigate, tab }) {
  const current = NAV_ITEMS.find(i => i.id === tab);
  const Icon = current?.Icon;

  return (
    <header className="lg:hidden h-[60px] flex items-center justify-between px-5 bg-[var(--bg)]/95 backdrop-blur-xl border-b border-[var(--line)]/30 sticky top-0 z-40">
      <div className="w-9 h-9 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/25 shrink-0">
        <Activity size={17} className="text-black stroke-[3]" />
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        {Icon && <Icon size={13} className="text-[var(--accent)] stroke-[2.5]" />}
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--ink)]">
          {current?.label ?? 'Fitness'}
        </span>
      </div>

      <button
        onClick={() => navigate('settings')}
        className="w-9 h-9 rounded-xl bg-[var(--bg2)] border border-[var(--line)]/50 flex items-center justify-center active:scale-90 transition-all shrink-0"
      >
        <Settings2 size={17} className="text-[var(--dim)]" />
      </button>
    </header>
  );
}
