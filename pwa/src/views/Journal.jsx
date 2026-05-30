import { useState, useEffect } from "react";
import { getJournal, saveJournal, getAllHabitJournalsForDate, getHabits, getSession } from "../db.js";
import { localToday } from "../lib/utils.js";
import { Target, Book, Dumbbell, Brain, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="pb-20 max-w-5xl mx-auto px-2">
      {/* Refined Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-[var(--accent)] font-black uppercase tracking-[0.3em] text-[10px] mb-2">
              <Book size={14} />
              Daily Reflection
           </div>
           <h1 className="text-4xl font-black text-[var(--ink)] tracking-tighter">
             {formatRelativeDate(date)}
           </h1>
        </div>
        
        <div className="flex items-center gap-2 bg-[var(--card)] p-1.5 rounded-2xl border border-[var(--line)] shadow-xl">
          <button onClick={() => {
            const d = new Date(date);
            d.setDate(d.getDate() - 1);
            setDate(d.toISOString().slice(0, 10));
          }} className="p-2.5 rounded-xl hover:bg-[var(--bg2)] text-[var(--dim)] transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="relative">
             <input type="date" value={date} max={localToday()}
               onChange={e => setDate(e.target.value)}
               className="bg-transparent px-4 py-2 text-sm font-black text-[var(--ink)] outline-none cursor-pointer uppercase tracking-widest"
             />
          </div>
          <button 
            disabled={date === localToday()}
            onClick={() => {
              const d = new Date(date);
              d.setDate(d.getDate() + 1);
              setDate(d.toISOString().slice(0, 10));
            }} className="p-2.5 rounded-xl hover:bg-[var(--bg2)] text-[var(--dim)] transition-all disabled:opacity-10">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 items-start">
        {/* Input Area */}
        <div className="sticky top-6 space-y-6">
          <div className="card p-6 shadow-2xl bg-gradient-to-b from-[var(--card)] to-[var(--bg2)] border border-[var(--line)] relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-1000">
               <Book size={120} />
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
              placeholder="Gedanken, Erkenntnisse, Fokus..."
              className="w-full bg-transparent border-none outline-none text-sm leading-relaxed resize-none text-[var(--ink)] font-medium placeholder:opacity-30"
            />
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-[var(--line)]/50">
               <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Shift + Enter für Umbruch</span>
               <button onClick={submit} disabled={saving || !text.trim()}
                 className="btn btn-primary px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent)]/20">
                 {saving ? "..." : "Sichern"}
               </button>
            </div>
          </div>

          <div className="px-2 py-4 border-l-2 border-dashed border-[var(--line)] ml-4">
             <p className="text-[11px] font-bold opacity-30 leading-relaxed italic text-[var(--dim)]">
                "Worte sind die Brücke von der Erfahrung zur Erkenntnis."
             </p>
          </div>
        </div>

        {/* Timeline Area */}
        <div className="relative pl-8 border-l border-[var(--line)] space-y-8">
          {entries.length > 0 ? (
            entries.map((e, i) => {
              const isHabit = e.type === 'habit';
              const isWorkout = e.type === 'workout';
              const habit = isHabit ? habits.find(h => h.uuid === e.habitId) : null;
              
              return (
                <div key={e.id || i} className="relative group">
                  {/* Timeline Bullet */}
                  <div className={`absolute -left-[37px] top-6 w-4 h-4 rounded-full border-4 border-[var(--bg)] shadow-sm z-10 transition-transform group-hover:scale-125 ${isHabit || isWorkout ? 'bg-[var(--accent)]' : 'bg-[var(--dim)]'}`} />
                  
                  <div className={`p-6 rounded-[24px] border bg-[var(--card)] shadow-md transition-all hover:shadow-2xl hover:-translate-y-0.5 ${isHabit || isWorkout ? 'border-[var(--accent)]/10' : 'border-[var(--line)]'}`}>
                    <div className="flex items-center justify-between mb-4">
                       {(isHabit || isWorkout) ? (
                         <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                               {isHabit ? <Target size={16} /> : <Dumbbell size={16} />}
                            </div>
                            <div>
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                                 {isHabit ? habit?.name : e.block}
                               </span>
                               <div className="text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5">Automatischer Log</div>
                            </div>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 text-[var(--dim)]">
                            <Clock size={14} className="opacity-30" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Journal Eintrag</span>
                         </div>
                       )}

                       {(e.time || e.updated_at) && (
                         <span className="text-[10px] font-black font-mono opacity-20 bg-[var(--bg2)] px-2 py-1 rounded-md">
                           {e.time ? e.time.slice(11, 16) : (e.updated_at?.seconds ? new Date(e.updated_at.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "")}
                         </span>
                       )}
                    </div>

                    <p className="text-sm leading-relaxed text-[var(--ink)]/90 font-medium whitespace-pre-wrap selection:bg-[var(--accent)]/30">
                       {e.text}
                    </p>

                    {isHabit && e.coachFeedback && (
                      <div className="mt-6 p-4 rounded-2xl bg-[var(--accent)]/5 border-l-4 border-[var(--accent)]">
                         <div className="flex items-center gap-2 mb-2">
                            <Brain size={14} className="text-[var(--accent)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Coach Feedback</span>
                         </div>
                         <p className="text-xs font-bold italic text-[var(--ink)]/80 leading-relaxed">"{e.coachFeedback}"</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center rounded-[32px] border border-dashed border-[var(--line)] opacity-20">
              <Book size={48} className="mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">Leere Seiten warten darauf gefüllt zu werden</p>
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
