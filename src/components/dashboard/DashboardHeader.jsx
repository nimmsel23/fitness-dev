import { Download, LayoutGrid, RotateCcw, Check } from "lucide-react";

export default function DashboardHeader({ onExport, isEditMode, onToggleEdit, onResetLayout }) {
  return (
    <div className="mb-16 flex items-end justify-between px-2 gap-8 flex-wrap">
      <div className="animate-in fade-in slide-in-from-left-8 duration-700">
        <h1 className="text-5xl lg:text-6xl font-black text-ink mb-3 tracking-tight">Willkommen zurück</h1>
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 bg-accent rounded-full" />
          <p className="text-[11px] font-black opacity-30 uppercase tracking-[0.4em]">Dein Fitness Ecosystem</p>
        </div>
      </div>
      <div className="flex gap-4 flex-wrap animate-in fade-in slide-in-from-right-8 duration-700">
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
