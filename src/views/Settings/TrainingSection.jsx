import { useState } from "react";
import { Zap, ChevronDown } from "lucide-react";
import SegmentedControl from "./SegmentedControl";

export default function TrainingSection({
  split, setSplit,
  gender, setGender,
  defaultLocation, setDefaultLocation,
  cycleLength, setCycleLength,
  recentDays, setRecentDays,
  coverageThreshold, setCoverageThreshold,
}) {
  const [slidersOpen, setSlidersOpen] = useState(false);

  return (
    <section className="card p-8 space-y-10 border-t-4 border-t-fit-dim animate-in fade-in slide-in-from-right-4 duration-500">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fit-bg2 border border-fit-line flex items-center justify-center">
            <Zap size={20} className="text-fit-dim" />
          </div>
          <h3 className="text-xl font-black text-fit-ink">Training Preferences</h3>
       </div>

       <div className="space-y-8">
          <SegmentedControl
            label="Training Split"
            options={[
              { id: 'PPL', label: 'PPL' },
              { id: 'Upper/Lower', label: 'Upper/Lower' },
              { id: 'Full Body', label: 'Full Body' },
            ]}
            value={split}
            onChange={setSplit}
          />

          <SegmentedControl
            label="Anatomie-Modell (Visualisierung)"
            options={[
              { id: 'male', label: 'Male' },
              { id: 'female', label: 'Female' },
            ]}
            value={gender}
            onChange={setGender}
          />

          <SegmentedControl
            label="Standard Standort"
            options={[
              { id: 'Home', label: 'Home' },
              { id: 'Gym', label: 'Gym' },
              { id: 'Outdoor', label: 'Outdoor' },
            ]}
            value={defaultLocation}
            onChange={setDefaultLocation}
          />

          {/* Analyse & Zyklus (collapsible) */}
          <div className="border-t border-fit-line/50 pt-6">
             <button
                onClick={() => setSlidersOpen(o => !o)}
                className="w-full flex items-center justify-between mb-4 group"
             >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-60 transition-opacity ml-1">Analyse & Zyklus</span>
                <ChevronDown size={14} className={`text-fit-dim transition-transform ${slidersOpen ? 'rotate-180' : ''}`} />
             </button>

             {slidersOpen && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Zyklus-Länge</div>
                         <span className="text-[10px] font-black text-fit-accent bg-fit-accent/10 px-2 py-0.5 rounded-md">{cycleLength} Wochen</span>
                      </div>
                      <input type="range" min="1" max="12" step="1" value={cycleLength} onChange={(e) => setCycleLength(parseInt(e.target.value))} className="w-full accent-[var(--accent)] h-1" />
                      <div className="flex justify-between text-[10px] font-black opacity-30 uppercase mt-1">
                         <span>1 W</span>
                         <span>12 W</span>
                      </div>
                   </div>
                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Analyse-Fenster (Recent)</div>
                         <span className="text-[10px] font-black text-fit-accent bg-fit-accent/10 px-2 py-0.5 rounded-md">{recentDays} Tage</span>
                      </div>
                      <input type="range" min="1" max="30" value={recentDays} onChange={(e) => setRecentDays(parseInt(e.target.value))} className="w-full accent-[var(--accent)] h-1" />
                   </div>
                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Coverage Threshold</div>
                         <span className="text-[10px] font-black text-fit-accent bg-fit-accent/10 px-2 py-0.5 rounded-md">{coverageThreshold} Sätze</span>
                      </div>
                      <input type="range" min="0.5" max="10" step="0.5" value={coverageThreshold} onChange={(e) => setCoverageThreshold(parseFloat(e.target.value))} className="w-full accent-[var(--accent)] h-1" />
                   </div>
                </div>
             )}
          </div>
       </div>
    </section>
  );
}
