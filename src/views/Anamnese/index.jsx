import { useState } from "react";
import {
  ClipboardList, Dumbbell, Waves, Target, ScanSearch, Save, Check,
} from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import { updateUserProfile } from "@db";

const labelCls = "text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 ml-1 block text-fit-ink";
const inputCls = "w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-bold text-fit-ink focus:border-fit-accent outline-none transition-colors placeholder:text-fit-ink/20";

function Category({ icon: Icon, tag, title, subtitle, quote, accent, children }) {
  return (
    <section className={`card p-8 space-y-6 border-t-4 ${accent} animate-in fade-in slide-in-from-top-4 duration-500`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-fit-accent/10 flex items-center justify-center shrink-0 mt-1">
          <Icon size={20} className="text-fit-accent" />
        </div>
        <div className="space-y-1">
          {tag && <div className="text-[10px] font-black uppercase tracking-widest text-fit-accent">{tag}</div>}
          <h3 className="text-xl font-black text-fit-ink">{title}</h3>
          {subtitle && <p className="text-xs font-semibold text-fit-ink/60">{subtitle}</p>}
          {quote && (
            <p className="text-[10px] font-black uppercase tracking-widest text-fit-dim italic mt-2 border-l-2 border-fit-line pl-2 opacity-80">
              "{quote}"
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export default function Anamnese() {
  const {
    user,
    trainingExperience, setTrainingExperience,
    trainingFrequency, setTrainingFrequency,
    trainingType, setTrainingType,
    activityLevel, setActivityLevel,
    fitnessGoal, setFitnessGoal,
    secondaryGoal, setSecondaryGoal,
    energyLevel, setEnergyLevel,
    recoveryQuality, setRecoveryQuality,
    painNotes, setPainNotes,
    mobilityNotes, setMobilityNotes,
    chronicConditions, setChronicConditions,
    injuries, setInjuries,
    medications, setMedications,
    medicalClearanceNotes, setMedicalClearanceNotes,
    trainingWorking, setTrainingWorking,
    trainingNotWorking, setTrainingNotWorking,
  } = useUser();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const success = await updateUserProfile(user.uid, {
      trainingExperience, trainingFrequency, trainingType, activityLevel,
      fitnessGoal, secondaryGoal,
      energyLevel, recoveryQuality, painNotes, mobilityNotes,
      chronicConditions, injuries, medications, medicalClearanceNotes,
      trainingWorking, trainingNotWorking,
    });
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto">
      <header className="mb-4 animate-in fade-in duration-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fit-accent/10 flex items-center justify-center shrink-0">
            <ClipboardList size={20} className="text-fit-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-fit-ink">Anamnese</h2>
            <p className="text-sm font-medium opacity-40">
              REAL RAW RELEVANT RESULTS
            </p>
          </div>
        </div>
      </header>

      {/* REAL + FACTS */}
      <Category
        icon={Dumbbell}
        title="REAL"
        accent="border-t-fit-accent"
      >
        <div>
          <label className={labelCls}>Training age</label>
          <select value={trainingExperience} onChange={(e) => setTrainingExperience(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="beginner">Einsteiger (Beginner)</option>
            <option value="returning">Wiedereinsteiger (Returning)</option>
            <option value="intermediate">Fortgeschritten (Intermediate)</option>
            <option value="advanced">Sehr erfahren (Advanced)</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Training frequency</label>
          <select value={trainingFrequency} onChange={(e) => setTrainingFrequency(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="none">Aktuell kein Training (0/week)</option>
            <option value="1">1× pro Woche</option>
            <option value="2">2× pro Woche</option>
            <option value="3">3× pro Woche</option>
            <option value="4">4× pro Woche</option>
            <option value="5_plus">5× oder häufiger</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Current reality</label>
          <textarea
            rows={3}
            value={trainingType}
            placeholder="What does your body say about you? Are you fat or fit?"
            onChange={(e) => setTrainingType(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Daily activity</label>
          <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="low">Überwiegend sitzend (Sedentary)</option>
            <option value="moderate">Mäßig aktiv (Moderate)</option>
            <option value="active">Aktiver Alltag (Active)</option>
            <option value="very_active">Körperlich sehr aktiv (Heavy labor)</option>
          </select>
        </div>
      </Category>

      {/* RAW + FEELINGS */}
      <Category
        icon={Waves}
        title="RAW"
        accent="border-t-fit-dim"
      >
        <div>
          <label className={labelCls}>Energy</label>
          <select value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="low">Eher niedrig (Low fuel)</option>
            <option value="variable">Stark schwankend (Variable)</option>
            <option value="good">Gut (Solid)</option>
            <option value="high">Sehr gut (Full tank)</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Recovery</label>
          <select value={recoveryQuality} onChange={(e) => setRecoveryQuality(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="poor">Schlecht (Lagging recovery)</option>
            <option value="variable">Schwankend (Inconsistent)</option>
            <option value="good">Gut (Reliable)</option>
            <option value="very_good">Sehr gut (Fast adaptation)</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Pain / issues</label>
          <textarea
            rows={2}
            value={painNotes}
            placeholder="Shoulder, knee, back, neck..."
            onChange={(e) => setPainNotes(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Limitations</label>
          <textarea
            rows={2}
            value={mobilityNotes}
            placeholder="Mobility, stiffness, weakness, restrictions..."
            onChange={(e) => setMobilityNotes(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="border-t border-fit-line/50 pt-4 grid gap-4">
          <div>
            <label className={labelCls}>Conditions</label>
            <textarea
              rows={2}
              value={chronicConditions}
              placeholder="Asthma, diabetes, hypertension..."
              onChange={(e) => setChronicConditions(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Injuries / surgeries</label>
            <textarea
              rows={2}
              value={injuries}
              placeholder="ACL, shoulder, back, fracture..."
              onChange={(e) => setInjuries(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Medication</label>
            <textarea
              rows={2}
              value={medications}
              placeholder="Pain meds, inhaler, insulin..."
              onChange={(e) => setMedications(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Medical notes</label>
            <textarea
              rows={2}
              value={medicalClearanceNotes}
              placeholder="Restrictions, clearance, imaging..."
              onChange={(e) => setMedicalClearanceNotes(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </Category>

      {/* RELEVANT + FOCUS */}
      <Category
        icon={Target}
        title="RELEVANT"
        accent="border-t-fit-accent"
      >
        <div>
          <label className={labelCls}>Main goal</label>
          <select value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="strength">Kraft steigern (Strength)</option>
            <option value="muscle">Muskelaufbau (Hypertrophy)</option>
            <option value="fat_loss">Körperfett reduzieren (Leanness)</option>
            <option value="endurance">Ausdauer verbessern (Conditioning)</option>
            <option value="mobility">Beweglichkeit (Mobility)</option>
            <option value="health">Prävention / Vitalität (Longevity)</option>
            <option value="performance">Sportliche Leistung (Athletic Power)</option>
            <option value="daily_function">Dominanz im Alltag (Dominion)</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Why this goal?</label>
          <textarea
            rows={3}
            value={secondaryGoal}
            placeholder="Why now? What matters about it?"
            onChange={(e) => setSecondaryGoal(e.target.value)}
            className={inputCls}
          />
        </div>
      </Category>

      {/* RESULTS + FRUIT */}
      <Category
        icon={ScanSearch}
        title="RESULTS"
        accent="border-t-fit-dim"
      >
        <div>
          <label className={labelCls}>Proof</label>
          <textarea
            rows={3}
            value={trainingWorking}
            placeholder="What would prove progress?"
            onChange={(e) => setTrainingWorking(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Obstacle</label>
          <textarea
            rows={3}
            value={trainingNotWorking}
            placeholder="What is in the way right now?"
            onChange={(e) => setTrainingNotWorking(e.target.value)}
            className={inputCls}
            />
        </div>
      </Category>

      <button
        onClick={handleSave}
        disabled={saving || !user}
        className="w-full max-w-md mx-auto flex items-center justify-center gap-2 px-4 py-4 bg-fit-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {saving ? (
          <span className="animate-pulse">Speichert in Cloud...</span>
        ) : saved ? (
          <>
            <Check size={14} /> Cloud synchronisiert
          </>
        ) : (
          <>
            <Save size={14} /> Anamnese sichern
          </>
        )}
      </button>
    </div>
  );
}
