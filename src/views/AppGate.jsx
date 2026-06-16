import { NAV_ITEMS } from "../constants/NavigationItems.js";
import { Activity } from "lucide-react";
import { localToday } from "@utils";

export default function AppGate({ navigate }) {
  // We include 'dash' (Heute) in the Gate, but filter out 'settings' to place it separately or handle it via a smaller button.
  // Actually, let's include all main NAV_ITEMS.
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[var(--bg)] to-[var(--bg2)] text-[var(--ink)]">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-4 mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
        <div className="w-16 h-16 rounded-3xl bg-[var(--accent)] flex items-center justify-center shadow-2xl shadow-[var(--accent)]/30">
          <Activity size={32} className="text-black stroke-[3]" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">AlphaOS</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)] mt-1">Fitness Hub</p>
        </div>
      </div>

      {/* Navigation Grid */}
      <nav className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-700 delay-150">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            className="relative group p-6 rounded-[32px] bg-[var(--card)] border border-[var(--line)]/50 active:scale-95 transition-all overflow-hidden flex flex-col items-center gap-4 shadow-sm hover:shadow-2xl hover:shadow-[var(--accent)]/10 hover:border-[var(--accent)]/40"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-14 h-14 rounded-[20px] bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] transition-all duration-300 shadow-inner z-10">
              <Icon size={24} className="text-[var(--dim)] group-hover:text-black transition-colors" />
            </div>
            
            <div className="flex flex-col items-center gap-1 z-10">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--ink)] transition-colors">
                {label}
              </span>
              <div className="h-0.5 w-0 group-hover:w-8 bg-[var(--accent)] transition-all duration-500 rounded-full" />
            </div>
          </button>
        ))}
      </nav>

      {/* Optional: Date / Subtitle footer */}
      <div className="mt-16 text-[9px] font-black uppercase tracking-widest text-[var(--dim)] opacity-50 animate-in fade-in duration-1000 delay-300">
        {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}
