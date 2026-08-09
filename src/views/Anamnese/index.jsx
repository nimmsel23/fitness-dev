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
        subtitle="FACTS"
        quote="Facing reality is tough, especially when it clashes with the stories we’ve told ourselves."
        accent="border-t-fit-accent"
      >
        <div>
          <label className={labelCls}>Trainingserfahrung</label>
          <select value={trainingExperience} onChange={(e) => setTrainingExperience(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="beginner">Einsteiger (Beginner)</option>
            <option value="returning">Wiedereinsteiger (Returning)</option>
            <option value="intermediate">Fortgeschritten (Intermediate)</option>
            <option value="advanced">Sehr erfahren (Advanced)</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Aktuelle Trainingshäufigkeit</label>
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
          <label className={labelCls}>Current training reality</label>
          <textarea
            rows={3}
            value={trainingType}
            placeholder="Accepting the raw facts of where we are takes courage."
            onChange={(e) => setTrainingType(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Aktivitätsniveau im Alltag</label>
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
        subtitle="FEELINGS"
        quote="Feelings are what give life movement and meaning."
        accent="border-t-fit-dim"
      >
        <div>
          <label className={labelCls}>Energie / Physische Kraft im Alltag</label>
          <select value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="low">Eher niedrig (Low fuel)</option>
            <option value="variable">Stark schwankend (Variable)</option>
            <option value="good">Gut (Solid)</option>
            <option value="high">Sehr gut (Full tank)</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Erholungskapazität</label>
          <select value={recoveryQuality} onChange={(e) => setRecoveryQuality(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="poor">Schlecht (Lagging recovery)</option>
            <option value="variable">Schwankend (Inconsistent)</option>
            <option value="good">Gut (Reliable)</option>
            <option value="very_good">Sehr gut (Fast adaptation)</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Schmerzen / Reibungspunkte</label>
          <textarea
            rows={2}
            value={painNotes}
            placeholder="When you blend facts and feelings, you tap into the full depth of the human experience."
            onChange={(e) => setPainNotes(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Beweglichkeit & Einschränkungen</label>
          <textarea
            rows={2}
            value={mobilityNotes}
            placeholder="Feelings are the winds that fill our sails, making life unpredictable but enriching."
            onChange={(e) => setMobilityNotes(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="border-t border-fit-line/50 pt-4 grid gap-4">
          <div>
            <label className={labelCls}>Chronische Erkrankungen</label>
            <textarea
              rows={2}
              value={chronicConditions}
              placeholder="Facts give us a solid foundation to understand the world, but feelings are what give life movement and meaning."
              onChange={(e) => setChronicConditions(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Verletzungen / Operationen (Historie)</label>
            <textarea
              rows={2}
              value={injuries}
              placeholder="Owning your facts gives you a solid foundation. Embracing your feelings adds depth and life."
              onChange={(e) => setInjuries(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Medikamente (Trainingsbeeinflussend)</label>
            <textarea
              rows={2}
              value={medications}
              placeholder="In life, facts and feelings are like the two steps in a dance."
              onChange={(e) => setMedications(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Ärztliche Hinweise & Freigaben</label>
            <textarea
              rows={2}
              value={medicalClearanceNotes}
              placeholder="The facts will set you free — but only if you’re willing to own them completely."
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
        subtitle="FOCUS"
        quote="Focus makes your facts and feelings relevant by zooming in on what truly matters."
        accent="border-t-fit-accent"
      >
        <div>
          <label className={labelCls}>Primary focus</label>
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
          <label className={labelCls}>Nebenziele & konkrete Performance-Targets</label>
          <textarea
            rows={3}
            value={secondaryGoal}
            placeholder="Focus is the spotlight that lights up your goals in the darkness of uncertainty."
            onChange={(e) => setSecondaryGoal(e.target.value)}
            className={inputCls}
          />
        </div>
      </Category>

      {/* RESULTS + FRUIT */}
      <Category
        icon={ScanSearch}
        title="RESULTS"
        subtitle="FRUIT"
        quote="Results are the mirror of our authenticity."
        accent="border-t-fit-dim"
      >
        <div>
          <label className={labelCls}>Was bringt aktuell echte Ergebnisse?</label>
          <textarea
            rows={3}
            value={trainingWorking}
            placeholder="By their fruit, you shall know them."
            onChange={(e) => setTrainingWorking(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Wo mangelt es an Ergebnissen / Wo sind Ausreden?</label>
          <textarea
            rows={3}
            value={trainingNotWorking}
            placeholder="Today’s society makes it easy to prioritize excuses over results."
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
