import { Activity, Settings2 } from "lucide-react";

export default function MobileHeader({ navigate }) {
  return (
    <header className="lg:hidden h-16 flex items-center justify-between px-6 bg-[var(--card)] border-b border-[var(--line)] sticky top-0 z-40">
      <div className="flex items-center gap-2 font-black text-lg">
        <Activity size={20} className="text-[var(--accent)]" />
        Fitness
      </div>
      <button onClick={() => navigate('settings')} className="p-2 rounded-xl bg-[var(--bg2)]">
         <Settings2 size={18} className="text-[var(--dim)]" />
      </button>
    </header>
  );
}
