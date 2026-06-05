import { Download } from "lucide-react";

export default function DashboardHeader({ onExport }) {
  return (
    <div className="mb-12 flex items-end justify-between px-2">
      <div>
        <h1 className="text-4xl font-black text-ink mb-2">Willkommen zurück</h1>
        <p className="text-xs font-bold opacity-40 uppercase tracking-[0.25em]">Dein Fitness Dashboard</p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => onExport(30)} className="btn btn-secondary py-3 px-6 text-[11px] font-black uppercase tracking-widest">
          <Download size={16} /> Export CSV
        </button>
      </div>
    </div>
  );
}
