import { useState, useEffect } from "react";
import { saveJournal, updateJournal, getHabits, getJournalHistory, getAllHabitJournalsHistory, getSessionHistory } from "@db";
import { localToday } from "@utils";
import { Book } from "lucide-react";
import { ICON_COMPONENTS_MAP } from "../Habits/utils";

import JournalHeader from "./JournalHeader";
import JournalForm from "./JournalForm";
import JournalEntry from "./JournalEntry";
import JournalModal from "./JournalModal";

function formatRelativeDate(dateStr) {
  const today = localToday();
  if (dateStr === today) return "Heute";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "Gestern";
  
  return new Date(dateStr).toLocaleDateString('de-DE', { 
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
  });
}

export default function Journal() {
  const [date, setDate]     = useState(localToday());
  const [text, setText]     = useState("");
  const [timeline, setTimeline] = useState([]); // Array of grouped entries by date
  const [habits, setHabits]   = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [limitCount, setLimitCount] = useState(30);

  useEffect(() => {
    async function load() {
      const [regularHistory, habitHistory, sessions, allHabits] = await Promise.all([
        getJournalHistory(limitCount),
        getAllHabitJournalsHistory(limitCount),
        getSessionHistory(limitCount),
        getHabits()
      ]);
      
      setHabits(allHabits);
      
      const combined = [
        ...regularHistory.map(e => ({ ...e, type: 'regular' })),
        ...habitHistory
      ];

      sessions.forEach(session => {
        const savedAt = session.saved_at?.seconds
          ? new Date(session.saved_at.seconds * 1000).toISOString()
          : (typeof session.saved_at === 'string' ? session.saved_at : `${session.date}T23:59:59`);
        combined.push({
          id: 'workout-' + session.date + '-' + (session.id || '0'),
          date: session.date,
          text: session.notes || '',
          type: 'workout',
          block: session.block || 'Training',
          exercises: session.exercises || [],
          effort: session.effort,
          mood: session.mood,
          time: savedAt
        });
      });

      // Habit-Completions aus allHabits.records
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - limitCount);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      allHabits.forEach(habit => {
        (habit.records || []).forEach(record => {
          if (record.completion === 'DONE' && record.date >= cutoffStr) {
            combined.push({
              id: `habit-completion-${habit.uuid}-${record.date}`,
              date: record.date,
              type: 'habit-completion',
              habitId: habit.uuid,
              habitName: habit.name,
              habitIcon: habit.icon,
              text: '',
              time: `${record.date}T12:00:00`
            });
          }
        });
      });

      // Group by date
      const grouped = {};
      combined.forEach(entry => {
        const d = entry.date || localToday();
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(entry);
      });

      // Sort dates descending
      const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
      
      // Sort entries within each date
      const finalTimeline = sortedDates.map(d => ({
        date: d,
        entries: grouped[d].sort((a, b) => {
          const timeA = a.time || "";
          const timeB = b.time || "";
          return timeB.localeCompare(timeA);
        })
      }));

      setTimeline(finalTimeline);

      // Auto-load if editing today
      if (date === localToday() && grouped[date]?.filter(e => e.type === 'regular').length === 1 && !text) {
        const todayRegular = grouped[date].find(e => e.type === 'regular');
        setEditingEntry(todayRegular);
        setText(todayRegular.text);
      } else if (!editingEntry) {
        setText("");
      }
    }
    load().catch(() => setTimeline([]));
  }, [limitCount, date]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2000); }

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (editingEntry) {
        await updateJournal(editingEntry.id, text);
        // Optimistic UI update
        setTimeline(prev => prev.map(group => {
           if (group.date === editingEntry.date) {
             return { ...group, entries: group.entries.map(e => e.id === editingEntry.id ? { ...e, text: text.trim() } : e) };
           }
           return group;
        }));
        setEditingEntry(null);
        showToast("Aktualisiert ✓");
      } else {
        await saveJournal(date, text);
        // Force full reload to get clean IDs and timeline
        setLimitCount(p => p + 1); // trigger reload
        showToast("Gespeichert ✓");
      }
      setText("");
    } catch { showToast("Fehler beim Speichern"); }
    finally { setSaving(false); }
  }

  const handleEdit = (entry) => {
    setDate(entry.date); // switch form context to this date
    setEditingEntry(entry);
    setText(entry.text);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-32 max-w-3xl mx-auto px-2">
      <JournalHeader 
        date={date} 
        setDate={setDate} 
        localToday={localToday()} 
        formatRelativeDate={formatRelativeDate} 
      />

      <div className="space-y-12">
        <JournalForm 
          text={text} 
          setText={setText} 
          onSubmit={submit} 
          saving={saving} 
          editingEntry={editingEntry}
          onCancelEdit={() => { setEditingEntry(null); setText(""); setDate(localToday()); }}
        />

        <div className="space-y-12 mt-12">
          {timeline.length > 0 ? (
            timeline.map((group) => {
              const habitJournalIds = new Set(group.entries.filter(e => e.type === 'habit').map(e => e.habitId));
              const standaloneCompletions = group.entries.filter(e => e.type === 'habit-completion' && !habitJournalIds.has(e.habitId));
              const mainEntries = group.entries.filter(e => e.type !== 'habit-completion');
              return (
              <div key={group.date} className="relative">
                <div className="sticky top-20 z-10 py-2 bg-[var(--bg)]/90 backdrop-blur-md -mx-2 px-2 border-b border-[var(--line)]">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent">
                    {formatRelativeDate(group.date)}
                  </h3>
                  {standaloneCompletions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {standaloneCompletions.map(e => {
                        const Icon = ICON_COMPONENTS_MAP[e.habitIcon] || ICON_COMPONENTS_MAP['Activity'];
                        return (
                          <span
                            key={e.id}
                            title={e.habitName}
                            className="w-6 h-6 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] cursor-default"
                          >
                            <Icon size={12} />
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="relative pl-6 sm:pl-8 border-l border-[var(--line)] space-y-6 mt-4">
                  {mainEntries.map((e, i) => (
                    <JournalEntry
                      key={e.id || i}
                      e={e}
                      i={i}
                      habits={habits}
                      setSelectedEntry={setSelectedEntry}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
              );
            })
          ) : (
            <div className="p-20 text-center rounded-[32px] border border-dashed border-[var(--line)] opacity-20">
              <Book size={48} className="mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">Keine Einträge gefunden</p>
            </div>
          )}

          {timeline.length > 0 && (
             <div className="pt-8 flex justify-center">
                <button 
                  onClick={() => setLimitCount(p => p + 30)} 
                  className="px-8 py-3 rounded-2xl bg-bg2 border border-line text-[10px] font-black uppercase tracking-widest text-dim hover:text-ink hover:border-accent/30 transition-all"
                >
                  Ältere Einträge laden ↓
                </button>
             </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-card text-accent border border-line">
          {toast}
        </div>
      )}

      <JournalModal
        selectedEntry={selectedEntry}
        setSelectedEntry={setSelectedEntry}
        habits={habits}
        formatRelativeDate={formatRelativeDate}
      />
    </div>
  );
}
