import { useState, useEffect } from "react";
import { getJournal, saveJournal, updateJournal, getAllHabitJournalsForDate, getHabits, getSession } from "../../db.js";
import { localToday } from "../../lib/utils.js";
import { Book } from "lucide-react";

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
  const [entries, setEntries] = useState([]);
  const [habits, setHabits]   = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    async function load() {
      const [regularEntries, habitEntries, allHabits, session] = await Promise.all([
        getJournal(date),
        getAllHabitJournalsForDate(date),
        getHabits(),
        getSession(date)
      ]);
      
      setHabits(allHabits);
      
      const combined = [
        ...regularEntries.map(e => ({ ...e, type: 'regular' })),
        ...habitEntries
      ];

      if (session && session.notes && session.notes.trim()) {
        combined.push({
          id: 'workout-note-' + date,
          text: session.notes,
          type: 'workout',
          block: session.block || 'Training',
          updated_at: session.saved_at
        });
      }

      combined.sort((a, b) => {
        const timeA = a.time || (a.updated_at?.seconds ? new Date(a.updated_at.seconds * 1000).toISOString() : "");
        const timeB = b.time || (b.updated_at?.seconds ? new Date(b.updated_at.seconds * 1000).toISOString() : "");
        return timeB.localeCompare(timeA);
      });

      setEntries(combined);
      
      // Auto-load if exactly one regular entry exists and text is empty
      if (regularEntries.length === 1 && !text) {
        setEditingEntry(regularEntries[0]);
        setText(regularEntries[0].text);
      } else {
        setEditingEntry(null);
        setText("");
      }
    }
    load().catch(() => setEntries([]));
  }, [date]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2000); }

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (editingEntry) {
        await updateJournal(editingEntry.id, text);
        setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...e, text: text.trim() } : e));
        setEditingEntry(null);
        showToast("Aktualisiert ✓");
      } else {
        const entry = await saveJournal(date, text);
        setEntries(prev => [{ ...entry, text: text.trim(), type: 'regular', time: new Date().toISOString() }, ...prev].sort((a, b) => {
            const timeA = a.time || (a.updated_at?.seconds ? new Date(a.updated_at.seconds * 1000).toISOString() : "");
            const timeB = b.time || (b.updated_at?.seconds ? new Date(b.updated_at.seconds * 1000).toISOString() : "");
            return timeB.localeCompare(timeA);
        }));
        showToast("Gespeichert ✓");
      }
      setText("");
    } catch { showToast("Fehler beim Speichern"); }
    finally { setSaving(false); }
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setText(entry.text);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-20 max-w-5xl mx-auto px-2">
      <JournalHeader 
        date={date} 
        setDate={setDate} 
        localToday={localToday()} 
        formatRelativeDate={formatRelativeDate} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 items-start">
        <JournalForm 
          text={text} 
          setText={setText} 
          onSubmit={submit} 
          saving={saving} 
          editingEntry={editingEntry}
          onCancelEdit={() => { setEditingEntry(null); setText(""); }}
        />

        <div className="relative pl-8 border-l border-[var(--line)] space-y-8">
          {entries.length > 0 ? (
            entries.map((e, i) => (
              <JournalEntry 
                key={e.id || i} 
                e={e} 
                i={i} 
                habits={habits} 
                setSelectedEntry={setSelectedEntry} 
                onEdit={handleEdit}
              />
            ))
          ) : (
            <div className="p-20 text-center rounded-[32px] border border-dashed border-[var(--line)] opacity-20">
              <Book size={48} className="mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">Leere Seiten warten darauf gefüllt zu werden</p>
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
        date={date} 
      />
    </div>
  );
}
