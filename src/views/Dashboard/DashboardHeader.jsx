import { Download, LayoutGrid, RotateCcw, Check } from "lucide-react";

export default function DashboardHeader({ onExport, isEditMode, onToggleEdit, onResetLayout }) {
  return (
    <div className="mb-8 flex items-center justify-end px-2 gap-4 flex-wrap">
      <div className="flex gap-4 flex-wrap">
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
