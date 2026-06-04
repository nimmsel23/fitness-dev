import { Edit, Check, Trash2, Sparkles } from "lucide-react";
import { ICON_OPTIONS, ICON_COMPONENTS_MAP } from "./utils";
import { isLocalMode } from "../../db.js";

export default function HabitItem({ 
  h, 
  isSelected, 
  isEditing, 
  editingIcon, 
  setEditingIcon, 
  setEditingHabitId, 
  onToggleSelection, 
  onToggleCheck, 
  onDelete, 
  onUpdateName,
  onFinishEditing,
  selectedDate 
}) {
  const isCoachHabit = h.source === 'coach';
  const canEdit = isLocalMode() || !isCoachHabit;

  return (
    <div 
         onClick={onToggleSelection}
         className={`group card p-4 flex items-center justify-between transition-all border-l-4 cursor-pointer
               ${h.isDoneForSelectedDate ? 'border-green bg-green/5' : 'border-[var(--dim)] bg-[var(--card)]'}
               ${isSelected ? 'border-[var(--accent)] bg-[var(--accent)]/10' : ''}`}>
      <div className="flex-1">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={h.name}
              onChange={(e) => onUpdateName(h.uuid, e.target.value)}
              onBlur={onFinishEditing}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.target.blur();
                }
              }}
              className="w-full bg-[var(--bg2)] border-[var(--line)] rounded-md px-2 py-1 text-sm font-bold focus:border-[var(--accent)] outline-none"
              autoFocus
              onClick={e => e.stopPropagation()}
            />
            <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(iconName => {
                    const IconComponent = ICON_COMPONENTS_MAP[iconName];
                    return (
                        <button type="button" key={iconName} onClick={(e) => { e.stopPropagation(); setEditingIcon(iconName); }}
                            className={`p-2 rounded-full border transition-colors ${editingIcon === iconName ? 'bg-[var(--accent)] border-[var(--accent)] text-black' : 'bg-[var(--bg2)] border-[var(--line)] text-[var(--dim)] hover:border-[var(--accent)]'}`}>
                            {IconComponent && <IconComponent size={20} />}
                        </button>
                    );
                })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {(() => {
              const IconComponent = ICON_COMPONENTS_MAP[h.icon || 'Activity'];
              return IconComponent && <IconComponent size={16} className="text-[var(--dim)]" />;
            })()}
            <div className="text-sm font-black text-[var(--ink)]">{h.name}</div>
            {isCoachHabit && (
              <span className="flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20 uppercase tracking-tighter">
                <Sparkles size={8} /> Coach
              </span>
            )}
          </div>
        )}
        <div className="text-xs font-bold opacity-30 uppercase tracking-widest mt-0.5 text-[var(--dim)]">
          {h.isDoneForSelectedDate ? 'Erledigt' : 'Noch offen'} für {selectedDate}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isEditing && canEdit && (
          <button onClick={(e) => { e.stopPropagation(); setEditingHabitId(h.uuid); }} className="p-2 text-[var(--dim)] hover:text-[var(--accent)] transition-all">
            <Edit size={16} />
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onToggleCheck(h); }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${h.isDoneForSelectedDate ? 'bg-green text-black' : 'bg-[var(--bg2)] border border-[var(--line)] text-[var(--dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}>
          <Check size={20} className={h.isDoneForSelectedDate ? 'stroke-[3]' : ''} />
        </button>
        {canEdit && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(h.uuid); }} className="opacity-0 group-hover:opacity-100 p-2 text-[var(--dim)] hover:text-[var(--red)] transition-all">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
