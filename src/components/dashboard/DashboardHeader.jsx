import { Download, LayoutGrid, RotateCcw, Check } from "lucide-react";

export default function DashboardHeader({ onExport, isEditMode, onToggleEdit, onResetLayout }) {
  return (
    <div className="mb-12 flex items-end justify-between px-2 gap-4 flex-wrap">
      <div>
        <h1 className="text-4xl font-black text-ink mb-2">Willkommen zurück</h1>
        <p className="text-xs font-bold opacity-40 uppercase tracking-[0.25em]">Dein Fitness Dashboard</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        {isEditMode && (
          <button onClick={onResetLayout} className="btn btn-secondary py-3 px-5 text-[11px] font-black uppercase tracking-widest" title="Layout zurücksetzen">
            <RotateCcw size={14} /> Reset
          </button>
        )}
        <button
          onClick={onToggleEdit}
          className={`btn py-3 px-5 text-[11px] font-black uppercase tracking-widest ${isEditMode ? 'btn-primary' : 'btn-secondary'}`}
          title="Widgets neu anordnen"
        >
          {isEditMode ? <><Check size={14} /> Fertig</> : <><LayoutGrid size={14} /> Anordnen</>}
        </button>
        <button onClick={() => onExport(30)} className="btn btn-secondary py-3 px-5 text-[11px] font-black uppercase tracking-widest">
          <Download size={14} /> Export
        </button>
      </div>
    </div>
  );
}
