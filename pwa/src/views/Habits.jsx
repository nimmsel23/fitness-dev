import { useState, useEffect, useMemo } from "react";
import { Check, Plus, Trash2, Calendar, Target, TrendingUp, Activity, Star, CalendarDays, Edit, X, Footprints, Apple, BookOpen, Coffee, Droplet, Dumbbell, Feather, Heart, Home, Moon, Sunrise, Sun, Zap } from "lucide-react";
import { getHabits, recordHabit, unrecordHabit, addHabit, deleteHabit, updateHabit, getHabitRecordsForDate } from "../db.js";
import { localToday } from "../lib/utils.js";

const ICON_OPTIONS = [
  "Activity", "Footprints", "Apple", "BookOpen", "Coffee", "Droplet", "Dumbbell", "Feather", "Heart", "Home", "Moon", "Sunrise", "Sun", "Zap"
];

const ICON_COMPONENTS_MAP = {
  Activity, Footprints, Apple, BookOpen, Coffee, Droplet, Dumbbell, Feather, Heart, Home, Moon, Sunrise, Sun, Zap
};

function getRollingDays(count) {
  const dates = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function getDailyHabitStatus(date, habits) {
  if (habits.length === 0) return 'none'; // No habits defined

  const habitsForDate = habits.filter(h => !h.deleted);
  if (habitsForDate.length === 0) return 'none'; // No active habits

  const doneCount = habitsForDate.filter(h => 
    h.records?.some(r => r.date === date && r.completion === 'DONE')
  ).length;

  if (doneCount === habitsForDate.length) {
    return 'done_all';
  } else if (doneCount > 0) {
    return 'done_some';
  } else {
    // Only return 'missed_all' if there are active habits for the day but none are done
    return 'missed_all';
  }
}

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState("");
  const [selectedIcon, setSelectedIcon] = useState('Activity'); // NEW: State for selected icon in new habit form
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(localToday());
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingIcon, setEditingIcon] = useState(null); // NEW: State for icon during inline editing
  const [selectedHabitId, setSelectedHabitId] = useState(null); // Replaced expandedHabitId with selectedHabitId
  const rollingDates = useMemo(() => getRollingDays(28), []);

  async function load() {
    setLoading(true);
    try {
      const allHabits = await getHabits(); // Fetches habit metadata along with 28 days of records for each
      const completedHabitIdsForSelectedDate = await getHabitRecordsForDate(selectedDate); // Get IDs of habits completed on selectedDate

      const habitsWithStatus = allHabits
        .filter(h => !h.deleted)
        .map(h => ({
          ...h,
          isDoneForSelectedDate: completedHabitIdsForSelectedDate.includes(h.uuid) // Set status based on selectedDate records
        }));
      setHabits(habitsWithStatus);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [selectedDate]); // Reload habits when selectedDate changes

  useEffect(() => {
    if (editingHabitId) {
      const habitToEdit = habits.find(h => h.uuid === editingHabitId);
      setEditingIcon(habitToEdit?.icon || 'Activity');
    } else {
      setEditingIcon(null);
    }
  }, [editingHabitId, habits]);

  async function toggleCheck(h) {
    if (h.isDoneForSelectedDate) {
      await unrecordHabit(h.uuid, selectedDate);
    } else {
      await recordHabit(h.uuid, selectedDate);
    }
    load();
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setSaving(true);
    try {
      await addHabit(newHabit.trim(), selectedIcon);
      setNewHabit("");
      setSelectedIcon('Activity'); // Reset selected icon to default
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(uuid) {
    if (!confirm("Habit wirklich löschen?")) return;
    await deleteHabit(uuid);
    load();
  }

  const overallConsistency = habits.length === 0 ? 0 : habits.reduce((totalConsistency, h) => {
    const habitDoneCount = (h.records || []).filter(r => rollingDates.includes(r.date) && r.completion === 'DONE').length;
    return totalConsistency + (habitDoneCount / rollingDates.length);
  }, 0) / habits.length;

  const todayCompletionPercentage = habits.length === 0 ? 0 :
    (habits.filter(h => h.isDoneForSelectedDate).length / habits.length) * 100;

  function getMotivationalMessage(percentage) {
    if (percentage === 100) {
      return "Hervorragend! Alle Habits erledigt! Weiter so!";
    } else if (percentage >= 50) {
      return `Du hast ${Math.round(percentage)}% deiner Habits erledigt. Fast geschafft! Bleib dran!`;
    } else if (percentage > 0) {
      return `Du hast ${Math.round(percentage)}% deiner Habits erledigt. Guter Start! Aber da geht noch mehr!`;
    } else {
      return "Der Tag hat gerade erst begonnen! Fang jetzt an und hol dir die ersten Checks!";
    }
  }

  return (
    <div className="pb-20 px-2 sm:px-4 lg:px-6">

      {/* Unified Header with Date Picker */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-[var(--ink)] mb-1">Deine Habits</h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Konsistenz schlägt Intensität</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="p-2 rounded-xl border text-sm font-bold bg-[var(--card)] border-[var(--line)] text-[var(--ink)]">
            {new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          {selectedDate !== localToday() && (
              <button onClick={() => setSelectedDate(localToday())}
                  className="p-2 rounded-full bg-[var(--card)] border border-[var(--line)] text-[var(--dim)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all shadow-md">
                  <CalendarDays size={18} />
              </button>
          )}
          <div className="flex items-center gap-4 bg-[var(--card)] border border-[var(--line)] px-4 py-2.5 rounded-2xl shadow-xl">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Gesamt-Score</span>
                <span className="text-lg font-black text-[var(--accent)]">{Math.round(overallConsistency * 100)}%</span>
             </div>
             <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <Star size={20} fill="currentColor" fillOpacity={0.2} />
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-6"> {/* Main content area, simulating former left panel */}
          <form onSubmit={handleAdd} className="card p-6 shadow-xl border-[var(--accent)]/10 bg-[var(--card)] border-[var(--line)]">
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
            {/* Icon Selector */}
            <div className="mb-4">
                <div className="label-caps !mb-2 text-[var(--dim)]">Icon wählen</div>
                <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map(iconName => {
                        const IconComponent = ICON_COMPONENTS_MAP[iconName]; // Get icon component dynamically
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

          <div className="space-y-3">
            <div className="label-caps px-1 text-[var(--dim)]">Aktive Habits</div>
            {habits.length === 0 && !loading && (
              <div className="card p-12 text-center opacity-30 border-dashed bg-[var(--card)] border-[var(--line)]">
                <Activity size={32} className="mx-auto mb-3 text-[var(--dim)]" />
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--dim)]">Noch keine Habits</p>
              </div>
            )}
            {habits.map(h => {
              const isEditing = editingHabitId === h.uuid;
              const isSelected = selectedHabitId === h.uuid; // Renamed from isExpanded to isSelected

              return (
                <div key={h.uuid}
                     onClick={(e) => { e.stopPropagation(); setSelectedHabitId(isSelected ? null : h.uuid); }} // Toggle selection
                     className={`group card p-4 flex items-center justify-between transition-all border-l-4 cursor-pointer
                           ${h.isDoneForSelectedDate ? 'border-green bg-green/5' : 'border-[var(--dim)] bg-[var(--card)]'}
                           ${isSelected ? 'border-[var(--accent)] bg-[var(--accent)]/10' : ''}`}> {/* Visual selected state */}
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={h.name}
                          onChange={(e) => setHabits(prev => prev.map(habit => habit.uuid === h.uuid ? { ...habit, name: e.target.value } : habit))}
                          onBlur={async (e) => {
                            await updateHabit(h.uuid, e.target.value.trim(), editingIcon);
                            setEditingHabitId(null);
                            setEditingIcon(null);
                            load(); // Reload to update state from DB
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            }
                          }}
                          className="w-full bg-[var(--bg2)] border-[var(--line)] rounded-md px-2 py-1 text-sm font-bold focus:border-[var(--accent)] outline-none"
                          autoFocus
                          onClick={e => e.stopPropagation()} // Stop propagation for input
                        />
                         {/* Icon Selector for Editing */}
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
                      </div>
                    )}                    <div className="text-xs font-bold opacity-30 uppercase tracking-widest mt-0.5 text-[var(--dim)]">
                      {h.isDoneForSelectedDate ? 'Erledigt' : 'Noch offen'} für {selectedDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isEditing && (
                      <button onClick={(e) => { e.stopPropagation(); setEditingHabitId(h.uuid); }} className="p-2 text-[var(--dim)] hover:text-[var(--accent)] transition-all">
                        <Edit size={16} />
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); toggleCheck(h); }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${h.isDoneForSelectedDate ? 'bg-green text-black' : 'bg-[var(--bg2)] border border-[var(--line)] text-[var(--dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]'}`}>
                      <Check size={20} className={h.isDoneForSelectedDate ? 'stroke-[3]' : ''} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(h.uuid); }} className="opacity-0 group-hover:opacity-100 p-2 text-[var(--dim)] hover:text-[var(--red)] transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
      </div> {/* Close of main content area */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"> {/* Added mt-8 for spacing */}
         <div className="card bg-[var(--accent)]/5 border-[var(--accent)]/20 p-6 flex flex-col justify-between border">
            <div>
               <div className="label-caps !mb-4 flex items-center gap-2 text-[var(--accent)]">
                  <Target size={14} />
                  Fokus heute
               </div>
               <p className="text-sm font-medium leading-relaxed opacity-70 text-[var(--ink)]">
                  {getMotivationalMessage(todayCompletionPercentage)}
               </p>
            </div>
            <div className="mt-6 h-1.5 w-full bg-[var(--bg2)] rounded-full overflow-hidden border border-[var(--line)]">
               <div className="h-full bg-[var(--accent)] transition-all duration-1000" style={{ width: `${todayCompletionPercentage}%` }} />
            </div>
         </div>

         <div className="card p-6 border-dashed border-[var(--line)]/50 bg-[var(--card)] border">
            <div className="label-caps !mb-4 flex items-center gap-2 text-[var(--dim)]">
               <TrendingUp size={14} className="text-[var(--dim)]" />
               Psychologie
            </div>
            <p className="text-[11px] font-medium opacity-50 leading-relaxed italic text-[var(--dim)]">
               "Motivation bringt dich in Gang. Gewohnheit hält dich am Laufen." – Jim Ryun. 
               Konzentriere dich darauf, die Kette nicht zu unterbrechen.
            </p>
         </div>
      </div>

      {/* Dynamic Right Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-80 lg:w-96 bg-[var(--card)] shadow-2xl z-50 transform transition-transform duration-300
                     ${selectedHabitId ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedHabitId && (
          <div className="flex flex-col h-full p-6">
            {(() => {
              const selectedHabit = habits.find(h => h.uuid === selectedHabitId);
              if (!selectedHabit) return null; // Safety check

              const selectedHabitRecords = selectedHabit.records || [];
              const selectedHabitConsistency = selectedHabitRecords.length > 0 ?
                (selectedHabitRecords.filter(r => rollingDates.includes(r.date) && r.completion === 'DONE').length / rollingDates.length) * 100 : 0;
              
              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = ICON_COMPONENTS_MAP[selectedHabit.icon || 'Activity'];
                        return IconComponent && <IconComponent size={24} className="text-[var(--ink)]" />;
                      })()}
                      <h2 className="text-xl font-black text-[var(--ink)]">{selectedHabit.name}</h2>
                    </div>
                    <button onClick={() => setSelectedHabitId(null)} className="p-2 text-[var(--dim)] hover:text-[var(--red)] transition-all">
                      <X size={24} />
                    </button>
                  </div>

                  {/* Heatmap for selected habit */}
                  <div className="flex-1 overflow-y-auto space-y-6">
                      <div className="card p-4">
                          <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xs font-bold uppercase tracking-widest opacity-70 text-[var(--ink)] flex items-center gap-2">
                                  <Calendar size={12} className="text-[var(--dim)]" />
                                  Konsistenz (28 Tage)
                              </h4>
                              <span className="text-[10px] font-bold opacity-30 text-[var(--dim)]">Konsistenz: {Math.round(selectedHabitConsistency)}%</span>
                          </div>
                          <div className="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-28 gap-1.5">
                              {getRollingDays(28).map(d => {
                                  const done = selectedHabit.records.some(r => r.date === d && r.completion === 'DONE');
                                  return (
                                  <div key={d} className="flex flex-col items-center gap-1">
                                      <div
                                      className={`w-full aspect-square rounded-md shadow-sm transition-all border ${done ? 'bg-emerald-500 border-emerald-600' : 'bg-[var(--bg2)] border-[var(--line)]/50'}`}
                                      title={`${d}: ${done ? 'Erledigt' : 'Offen'}`}
                                      />
                                  </div>
                                  )
                              })}
                          </div>
                      </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Backdrop for sidebar */}
      {selectedHabitId && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedHabitId(null)}></div>
      )}

    </div>
  );
}
