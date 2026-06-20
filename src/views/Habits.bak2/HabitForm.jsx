import { Plus } from "lucide-react";
import { ICON_OPTIONS, ICON_COMPONENTS_MAP } from "./utils";

export default function HabitForm({ newHabit, setNewHabit, selectedIcon, setSelectedIcon, onAdd, saving }) {
  return (
    <form onSubmit={onAdd} className="card p-6 shadow-xl border-[var(--accent)]/10 bg-[var(--card)] border-[var(--line)]">
      <div className="label-caps mb-4 flex items-center gap-2 text-[var(--accent)]">
        <Plus size={14} className="text-[var(--accent)]" />
        Neuer Habit
      </div>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)}
          placeholder="z.B. Früh aufstehen" 
          className="flex-1 bg-[var(--bg2)] border-[var(--line)] rounded-xl px-4 py-3 text-sm font-bold focus:border-[var(--accent)] outline-none"
        />
        <button disabled={saving || !newHabit.trim()} className="btn bg-[var(--accent)] text-black !p-3">
          <Plus size={20} />
        </button>
      </div>
      <div className="mb-4">
          <div className="label-caps !mb-2 text-[var(--dim)]">Icon wählen</div>
          <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(iconName => {
                  const IconComponent = ICON_COMPONENTS_MAP[iconName];
                  return (
                      <button type="button" key={iconName} onClick={() => setSelectedIcon(iconName)}
                          className={`p-2 rounded-full border transition-colors ${selectedIcon === iconName ? 'bg-[var(--accent)] border-[var(--accent)] text-black' : 'bg-[var(--bg2)] border-[var(--line)] text-[var(--dim)] hover:border-[var(--accent)]'}`}>
                          {IconComponent && <IconComponent size={20} />}
                      </button>
                  );
              })}
          </div>
      </div>
    </form>
  );
}
