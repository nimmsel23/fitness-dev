import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import RoutineCard from "./RoutineCard.jsx";

export default function CalisthenicsSkillsSection({ routines, loading, onEdit, onStart, onRename, onDelete, onQuickComplete, completingId }) {
  const [open, setOpen] = useState(false);
  const skillRoutines = routines.filter((r) => r.category === "calisthenics-skill");
  if (!loading && skillRoutines.length === 0) return null;

  return (
    <section className="mb-8">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-3 px-1"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-fit-muted uppercase tracking-wide">
          <Sparkles size={15} className="text-fit-accent" />
          Calisthenics Skills {!loading && `(${skillRoutines.length})`}
        </span>
        <ChevronDown size={16} className={`text-fit-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {skillRoutines.map((r) => (
            <RoutineCard key={r.id} r={r} onEdit={onEdit} onStart={onStart} onRename={onRename} onDelete={onDelete} onQuickComplete={onQuickComplete} completingId={completingId} />
          ))}
        </div>
      )}
    </section>
  );
}
