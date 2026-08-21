import { useState } from "react";
import { ChevronDown, Folder, FolderOpen } from "lucide-react";
import RoutineCard from "./RoutineCard.jsx";

// Strong-artige Ordner: Templates werden nach ihrem `category`-Feld
// gruppiert (statt einer einzigen flachen Liste). Kategorielose Templates
// landen in einem eigenen "Ohne Ordner"-Bereich statt zu verschwinden.
export default function RoutineFolder({ label, routines, defaultOpen, ...cardProps }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = open ? FolderOpen : Folder;

  return (
    <section className="mb-4">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between mb-3 px-1">
        <span className="flex items-center gap-2 text-sm font-bold text-fit-muted uppercase tracking-wide">
          <Icon size={15} className="text-fit-accent" />
          {label} ({routines.length})
        </span>
        <ChevronDown size={16} className={`text-fit-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {routines.map((r) => (
            <RoutineCard key={r.id} r={r} {...cardProps} />
          ))}
        </div>
      )}
    </section>
  );
}
