import { Plus } from "lucide-react";
import { ICON_OPTIONS, ICON_COMPONENTS_MAP } from "./utils";

export default function HabitForm({ newHabit, setNewHabit, selectedIcon, setSelectedIcon, onAdd, saving }) {
  return (
    <form onSubmit={onAdd} className="card p-6 shadow-xl border-fit-accent/10 bg-fit-card border-fit-line">
      <div className="label-caps mb-4 flex items-center gap-2 text-fit-accent">
        <Plus size={14} className="text-fit-accent" />
        Neuer Habit
      </div>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)}
          placeholder="z.B. Früh aufstehen" 
          className="flex-1 bg-fit-bg2 border-fit-line rounded-xl px-4 py-3 text-sm font-bold focus:border-fit-accent outline-none"
        />
        <button disabled={saving || !newHabit.trim()} className="btn bg-fit-accent text-black !p-3">
          <Plus size={20} />
        </button>
      </div>
      <div className="mb-4">
          <div className="label-caps !mb-2 text-fit-dim">Icon wählen</div>
          <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(iconName => {
                  const IconComponent = ICON_COMPONENTS_MAP[iconName];
                  return (
                      <button type="button" key={iconName} onClick={() => setSelectedIcon(iconName)}
                          className={`p-2 rounded-full border transition-colors ${selectedIcon === iconName ? 'bg-fit-accent border-fit-accent text-black' : 'bg-fit-bg2 border-fit-line text-fit-dim hover:border-fit-accent'}`}>
                          {IconComponent && <IconComponent size={20} />}
                      </button>
                  );
              })}
          </div>
      </div>
    </form>
  );
}
