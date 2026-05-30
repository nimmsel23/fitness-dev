import { useState, useEffect, useMemo } from "react";
import { Star, CalendarDays, Activity } from "lucide-react";
import { 
  getHabits, recordHabit, unrecordHabit, addHabit, deleteHabit, 
  updateHabit, getHabitRecordsForDate, getHabitJournal, saveHabitJournal, getHabitJournalHistory 
} from "../../db.js";
import { localToday } from "../../lib/utils.js";

import HabitForm from "./HabitForm";
import HabitItem from "./HabitItem";
import HabitSidebar from "./HabitSidebar";
import HabitStats from "./HabitStats";
import { getRollingDays } from "./utils";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState("");
  const [selectedIcon, setSelectedIcon] = useState('Activity');
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(localToday());
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingIcon, setEditingIcon] = useState(null);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [selectedSidebarDate, setSelectedSidebarDate] = useState(localToday());
  const [journalText, setJournalText] = useState("");
  const [journalHistory, setJournalHistory] = useState([]);
  const [isJournalSaving, setIsJournalSaving] = useState(false);

  const rollingDates = useMemo(() => getRollingDays(28), []);

  async function load() {
    setLoading(true);
    try {
      const allHabits = await getHabits();
      const completedHabitIdsForSelectedDate = await getHabitRecordsForDate(selectedDate);

      const habitsWithStatus = allHabits
        .filter(h => !h.deleted)
        .map(h => ({
          ...h,
          isDoneForSelectedDate: completedHabitIdsForSelectedDate.includes(h.uuid)
        }));
      setHabits(habitsWithStatus);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [selectedDate]);

  useEffect(() => {
    if (selectedHabitId && selectedSidebarDate) {
      setJournalText("");
      getHabitJournal(selectedHabitId, selectedSidebarDate).then(j => {
        setJournalText(j?.text || "");
      });
    }
    if (selectedHabitId) {
      getHabitJournalHistory(selectedHabitId).then(setJournalHistory);
    }
  }, [selectedHabitId, selectedSidebarDate]);

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

  async function toggleSidebarDone(habitId, date) {
    const h = habits.find(x => x.uuid === habitId);
    const isDone = h?.records?.some(r => r.date === date && r.completion === 'DONE');
    if (isDone) {
      await unrecordHabit(habitId, date);
    } else {
      await recordHabit(habitId, date);
    }
    load();
  }

  async function onSaveJournal(textOverride = null) {
    const textToSave = textOverride !== null ? textOverride : journalText;
    if (!selectedHabitId || !selectedSidebarDate) return;
    setIsJournalSaving(true);
    try {
      await saveHabitJournal(selectedHabitId, selectedSidebarDate, textToSave);
      getHabitJournalHistory(selectedHabitId).then(setJournalHistory);
    } finally {
      setIsJournalSaving(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setSaving(true);
    try {
      await addHabit(newHabit.trim(), selectedIcon);
      setNewHabit("");
      setSelectedIcon('Activity');
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
    if (percentage === 100) return "Hervorragend! Alle Habits erledigt! Weiter so!";
    if (percentage >= 50) return `Du hast ${Math.round(percentage)}% deiner Habits erledigt. Fast geschafft! Bleib dran!`;
    if (percentage > 0) return `Du hast ${Math.round(percentage)}% deiner Habits erledigt. Guter Start! Aber da geht noch mehr!`;
    return "Der Tag hat gerade erst begonnen! Fang jetzt an und hol dir die ersten Checks!";
  }

  const updateHabitName = (uuid, name) => {
    setHabits(prev => prev.map(h => h.uuid === uuid ? { ...h, name } : h));
  };

  const finishEditing = async () => {
    const h = habits.find(x => x.uuid === editingHabitId);
    if (h) {
      await updateHabit(h.uuid, h.name.trim(), editingIcon);
    }
    setEditingHabitId(null);
    setEditingIcon(null);
    load();
  };

  return (
    <div className="pb-20 px-2 sm:px-4 lg:px-6">
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

      <div className="space-y-6">
          <HabitForm 
            newHabit={newHabit} 
            setNewHabit={setNewHabit} 
            selectedIcon={selectedIcon} 
            setSelectedIcon={setSelectedIcon} 
            onAdd={handleAdd} 
            saving={saving} 
          />

          <div className="space-y-3">
            <div className="label-caps px-1 text-[var(--dim)]">Aktive Habits</div>
            {habits.length === 0 && !loading && (
              <div className="card p-12 text-center opacity-30 border-dashed bg-[var(--card)] border-[var(--line)]">
                <Activity size={32} className="mx-auto mb-3 text-[var(--dim)]" />
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--dim)]">Noch keine Habits</p>
              </div>
            )}
            {habits.map(h => (
              <HabitItem 
                key={h.uuid}
                h={h}
                isSelected={selectedHabitId === h.uuid}
                isEditing={editingHabitId === h.uuid}
                editingIcon={editingIcon}
                setEditingIcon={setEditingIcon}
                setEditingHabitId={setEditingHabitId}
                onToggleSelection={() => setSelectedHabitId(selectedHabitId === h.uuid ? null : h.uuid)}
                onToggleCheck={toggleCheck}
                onDelete={handleDelete}
                onUpdateName={updateHabitName}
                onFinishEditing={finishEditing}
                selectedDate={selectedDate}
              />
            ))}
          </div>
      </div>

      <HabitStats 
        todayCompletionPercentage={todayCompletionPercentage} 
        getMotivationalMessage={getMotivationalMessage} 
      />

      <HabitSidebar 
        selectedHabitId={selectedHabitId}
        setSelectedHabitId={setSelectedHabitId}
        habits={habits}
        rollingDates={rollingDates}
        selectedSidebarDate={selectedSidebarDate}
        setSelectedSidebarDate={setSelectedSidebarDate}
        journalText={journalText}
        setJournalText={setJournalText}
        isJournalSaving={isJournalSaving}
        onSaveJournal={onSaveJournal}
        onToggleSidebarDone={toggleSidebarDone}
        journalHistory={journalHistory}
      />

      {selectedHabitId && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedHabitId(null)}></div>
      )}
    </div>
  );
}
