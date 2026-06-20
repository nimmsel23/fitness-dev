import { Edit, Check, Trash2, Sparkles } from "lucide-react";
import { ICON_OPTIONS, ICON_COMPONENTS_MAP } from "./utils";
import { isLocalMode } from "@db";

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
         className={`group card p-3 sm:p-4 flex items-center justify-between transition-all border-l-4 cursor-pointer
               ${h.isDoneForSelectedDate ? 'border-fit-green bg-fit-green/5' : 'border-fit-dim bg-fit-card'}
               ${isSelected ? 'border-fit-accent bg-fit-accent/10' : ''}`}>
      <div className="flex-1 min-w-0 pr-2">
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
              className="w-full bg-fit-bg2 border-fit-line rounded-md px-2 py-1 text-sm font-bold focus:border-fit-accent outline-none"
              autoFocus
              onClick={e => e.stopPropagation()}
            />
            <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(iconName => {
                    const IconComponent = ICON_COMPONENTS_MAP[iconName];
                    return (
                        <button type="button" key={iconName} onClick={(e) => { e.stopPropagation(); setEditingIcon(iconName); }}
                            className={`p-2 rounded-full border transition-colors ${editingIcon === iconName ? 'bg-fit-accent border-fit-accent text-black' : 'bg-fit-bg2 border-fit-line text-fit-dim hover:border-fit-accent'}`}>
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
              return IconComponent && <IconComponent size={16} className="text-fit-dim shrink-0" />;
            })()}
            <div className="text-sm font-black text-fit-ink truncate">{h.name}</div>
            {isCoachHabit && (
              <span className="flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 bg-fit-accent/10 text-fit-accent rounded-full border border-fit-accent/20 uppercase tracking-tighter shrink-0">
                <Sparkles size={8} /> Coach
              </span>
            )}
          </div>
        )}
        <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-0.5 text-fit-dim truncate">
          {h.isDoneForSelectedDate ? 'Erledigt' : 'Noch offen'} für {selectedDate}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {!isEditing && canEdit && (
          <button onClick={(e) => { e.stopPropagation(); setEditingHabitId(h.uuid); }} className="p-2 text-fit-dim hover:text-fit-accent transition-all">
            <Edit size={16} />
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onToggleCheck(h); }}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all ${h.isDoneForSelectedDate ? 'bg-fit-green text-black' : 'bg-fit-bg2 border border-fit-line text-fit-dim hover:border-fit-accent hover:text-fit-accent'}`}>
          <Check size={20} className={h.isDoneForSelectedDate ? 'stroke-[3]' : ''} />
        </button>
        {canEdit && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(h.uuid); }} className="opacity-0 group-hover:opacity-100 hidden sm:block p-2 text-fit-dim hover:text-fit-red transition-all">
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
