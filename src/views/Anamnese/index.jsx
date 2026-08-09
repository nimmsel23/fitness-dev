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
          <div className="text-[10px] font-black uppercase tracking-widest text-fit-accent">{tag}</div>
          <h3 className="text-xl font-black text-fit-ink">{title}</h3>
          <p className="text-xs font-semibold text-fit-ink/60">{subtitle}</p>
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
              Der Code als Spiegel: Real · Raw · Relevant · Results.
            </p>
          </div>
        </div>
      </header>

      {/* REAL — The Facts */}
      <Category
        icon={Dumbbell}
        tag="Real"
        title="Fakten & Status"
        subtitle="Die ungeschminkte Wahrheit über deinen Körper und Alltag. Keine Ausreden, kein Schönreden."
        quote="Accepting the raw facts of where we are takes courage. Strip away the excuses."
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
          <label className={labelCls}>Aktuelle Trainingsform & Realität des Körpers</label>
          <textarea
            rows={3}
            value={trainingType}
            placeholder="What does your body say about you? Are you fat or fit? What are you actually doing right now?"
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

      {/* RAW — The Fuel */}
      <Category
        icon={Waves}
        tag="Raw"
        title="Energie, Schmerz & Physis"
        subtitle="Ungefilterte Bestandsaufnahme deiner Energie und deines biologischen Status. Schmerz ist Energie, wenn man ihn nutzt."
        quote="Every feeling is a part of your unique story, pushing you toward growth, understanding, and transcendence."
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
            placeholder="Dark Feelings & Physical Pain: Where is the pain? Schulter, Knie, Rücken? Use it as fuel."
            onChange={(e) => setPainNotes(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Beweglichkeit & Einschränkungen</label>
          <textarea
            rows={2}
            value={mobilityNotes}
            placeholder="Where is the body blocked or static? What limits your movement right now?"
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
              placeholder="Systemic conditions, heart, lung, metabolism notes..."
              onChange={(e) => setChronicConditions(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Verletzungen / Operationen (Historie)</label>
            <textarea
              rows={2}
              value={injuries}
              placeholder="Structural damage: Broken bones, surgeries, torn ligaments..."
              onChange={(e) => setInjuries(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Medikamente (Trainingsbeeinflussend)</label>
            <textarea
              rows={2}
              value={medications}
              placeholder="Beta blockers, asthma spray, insulin, or other regular chemical input..."
              onChange={(e) => setMedications(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Ärztliche Hinweise & Freigaben</label>
            <textarea
              rows={2}
              value={medicalClearanceNotes}
              placeholder="Has a doctor set hard limits or cleared you fully for heavy loading?"
              onChange={(e) => setMedicalClearanceNotes(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </Category>

      {/* RELEVANT — The Focus */}
      <Category
        icon={Target}
        tag="Relevant"
        title="Zielsetzung & Fokus"
        subtitle="Konzentriere deine Kräfte wie einen Laser. Alles Unwichtige wegschneiden."
        quote="Focus is the tool that separates the essential from the trivial. Grab destructive stories by the throat."
        accent="border-t-fit-accent"
      >
        <div>
          <label className={labelCls}>Primärer Fokus (Laser-Ziel)</label>
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
            placeholder="Narrowing down: Which specific targets matter? 10 strict pull-ups, pain-free squatting? Replace old stories with a lethal focus."
            onChange={(e) => setSecondaryGoal(e.target.value)}
            className={inputCls}
          />
        </div>
      </Category>

      {/* RESULTS — The Fruit */}
      <Category
        icon={ScanSearch}
        tag="Results"
        title="Ergebnisse & Review"
        subtitle="Die Ergebnisse lügen nicht. Dein Körper und dein Training sind das exakte Produkt deiner Handlungen."
        quote="By their fruit, you shall know them. Results are the ultimate measure of character and commitment."
        accent="border-t-fit-dim"
      >
        <div>
          <label className={labelCls}>Was bringt aktuell echte Ergebnisse?</label>
          <textarea
            rows={3}
            value={trainingWorking}
            placeholder="The Sweet Fruit: What actions, patterns, or exercises actually work and produce measurable outcomes?"
            onChange={(e) => setTrainingWorking(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Wo mangelt es an Ergebnissen / Wo sind Ausreden?</label>
          <textarea
            rows={3}
            value={trainingNotWorking}
            placeholder="The Bitter or Barren Fruit: Where have excuses or lack of focus blocked your progress? Why did commitments fail?"
            onChange={(e) => setTrainingNotWorking(e.target.value)}
            className={inputCls}
          />
        </div>
      </Category>

      <p className="text-[10px] font-bold opacity-30 leading-relaxed text-center max-w-2xl mx-auto uppercase tracking-wider">
        Diese Anamnese dient als Fundament für deinen Trainingsfokus und Coach-Auswertungen. 
        Sie ist der ungeschönte Blick in den Spiegel, keine medizinische Diagnose.
      </p>

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

