import { useState, useMemo } from 'react';
import { Zap, ShieldAlert, Dumbbell, Award, Flame, Activity, Sparkles, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';

const EXERCISE_PRESETS = [
  { id: 'bench', name: 'Bankdrücken (Bench Press)', defaultWeight: 90, defaultReps: 5 },
  { id: 'squat', name: 'Kniebeugen (Squat)', defaultWeight: 120, defaultReps: 5 },
  { id: 'deadlift', name: 'Kreuzheben (Deadlift)', defaultWeight: 140, defaultReps: 3 },
  { id: 'ohp', name: 'Schulterdrücken (OHP)', defaultWeight: 60, defaultReps: 6 },
  { id: 'row', name: 'Langhantelrudern (Row)', defaultWeight: 80, defaultReps: 8 },
  { id: 'custom', name: 'Eigene Übung', defaultWeight: 70, defaultReps: 8 },
];

const MUSCLE_RECOVERY_DATA = [
  { id: 'chest', name: 'Brust (Pectoralis)', hoursAgo: 22, recoveryHours: 48, icon: '💪' },
  { id: 'back', name: 'Rücken (Latissimus & Trapezius)', hoursAgo: 50, recoveryHours: 48, icon: '🧱' },
  { id: 'legs', name: 'Beine (Quadriceps & Hamstrings)', hoursAgo: 14, recoveryHours: 72, icon: '🦵' },
  { id: 'shoulders', name: 'Schultern (Deltoideus)', hoursAgo: 38, recoveryHours: 48, icon: '🏋️' },
  { id: 'arms', name: 'Arme (Biceps & Triceps)', hoursAgo: 44, recoveryHours: 36, icon: '⚡' },
  { id: 'core', name: 'Rumpf / Core', hoursAgo: 18, recoveryHours: 24, icon: '🔥' },
];

export default function ReviewReadinessMatrix({ taxonomy = null, muscleLanguage = 'de' }) {
  const [selectedPreset, setSelectedPreset] = useState(EXERCISE_PRESETS[0]);
  const [weight, setWeight] = useState(EXERCISE_PRESETS[0].defaultWeight);
  const [reps, setReps] = useState(EXERCISE_PRESETS[0].defaultReps);
  const [rpe, setRpe] = useState(8.5);
  const [trainingGoal, setTrainingGoal] = useState('strength'); // 'strength' | 'hypertrophy' | 'endurance'

  // Preset switch
  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    setWeight(preset.defaultWeight);
    setReps(preset.defaultReps);
  };

  // 1RM Calculations (Multi-formula average)
  const calc1RM = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps, 10) || 1;
    if (w <= 0 || r <= 0) return { avg: 0, epley: 0, brzycki: 0, wathan: 0 };

    const epley = w * (1 + r / 30);
    const brzycki = r < 37 ? w * (36 / (37 - r)) : w * 1.5;
    const wathan = (100 * w) / (48.8 + 53.8 * Math.exp(-0.075 * r));

    const avg = Math.round((epley + brzycki + wathan) / 3);
    return {
      avg,
      epley: Math.round(epley),
      brzycki: Math.round(brzycki),
      wathan: Math.round(wathan),
    };
  }, [weight, reps]);

  // Percentage & Rep spectrum table based on calculated 1RM
  const percentageSpectrum = useMemo(() => {
    const oneRM = calc1RM.avg;
    if (!oneRM) return [];
    return [
      { pct: 100, reps: '1 RM', weight: oneRM, use: 'Maximalkraft-Test' },
      { pct: 95, reps: '2 RM', weight: Math.round(oneRM * 0.95), use: 'Stärke-Peak' },
      { pct: 90, reps: '3 - 4 RM', weight: Math.round(oneRM * 0.90), use: 'Heavy Strength' },
      { pct: 85, reps: '5 - 6 RM', weight: Math.round(oneRM * 0.85), use: 'Kraft-Hypertrophie' },
      { pct: 80, reps: '7 - 8 RM', weight: Math.round(oneRM * 0.80), use: 'Hypertrophie-Optimum' },
      { pct: 75, reps: '9 - 10 RM', weight: Math.round(oneRM * 0.75), use: 'Volumen & Pumpe' },
      { pct: 70, reps: '12+ RM', weight: Math.round(oneRM * 0.70), use: 'Kraftausdauer / Deload' },
    ];
  }, [calc1RM.avg]);

  // Muscle recovery calculation
  const muscleStatuses = useMemo(() => {
    return MUSCLE_RECOVERY_DATA.map((m) => {
      const pct = Math.min(100, Math.round((m.hoursAgo / m.recoveryHours) * 100));
      const hoursRemaining = Math.max(0, m.recoveryHours - m.hoursAgo);
      let statusLabel = 'Voll einsatzbereit';
      let statusColor = 'text-fit-accent bg-fit-accent/10 border-fit-accent/30';

      if (pct < 50) {
        statusLabel = 'Hohe Ermüdung';
        statusColor = 'text-fit-red bg-fit-red/10 border-fit-red/30';
      } else if (pct < 85) {
        statusLabel = 'Leichte Regeneration';
        statusColor = 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      }

      return {
        ...m,
        pct,
        hoursRemaining,
        statusLabel,
        statusColor,
      };
    });
  }, []);

  // Overall Readiness Index (0 - 100)
  const overallReadiness = useMemo(() => {
    const sum = muscleStatuses.reduce((acc, curr) => acc + curr.pct, 0);
    return Math.round(sum / muscleStatuses.length);
  }, [muscleStatuses]);

  // ACWR (Acute-to-Chronic Workload Ratio) estimation
  const acwr = 1.15; // 0.8 - 1.3 is optimal zone

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Readiness Score */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 card p-8 bg-gradient-to-br from-fit-card via-fit-bg2 to-fit-card border border-fit-line shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Zap size={180} className="text-fit-accent" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 rounded-xl bg-fit-accent/10 border border-fit-accent/20 text-fit-accent">
                <Zap size={20} />
              </span>
              <div>
                <h2 className="text-lg font-black tracking-tight text-fit-ink">Readiness & Stärke-Matrix</h2>
                <p className="text-fit-dim text-[11px] font-semibold">Regenerations-Index, 1RM-Prognosen & RPE Target Zones</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-fit-bg border border-fit-line/60">
              <div className="text-[10px] font-black uppercase tracking-widest text-fit-dim mb-1">Overall Readiness</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-fit-accent">{overallReadiness}%</span>
                <span className="text-[10px] font-bold text-fit-dim">Score</span>
              </div>
              <div className="w-full bg-fit-line/40 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-fit-accent h-full transition-all duration-700" style={{ width: `${overallReadiness}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-fit-bg border border-fit-line/60">
              <div className="text-[10px] font-black uppercase tracking-widest text-fit-dim mb-1">ACWR Ratio</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-fit-ink">{acwr}</span>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Optimal</span>
              </div>
              <p className="text-[9px] text-fit-dim mt-1 truncate">Sweetspot (0.8 – 1.3)</p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-fit-bg border border-fit-line/60 flex flex-col justify-between">
              <div className="text-[10px] font-black uppercase tracking-widest text-fit-dim mb-1">Tages-Empfehlung</div>
              <div className="flex items-center gap-2 text-xs font-bold text-fit-ink">
                <CheckCircle2 size={14} className="text-fit-accent flex-shrink-0" />
                <span>Rücken & Trapezius focus</span>
              </div>
              <span className="text-[9px] text-fit-accent font-semibold mt-1">Regeneration 100% abgeschlossen</span>
            </div>
          </div>
        </div>

        {/* Dynamic Goal Selector */}
        <div className="md:col-span-4 card p-6 bg-fit-card border border-fit-line flex flex-col justify-between">
          <div className="label-caps !mb-4 flex items-center gap-2">
            <Award size={16} className="text-fit-accent" />
            Fokus-Ziel festlegen
          </div>
          <div className="space-y-2.5">
            {[
              { id: 'strength', label: 'Maximalkraft (1-5 Reps)', desc: 'Fokus auf Neuronale Ansteuerung & Heavy Singles', icon: Dumbbell },
              { id: 'hypertrophy', label: 'Hypertrophie (6-12 Reps)', desc: 'Optimales Muskelvolumen & Metabolische Last', icon: Flame },
              { id: 'endurance', label: 'Kraftausdauer (12+ Reps)', desc: 'Kapillarisierung & Deload Regeneration', icon: Activity },
            ].map((g) => {
              const Icon = g.icon;
              const active = trainingGoal === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setTrainingGoal(g.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    active
                      ? 'bg-fit-accent/10 border-fit-accent text-fit-ink shadow-md'
                      : 'bg-fit-bg2 border-fit-line text-fit-dim hover:text-fit-ink hover:border-fit-line/80'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-fit-accent mt-0.5' : 'text-fit-dim mt-0.5'} />
                  <div>
                    <div className="text-xs font-bold">{g.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5 leading-snug">{g.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1RM & PR Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calculator Control Panel */}
        <div className="lg:col-span-5 card p-8 border border-fit-line/60 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-fit-line pb-4">
            <div className="label-caps flex items-center gap-2 !mb-0">
              <Dumbbell size={16} className="text-fit-accent" />
              1RM & PR Rechner
            </div>
            <button
              onClick={() => {
                setWeight(selectedPreset.defaultWeight);
                setReps(selectedPreset.defaultReps);
              }}
              className="text-fit-dim hover:text-fit-accent text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Exercise Presets Chips */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-fit-dim block mb-2">
              Übung wählen
            </label>
            <div className="flex flex-wrap gap-2">
              {EXERCISE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    selectedPreset.id === p.id
                      ? 'bg-fit-accent text-black border-fit-accent shadow-sm'
                      : 'bg-fit-bg2 border-fit-line text-fit-dim hover:text-fit-ink'
                  }`}
                >
                  {p.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Weight & Rep Inputs */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-fit-ink mb-1.5">
                <span>Gewicht (kg)</span>
                <span className="text-fit-accent font-black text-sm">{weight} kg</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="2.5"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-fit-accent cursor-pointer h-2 bg-fit-bg2 rounded-lg"
              />
              <div className="flex justify-between text-[9px] font-bold text-fit-dim mt-1">
                <span>10 kg</span>
                <span>150 kg</span>
                <span>300 kg</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-fit-ink mb-1.5">
                <span>Wiederholungen (Reps)</span>
                <span className="text-fit-accent font-black text-sm">{reps} Reps</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full accent-fit-accent cursor-pointer h-2 bg-fit-bg2 rounded-lg"
              />
              <div className="flex justify-between text-[9px] font-bold text-fit-dim mt-1">
                <span>1 Rep</span>
                <span>10 Reps</span>
                <span>20 Reps</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-fit-ink mb-1.5">
                <span>Ziel-RPE (Anstrengungs-Skala)</span>
                <span className="text-fit-accent font-black text-sm">RPE {rpe}</span>
              </div>
              <input
                type="range"
                min="6"
                max="10"
                step="0.5"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full accent-fit-accent cursor-pointer h-2 bg-fit-bg2 rounded-lg"
              />
              <div className="flex justify-between text-[9px] font-bold text-fit-dim mt-1">
                <span>RPE 6 (4 RIR)</span>
                <span>RPE 8 (2 RIR)</span>
                <span>RPE 10 (0 RIR / Max)</span>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-fit-accent/15 via-fit-bg2 to-fit-card border border-fit-accent/40 shadow-md space-y-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-fit-dim">Berechnetes Max (1RM Consensus)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-fit-ink">{calc1RM.avg}</span>
              <span className="text-sm font-black text-fit-accent uppercase">kg</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-fit-line/40 text-center">
              <div>
                <span className="text-[9px] font-bold text-fit-dim block">Epley</span>
                <span className="text-xs font-black text-fit-ink">{calc1RM.epley} kg</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-fit-dim block">Brzycki</span>
                <span className="text-xs font-black text-fit-ink">{calc1RM.brzycki} kg</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-fit-dim block">Wathan</span>
                <span className="text-xs font-black text-fit-ink">{calc1RM.wathan} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1RM Spectrum Table & Load Zones */}
        <div className="lg:col-span-7 card p-8 border border-fit-line/60 shadow-lg space-y-6">
          <div className="label-caps flex items-center gap-2 !mb-0">
            <Layers size={16} className="text-fit-accent" />
            Prozentuales Last- & Rep-Spektrum
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-fit-line text-[10px] font-black uppercase tracking-widest text-fit-dim">
                  <th className="py-3 px-3">Intensität</th>
                  <th className="py-3 px-3">Ziel-Reps</th>
                  <th className="py-3 px-3">Last (kg)</th>
                  <th className="py-3 px-3">Einsatzbereich</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fit-line/40 text-xs font-bold">
                {percentageSpectrum.map((row) => (
                  <tr key={row.pct} className="hover:bg-fit-bg2/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 rounded-lg bg-fit-accent/10 text-fit-accent text-[11px] font-black border border-fit-accent/20">
                        {row.pct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-fit-ink font-extrabold">{row.reps}</td>
                    <td className="py-3 px-3 text-fit-accent font-black text-sm">{row.weight} kg</td>
                    <td className="py-3 px-3 text-fit-dim text-[11px] font-medium">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RPE Guidance Note */}
          <div className="p-4 rounded-2xl bg-fit-bg2 border border-fit-line text-xs space-y-1">
            <div className="font-black text-fit-ink flex items-center gap-1.5">
              <Sparkles size={14} className="text-fit-accent" />
              RPE {rpe} Coaching Note:
            </div>
            <p className="text-fit-dim leading-relaxed text-[11px]">
              Bei einheitlicher RPE {rpe} empfehlen wir einen Arbeitsbereich von{' '}
              <strong className="text-fit-ink font-bold">
                {Math.round(calc1RM.avg * (0.85 - (10 - rpe) * 0.025))} - {Math.round(calc1RM.avg * (0.90 - (10 - rpe) * 0.025))} kg
              </strong>{' '}
              für saubere Sätze mit kontrollierter Exzentrik.
            </p>
          </div>
        </div>
      </div>

      {/* Muscle Recovery Status Matrix */}
      <div className="card p-8 border border-fit-line/60 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <div className="label-caps flex items-center gap-2 !mb-0">
            <Activity size={16} className="text-fit-accent" />
            Muskulärer Regenerations-Status (Matrix)
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-fit-dim">6 Hauptgruppen</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {muscleStatuses.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-fit-bg2 border border-fit-line hover:border-fit-accent/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <div className="text-xs font-black text-fit-ink group-hover:text-fit-accent transition-colors">
                      {m.name.split(' (')[0]}
                    </div>
                    <div className="text-[9px] font-semibold text-fit-dim">Letztes Training: vor {m.hoursAgo}h</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${m.statusColor}`}>
                  {m.pct}%
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[9px] font-bold text-fit-dim mb-1">
                  <span>Regeneration</span>
                  <span>{m.hoursRemaining > 0 ? `Noch ~${m.hoursRemaining}h` : 'Bereit'}</span>
                </div>
                <div className="w-full bg-fit-line/50 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      m.pct < 50 ? 'bg-fit-red' : m.pct < 85 ? 'bg-amber-400' : 'bg-fit-accent'
                    }`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
