import { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { getSessionHistory, getAllExercises } from "../db.js";
import BodyMap from "../components/BodyMap.jsx";

const DAYS_OPTIONS = [7, 14, 28];

export default function Muscles() {
  const [days, setDays]     = useState(7);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSessionHistory(days * 2),
      getAllExercises()
    ]).then(([sessions, kbExercises]) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      
      // Map KB for quick lookup by name
      const kbMap = new Map();
      kbExercises.forEach(ex => {
        kbMap.set((ex.display_name || ex.name).toLowerCase(), ex);
      });
      
      const inRange = sessions
        .filter(s => s.date >= cutoffStr)
        .flatMap(s => s.exercises || [])
        .filter(ex => ex.done)
        .map(ex => {
          // Enrich with KB data if available
          const kbEx = kbMap.get((ex.name || "").toLowerCase());
          return {
            ...ex,
            primaryMuscles: kbEx?.primary_muscles || kbEx?.primaryMuscles || ex.primaryMuscles || [],
            secondaryMuscles: kbEx?.secondary_muscles || kbEx?.secondaryMuscles || ex.secondaryMuscles || []
          };
        });
      
      setExercises(inRange);
    }).catch(() => setExercises([])).finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="pb-20">
      <div className="flex gap-2 mb-8 bg-card p-1.5 rounded-2xl border border-line shadow-inner max-w-xl mx-auto">
        {DAYS_OPTIONS.map(d => (
          <button key={d} onClick={() => setDays(d)} 
            className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${days === d ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-dim hover:text-ink hover:bg-white/5'}`}>
            {d} Tage Fokus
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <div className="spinner mb-6" />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Analysiere Muskelgruppen…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 p-10 rounded-[40px] border flex justify-center gap-20 bg-card border-line shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            <div className="text-center relative z-10">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-8">Anterior View</div>
              <BodyMap exercises={exercises} highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 200 }} />
            </div>
            <div className="text-center relative z-10">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-8">Posterior View</div>
              <BodyMap exercises={exercises} type="posterior" highlightedColors={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']} style={{ maxWidth: 200 }} />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="card p-8 border-accent/20 shadow-xl bg-gradient-to-b from-card to-bg2">
              <div className="label-caps mb-6 flex items-center gap-2 text-accent">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                 Fokus-Analyse
              </div>
              {exercises.length === 0 ? (
                <p className="text-sm opacity-40 py-8 text-center border border-dashed border-line rounded-2xl">Keine Trainingseinheiten im gewählten Zeitraum gefunden.</p>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm font-medium opacity-70 leading-relaxed">
                    Basierend auf deinen Sessions der letzten <span className="text-accent font-black">{days} Tage</span> ergibt sich folgende Verteilung:
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-4 h-4 rounded-lg bg-[#ef4444] shadow-lg shadow-[#ef4444]/20" />
                        <span className="font-bold opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Peak Volume</span>
                      </div>
                      <span className="text-[10px] font-black opacity-20 group-hover:opacity-100 transition-opacity">MAX</span>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-4 h-4 rounded-lg bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/20" />
                        <span className="font-bold opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">High Intensity</span>
                      </div>
                      <span className="text-[10px] font-black opacity-20">MID+</span>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-4 h-4 rounded-lg bg-[#22c55e] shadow-lg shadow-[#22c55e]/20" />
                        <span className="font-bold opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Base Volume</span>
                      </div>
                      <span className="text-[10px] font-black opacity-20">MID-</span>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-4 h-4 rounded-lg bg-[#3b82f6] shadow-lg shadow-[#3b82f6]/20" />
                        <span className="font-bold opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Maintenance</span>
                      </div>
                      <span className="text-[10px] font-black opacity-20">LOW</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6 bg-accent/5 border-accent/10 shadow-lg border-dashed">
              <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <Brain size={12} />
                Smart Insight
              </h4>
              <p className="text-[11px] font-medium opacity-60 leading-relaxed">
                Blaue Bereiche zeigen Erhaltungstraining an. Für Hypertrophie-Reize solltest du in der nächsten Session 
                gezielten Fokus auf die weniger gesättigten Regionen legen.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
