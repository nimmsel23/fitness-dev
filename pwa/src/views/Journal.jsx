import { useState, useEffect } from "react";
import { getJournal, saveJournal, getAllHabitJournalsForDate, getHabits, getSession } from "../db.js";
import { localToday } from "../lib/utils.js";
import { Target, Book, Dumbbell, Brain } from "lucide-react";

export default function Journal() {
  const [date, setDate]     = useState(localToday());
  const [text, setText]     = useState("");
  const [entries, setEntries] = useState([]);
  const [habits, setHabits]   = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState("");

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
    }
    load().catch(() => setEntries([]));
  }, [date]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2000); }

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const entry = await saveJournal(date, text);
      setEntries(prev => [entry, ...prev]);
      setText("");
      showToast("Gespeichert ✓");
    } catch { showToast("Fehler beim Speichern"); }
    finally { setSaving(false); }
  }

  return (
    <div className="pb-20">
      <div className="flex gap-2 mb-6">
        <input type="date" value={date} max={localToday()}
          onChange={e => setDate(e.target.value)}
          className="flex-1 p-3 rounded-xl border font-bold bg-card border-line text-ink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
        <div className="space-y-4">
          <div className="label-caps px-1">Neuer Eintrag</div>
          <div className="p-5 rounded-3xl border bg-card border-line shadow-xl">
            <textarea value={text} onChange={e => setText(e.target.value)} rows={12}
              placeholder="Was hast du heute gelernt? Wie war das Training?"
              className="w-full bg-transparent border-none outline-none text-sm leading-relaxed resize-none text-ink"
            />
            <button onClick={submit} disabled={saving || !text.trim()}
              className="btn btn-primary w-full mt-4"
              style={{ opacity: saving || !text.trim() ? 0.5 : 1 }}>
              {saving ? "…" : "Eintrag speichern"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="label-caps px-1">Einträge — {date}</div>
          <div className="space-y-3">
            {entries.length > 0 ? (
              entries.map((e, i) => {
                const isHabit = e.type === 'habit';
                const isWorkout = e.type === 'workout';
                const habit = isHabit ? habits.find(h => h.uuid === e.habitId) : null;
                
                return (
                  <div key={e.id || i} className={`p-5 rounded-2xl border bg-card transition-colors ${isHabit ? 'border-accent/10 hover:border-accent/30' : isWorkout ? 'border-accent/10 bg-gradient-to-br from-card to-bg2' : 'border-line hover:border-accent/20'}`}>
                    {(isHabit || isWorkout) && (
                      <div className="flex items-center gap-2 mb-3">
                         <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                            {isHabit ? <Target size={12} /> : <Dumbbell size={12} />}
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                           {isHabit ? `${habit?.name || "Habit"} Notiz` : `${e.block} Notiz`}
                         </span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">{e.text}</p>
                    {isHabit && e.coachFeedback && (
                      <div className="mt-4 pt-4 border-t border-accent/10">
                         <div className="flex items-center gap-2 mb-1.5">
                            <Brain size={12} className="text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent">Coach Feedback</span>
                         </div>
                         <p className="text-xs font-bold italic text-ink/70">"{e.coachFeedback}"</p>
                      </div>
                    )}
                    {(e.time || e.updated_at) && (
                      <div className="flex items-center gap-2 mt-4 opacity-30">
                         <div className={`w-1 h-1 rounded-full ${isHabit || isWorkout ? 'bg-accent' : 'bg-dim'}`} />
                         <span className="text-[10px] font-bold font-mono">
                           {e.time ? e.time.slice(11, 16) : (e.updated_at?.seconds ? new Date(e.updated_at.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "")} Uhr
                         </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center rounded-3xl border border-dashed border-line opacity-30">
                <p className="text-sm">Keine Einträge für diesen Tag</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-card text-accent border border-line">
          {toast}
        </div>
      )}
    </div>
  )
}
