import { useState, useEffect } from "react";
import { X, Save, Target, Sparkles } from "lucide-react";
import { getHabitJournal, saveHabitJournal } from "../db.js";

export default function HabitJournalModal({ isOpen, onClose, habit, date }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && habit && date) {
      setText("");
      getHabitJournal(habit.uuid, date).then(j => {
        if (j?.text) setText(j.text);
      });
    }
  }, [isOpen, habit, date]);

  async function handleSave() {
    if (!habit || !date) return;
    setSaving(true);
    try {
      await saveHabitJournal(habit.uuid, date, text);
      onClose();
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !habit) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-[var(--card)] rounded-[32px] border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[var(--line)]/50 flex items-center justify-between bg-gradient-to-r from-[var(--card)] to-[var(--bg2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
              <Target size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">
                {habit.name}
              </h3>
              <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                Notiz für {date}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-[var(--bg2)] text-[var(--dim)] transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Was möchtest du zu diesem Habit festhalten?..."
            className="w-full h-48 bg-[var(--bg2)] border border-[var(--line)] rounded-2xl p-4 text-sm font-medium focus:border-[var(--accent)] outline-none resize-none transition-all text-[var(--ink)]"
            autoFocus
          />
        </div>

        <div className="p-6 border-t border-[var(--line)]/50 bg-[var(--bg2)]/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="btn bg-[var(--card)] border border-[var(--line)] text-[var(--ink)] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent)] transition-all"
          >
            Abbrechen
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 bg-[var(--accent)] text-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[var(--accent)]/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Wait...' : <><Save size={16} /> Speichern</>}
          </button>
        </div>
      </div>
    </div>
  );
}
