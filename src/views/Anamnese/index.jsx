import { useState } from "react";
import {
  ClipboardList, Dumbbell, Waves, Target, ScanSearch, Save, Check,
} from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import { updateUserProfile } from "@db";

const labelCls = "text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1 block";
const inputCls = "w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-bold text-fit-ink focus:border-fit-accent outline-none transition-colors";

function Category({ icon: Icon, tag, title, subtitle, accent, children }) {
  return (
    <section className={`card p-8 space-y-6 border-t-4 ${accent} animate-in fade-in slide-in-from-top-4 duration-500`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-fit-accent/10 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-fit-accent" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-fit-accent">{tag}</div>
          <h3 className="text-xl font-black text-fit-ink">{title}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-fit-dim">{subtitle}</p>
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
              Real · Raw · Relevant · Results — deine Trainings-Ausgangslage.
            </p>
          </div>
        </div>
      </header>

      {/* REAL — wo stehe ich aktuell tatsächlich */}
      <Category
        icon={Dumbbell}
        tag="Real"
        title="Trainingsstatus"
        subtitle="Wie trainiere ich aktuell — ohne Beschönigung?"
        accent="border-t-fit-accent"
      >
        <div>
          <label className={labelCls}>Trainingserfahrung</label>
          <select value={trainingExperience} onChange={(e) => setTrainingExperience(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="beginner">Einsteiger</option>
            <option value="returning">Wiedereinsteiger</option>
            <option value="intermediate">Fortgeschritten</option>
            <option value="advanced">Sehr erfahren</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Aktuelle Trainingshäufigkeit</label>
          <select value={trainingFrequency} onChange={(e) => setTrainingFrequency(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="none">Aktuell kein Training</option>
            <option value="1">1× pro Woche</option>
            <option value="2">2× pro Woche</option>
            <option value="3">3× pro Woche</option>
            <option value="4">4× pro Woche</option>
            <option value="5_plus">5× oder häufiger</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Aktuelle Trainingsform</label>
          <textarea
            rows={2}
            value={trainingType}
            placeholder="z.B. Krafttraining, Laufen, Calisthenics, Yoga, Vereinssport"
            onChange={(e) => setTrainingType(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Aktivitätsniveau im Alltag</label>
          <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="low">Überwiegend sitzend</option>
            <option value="moderate">Mäßig aktiv</option>
            <option value="active">Aktiver Alltag</option>
            <option value="very_active">Körperlich sehr aktiv</option>
          </select>
        </div>
      </Category>

      {/* RAW — ungefilterte Körper- und Gesundheitsdaten */}
      <Category
        icon={Waves}
        tag="Raw"
        title="Körper & Gesundheit"
        subtitle="Wie reagiert mein Körper — und welche Rahmenbedingungen gelten?"
        accent="border-t-fit-dim"
      >
        <div>
          <label className={labelCls}>Energie / körperliche Leistungsfähigkeit</label>
          <select value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="low">Eher niedrig</option>
            <option value="variable">Stark schwankend</option>
            <option value="good">Gut</option>
            <option value="high">Sehr gut</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Erholung zwischen Trainingseinheiten</label>
          <select value={recoveryQuality} onChange={(e) => setRecoveryQuality(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="poor">Schlecht</option>
            <option value="variable">Schwankend</option>
            <option value="good">Gut</option>
            <option value="very_good">Sehr gut</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Schmerzen / Beschwerden</label>
          <textarea
            rows={2}
            value={painNotes}
            placeholder="z.B. Schulter bei Überkopfbewegungen, Knie beim Treppensteigen"
            onChange={(e) => setPainNotes(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Beweglichkeit / Bewegungseinschränkungen</label>
          <textarea
            rows={2}
            value={mobilityNotes}
            placeholder="z.B. eingeschränkte Sprunggelenksmobilität, Probleme bei tiefer Kniebeuge"
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
              placeholder="z.B. Bluthochdruck, Diabetes, Asthma"
              onChange={(e) => setChronicConditions(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Verletzungen / Operationen</label>
            <textarea
              rows={2}
              value={injuries}
              placeholder="z.B. Kreuzbandverletzung 2022, Schulter-OP"
              onChange={(e) => setInjuries(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Medikamente (trainingsrelevant)</label>
            <textarea
              rows={2}
              value={medications}
              placeholder="z.B. Blutdruckmedikamente"
              onChange={(e) => setMedications(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Ärztliche Hinweise / Freigaben</label>
            <textarea
              rows={2}
              value={medicalClearanceNotes}
              placeholder="z.B. Belastung freigegeben, keine Sprungbelastung empfohlen"
              onChange={(e) => setMedicalClearanceNotes(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </Category>

      {/* RELEVANT — worauf es tatsächlich hinausläuft */}
      <Category
        icon={Target}
        tag="Relevant"
        title="Zielsetzung"
        subtitle="Wohin soll sich das Training entwickeln?"
        accent="border-t-fit-accent"
      >
        <div>
          <label className={labelCls}>Primäres Trainingsziel</label>
          <select value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)} className={inputCls}>
            <option value="">Keine Angabe</option>
            <option value="strength">Kraft steigern</option>
            <option value="muscle">Muskelaufbau</option>
            <option value="fat_loss">Körperfett reduzieren</option>
            <option value="endurance">Ausdauer verbessern</option>
            <option value="mobility">Beweglichkeit verbessern</option>
            <option value="health">Gesundheit / Prävention</option>
            <option value="performance">Sportliche Leistung</option>
            <option value="daily_function">Alltag belastbarer gestalten</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Weitere Ziele</label>
          <textarea
            rows={2}
            value={secondaryGoal}
            placeholder="z.B. schmerzfrei Kniebeugen, 10 Klimmzüge, bessere Haltung"
            onChange={(e) => setSecondaryGoal(e.target.value)}
            className={inputCls}
          />
        </div>
      </Category>

      {/* RESULTS — was zeigt sich in der Praxis */}
      <Category
        icon={ScanSearch}
        tag="Results"
        title="Review"
        subtitle="Was funktioniert, was nicht?"
        accent="border-t-fit-dim"
      >
        <div>
          <label className={labelCls}>Was funktioniert aktuell gut?</label>
          <textarea
            rows={3}
            value={trainingWorking}
            placeholder="Welche Übungen, Routinen oder Trainingsformen funktionieren bereits?"
            onChange={(e) => setTrainingWorking(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Was funktioniert aktuell nicht?</label>
          <textarea
            rows={3}
            value={trainingNotWorking}
            placeholder="Wo entstehen Probleme, Abbrüche, Schmerzen oder Hindernisse?"
            onChange={(e) => setTrainingNotWorking(e.target.value)}
            className={inputCls}
          />
        </div>
      </Category>

      <p className="text-[10px] font-bold opacity-30 leading-relaxed text-center max-w-2xl mx-auto">
        Alle Angaben sind optional und dienen als Kontext für Trainingsplanung
        und Coach-Auswertungen. Die Anamnese ersetzt keine medizinische
        Untersuchung oder Diagnose.
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
            <Save size={14} /> Anamnese speichern
          </>
        )}
      </button>
    </div>
  );
}
