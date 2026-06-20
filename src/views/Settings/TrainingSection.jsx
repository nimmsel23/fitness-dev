import { useState } from "react";
import { Zap, Settings2, RefreshCw, ChevronDown } from "lucide-react";

export default function TrainingSection({
  split, setSplit,
  gender, setGender,
  defaultLocation, setDefaultLocation,
  muscleLanguage, setMuscleLanguage,
  cycleLength, setCycleLength,
  recentDays, setRecentDays,
  coverageThreshold, setCoverageThreshold,
  showAdvanced, setShowAdvanced,
  swVersion, swUpdateAvailable, swChecking,
  onSwCheck, onSwApply,
}) {
  const [slidersOpen, setSlidersOpen] = useState(false);

  return (
    <section className="card p-8 space-y-10 border-t-4 border-t-[var(--dim)] animate-in fade-in slide-in-from-right-4 duration-500">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg2)] border border-[var(--line)] flex items-center justify-center">
            <Zap size={20} className="text-[var(--dim)]" />
          </div>
          <h3 className="text-xl font-black text-ink">Training Preferences</h3>
       </div>

       <div className="space-y-8">
          {/* Training Split */}
          <div>
             <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Training Split</div>
             <div className="flex gap-1 p-1 bg-[var(--bg2)] rounded-xl border border-[var(--line)]">
                {[
                  { id: 'PPL', label: 'PPL' },
                  { id: 'Upper/Lower', label: 'Upper/Lower' },
                  { id: 'Full Body', label: 'Full Body' },
                ].map(({ id, label }) => (
                  <button key={id} onClick={() => setSplit(id)}
                     className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${split === id ? 'bg-[var(--card)] shadow-md text-[var(--accent)]' : 'text-[var(--dim)] hover:text-[var(--ink)]'}`}>
                     {label}
                  </button>
                ))}
             </div>
          </div>

          {/* Anatomy Model */}
          <div>
             <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Anatomie-Modell (Visualisierung)</div>
             <div className="flex gap-1 p-1 bg-[var(--bg2)] rounded-xl border border-[var(--line)]">
                {['male', 'female'].map(g => (
                   <button key={g} onClick={() => setGender(g)}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${gender === g ? 'bg-[var(--card)] shadow-md text-[var(--accent)]' : 'text-[var(--dim)] hover:text-[var(--ink)]'}`}>
                      {g === 'male' ? 'Male' : 'Female'}
                   </button>
                ))}
             </div>
          </div>

          {/* Default Location */}
          <div>
             <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Standard Standort</div>
             <div className="flex gap-1 p-1 bg-[var(--bg2)] rounded-xl border border-[var(--line)]">
                {[
                  { id: 'Home', label: 'Home' },
                  { id: 'Gym', label: 'Gym' },
                  { id: 'Outdoor', label: 'Outdoor' },
                ].map(({ id, label }) => (
                  <button key={id} onClick={() => setDefaultLocation(id)}
                     className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${defaultLocation === id ? 'bg-[var(--card)] shadow-md text-[var(--accent)]' : 'text-[var(--dim)] hover:text-[var(--ink)]'}`}>
                     {label}
                  </button>
                ))}
             </div>
          </div>

          {/* Muscle Language */}
          <div>
             <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-3 ml-1">Muskel-Terminologie</div>
             <div className="flex gap-1 p-1 bg-[var(--bg2)] rounded-xl border border-[var(--line)]">
                {[
                  { id: 'de', label: 'Deutsch' },
                  { id: 'en', label: 'English' },
                  { id: 'lat', label: 'Latein' },
                ].map(({ id, label }) => (
                  <button key={id} onClick={() => setMuscleLanguage(id)}
                     className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${muscleLanguage === id ? 'bg-[var(--card)] shadow-md text-[var(--accent)]' : 'text-[var(--dim)] hover:text-[var(--ink)]'}`}>
                     {label}
                  </button>
                ))}
             </div>
          </div>

          {/* Sliders — collapsible */}
          <div className="border-t border-[var(--line)]/50 pt-6">
             <button
                onClick={() => setSlidersOpen(!slidersOpen)}
                className="flex items-center justify-between w-full"
             >
                <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Analyse & Zyklus</div>
                <ChevronDown
                   size={14}
                   className={`text-[var(--dim)] transition-transform duration-300 ${slidersOpen ? 'rotate-180' : ''}`}
                />
             </button>

             {slidersOpen && (
                <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Zyklus-Länge</div>
                         <span className="text-[10px] font-black text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md">{cycleLength} Wochen</span>
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
                         <span className="text-[10px] font-black text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md">{recentDays} Tage</span>
                      </div>
                      <input type="range" min="1" max="30" value={recentDays} onChange={(e) => setRecentDays(parseInt(e.target.value))} className="w-full accent-[var(--accent)] h-1" />
                   </div>
                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <div className="text-[10px] font-black uppercase tracking-widest opacity-30 ml-1">Coverage Threshold</div>
                         <span className="text-[10px] font-black text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md">{coverageThreshold} Sätze</span>
                      </div>
                      <input type="range" min="0.5" max="10" step="0.5" value={coverageThreshold} onChange={(e) => setCoverageThreshold(parseFloat(e.target.value))} className="w-full accent-[var(--accent)] h-1" />
                   </div>
                </div>
             )}
          </div>

          {/* App Version */}
          <div className="pt-4 border-t border-[var(--line)]/50">
             <div className="bg-[var(--bg2)] p-4 rounded-2xl border border-[var(--line)] space-y-3">
                <div className="flex items-center gap-2 mb-1">
                   <RefreshCw size={14} className={swChecking ? 'animate-spin text-[var(--accent)]' : 'text-[var(--dim)]'} />
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">App Version</span>
                </div>
                <div className="flex items-center justify-between bg-[var(--bg)] p-3 rounded-xl border border-[var(--line)]">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Installiert</span>
                   <span className="text-[10px] font-mono font-black text-[var(--accent)]">{swVersion || '—'}</span>
                </div>
                {swUpdateAvailable && (
                   <div className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-center">
                      Update bereit
                   </div>
                )}
                {swUpdateAvailable ? (
                   <button onClick={onSwApply} className="w-full btn btn-primary py-3 text-[10px] font-black uppercase tracking-widest">
                      Jetzt aktualisieren & neu laden
                   </button>
                ) : (
                   <button onClick={onSwCheck} disabled={swChecking} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-[var(--dim)] bg-[var(--bg)] border border-[var(--line)] rounded-xl hover:text-[var(--ink)] hover:border-[var(--accent)]/40 transition-all">
                      {swChecking ? 'Suche Update…' : 'Auf Update prüfen'}
                   </button>
                )}
             </div>
          </div>

          {/* Advanced Mode trigger */}
          <div className="pt-4 flex justify-center">
             <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-black text-[9px] uppercase tracking-widest ${showAdvanced ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)] shadow-lg shadow-[var(--accent)]/5' : 'border-[var(--line)] bg-[var(--bg2)] text-[var(--dim)] hover:text-[var(--ink)]'}`}
             >
                <Settings2 size={12} className={showAdvanced ? 'animate-pulse' : ''} />
                {showAdvanced ? 'Advanced Mode: Ein' : 'Advanced Mode: Aus'}
             </button>
          </div>
       </div>
    </section>
  );
}
