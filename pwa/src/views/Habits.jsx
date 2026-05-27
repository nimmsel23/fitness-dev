import { useState, useEffect, useMemo } from "react";
import { Check, Plus, Trash2, Calendar, Target, TrendingUp, Activity, Star } from "lucide-react";
import { getHabits, recordHabit, addHabit, deleteHabit, localToday } from "../db.js";

function epochDayNow() {
  return Math.floor(Date.now() / 86400000);
}

function getRolling28Days() {
  const dates = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const DAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState("");
  const [saving, setSaving] = useState(false);
  const todayEpochDay = useMemo(() => epochDayNow(), []);
  const rollingDates = useMemo(() => getRolling28Days(), []);

  async function load() {
    setLoading(true);
    try {
      const data = await getHabits();
      setHabits(data.filter(h => !h.deleted));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleCheck(h) {
    await recordHabit(h.uuid);
    load();
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setSaving(true);
    try {
      await addHabit(newHabit.trim());
      setNewHabit("");
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

  const overallConsistency = habits.length === 0 ? 0 : habits.reduce((sum, h) => {
    const doneCount = (h.records || []).filter(r => rollingDates.includes(new Date(r.epochDay * 86400000).toISOString().slice(0, 10))).length;
    return sum + (doneCount / 28);
  }, 0) / habits.length;

  return (
    <div className="pb-20">
      <div className="mb-8 flex items-end justify-between px-1">
        <div>
          <h1 className="text-3xl font-black text-ink mb-1">Deine Habits</h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Konsistenz schlägt Intensität</p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-line px-4 py-2.5 rounded-2xl shadow-xl">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Gesamt-Score</span>
              <span className="text-lg font-black text-accent">{Math.round(overallConsistency * 100)}%</span>
           </div>
           <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Star size={20} fill="currentColor" fillOpacity={0.2} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Management & List */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleAdd} className="card p-6 shadow-xl border-accent/10">
            <div className="label-caps mb-4 flex items-center gap-2">
              <Plus size={14} className="text-accent" />
              Neuer Habit
            </div>
            <div className="flex gap-2">
              <input 
                type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)}
                placeholder="z.B. Früh aufstehen" 
                className="flex-1 bg-bg2 border-line rounded-xl px-4 py-3 text-sm font-bold focus:border-accent outline-none"
              />
              <button disabled={saving || !newHabit.trim()} className="btn btn-primary !p-3">
                <Plus size={20} />
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <div className="label-caps px-1">Aktive Habits</div>
            {habits.length === 0 && !loading && (
              <div className="card p-12 text-center opacity-30 border-dashed">
                <Activity size={32} className="mx-auto mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">Noch keine Habits</p>
              </div>
            )}
            {habits.map(h => {
              const records = h.records || [];
              const isDoneToday = records.some(r => r.epochDay === todayEpochDay && r.completion === 'DONE');
              const streak = 0; // Placeholder for streak logic
              
              return (
                <div key={h.uuid} className={`group card p-4 flex items-center justify-between transition-all border-l-4 ${isDoneToday ? 'border-green bg-green/5' : 'border-dim bg-card'}`}>
                  <div className="flex-1">
                    <div className="text-sm font-black text-ink">{h.name}</div>
                    <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-0.5">
                      {isDoneToday ? 'Heute erledigt' : 'Noch offen'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleCheck(h)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDoneToday ? 'bg-green text-black' : 'bg-bg2 border border-line text-dim hover:border-accent hover:text-accent'}`}>
                      <Check size={20} className={isDoneToday ? 'stroke-[3]' : ''} />
                    </button>
                    <button onClick={() => handleDelete(h.uuid)} className="opacity-0 group-hover:opacity-100 p-2 text-dim hover:text-red transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Insights & Heatmap */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card p-8 shadow-2xl bg-gradient-to-br from-card to-bg2 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="label-caps !mb-0 flex items-center gap-2">
                <Calendar size={14} className="text-accent" />
                Habit-Heatmap (28 Tage)
              </h3>
              <div className="flex gap-2">
                 <div className="flex items-center gap-1.5 text-[9px] font-black opacity-30 uppercase">
                    <div className="w-2 h-2 rounded-sm bg-bg2" /> Missed
                 </div>
                 <div className="flex items-center gap-1.5 text-[9px] font-black text-green uppercase">
                    <div className="w-2 h-2 rounded-sm bg-green/30" /> Done
                 </div>
              </div>
            </div>

            <div className="space-y-8">
              {habits.map(h => {
                const records = h.records || [];
                const recordMap = Object.fromEntries(records.map(r => [new Date(r.epochDay * 86400000).toISOString().slice(0, 10), r]));
                
                return (
                  <div key={h.uuid} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                       <span className="text-xs font-black text-ink">{h.name}</span>
                       <span className="text-[10px] font-bold opacity-30">Konsistenz: {Math.round((records.filter(r => rollingDates.includes(new Date(r.epochDay * 86400000).toISOString().slice(0, 10))).length / 28) * 100)}%</span>
                    </div>
                    <div className="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-28 gap-1.5">
                      {rollingDates.map(d => {
                        const done = !!recordMap[d];
                        return (
                          <div key={d} className="flex flex-col items-center gap-1">
                            <div 
                              className={`w-full aspect-square rounded-md shadow-sm transition-all border ${done ? 'bg-green/30 border-green/20' : 'bg-bg2 border-line/50'}`}
                              title={d}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="card bg-accent/5 border-accent/20 p-6 flex flex-col justify-between">
                <div>
                   <div className="label-caps !mb-4 flex items-center gap-2 text-accent">
                      <Target size={14} />
                      Fokus heute
                   </div>
                   <p className="text-sm font-medium leading-relaxed opacity-70">
                      Du hast heute <span className="text-accent font-black">{habits.filter(h => h.records?.some(r => r.epochDay === todayEpochDay)).length}/{habits.length}</span> Habits erledigt. 
                      Bleib dran, der Abend ist noch jung!
                   </p>
                </div>
                <div className="mt-6 h-1.5 w-full bg-bg2 rounded-full overflow-hidden border border-line">
                   <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${(habits.filter(h => h.records?.some(r => r.epochDay === todayEpochDay)).length / Math.max(1, habits.length)) * 100}%` }} />
                </div>
             </div>

             <div className="card p-6 border-dashed border-line/50">
                <div className="label-caps !mb-4 flex items-center gap-2">
                   <TrendingUp size={14} className="text-dim" />
                   Psychologie
                </div>
                <p className="text-[11px] font-medium opacity-50 leading-relaxed italic">
                   "Motivation bringt dich in Gang. Gewohnheit hält dich am Laufen." – Jim Ryun. 
                   Konzentriere dich darauf, die Kette nicht zu unterbrechen.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
