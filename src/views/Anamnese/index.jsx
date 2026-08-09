import { useState } from "react";
import {
  ClipboardList, PauseCircle, ShieldCheck, Swords, Zap, Save, Check,
} from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import { updateUserProfile } from "@db";

const labelCls = "text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 ml-1 block text-fit-ink";
const inputCls = "w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-bold text-fit-ink focus:border-fit-accent outline-none transition-colors placeholder:text-fit-ink/20";
const miniCls = "text-[10px] font-black uppercase tracking-[0.25em] text-fit-accent/70";

function Category({ icon: Icon, title, subtitle, accent, children }) {
  return (
    <section className={`card p-8 space-y-6 border-t-4 ${accent} animate-in fade-in slide-in-from-top-4 duration-500`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-fit-accent/10 flex items-center justify-center shrink-0 mt-1">
          <Icon size={20} className="text-fit-accent" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-fit-ink">{title}</h3>
          {subtitle && <p className="text-xs font-semibold text-fit-ink/60">{subtitle}</p>}
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
            <p className="text-sm font-medium opacity-40">REAL. RAW. RELEVANT. RESULTS.</p>
          </div>
        </div>
      </header>

      {/* STOP */}
      <Category
        icon={PauseCircle}
        title="STOP"
        subtitle="Pause the pattern. Name the current reality."
        accent="border-t-fit-accent"
      >
        <div>
          <label className={labelCls}>Pattern</label>
          <textarea
            rows={3}
            value={trainingExperience}
            placeholder="What keeps repeating?"
            onChange={(e) => setTrainingExperience(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Reality</label>
          <textarea
            rows={3}
            value={trainingType}
            placeholder="What is actually going on with your body and training right now?"
            onChange={(e) => setTrainingType(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Pressure</label>
          <textarea
            rows={3}
            value={activityLevel}
            placeholder="What is pressing on you from outside?"
            onChange={(e) => setActivityLevel(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Rhythm</label>
          <textarea
            rows={3}
            value={trainingFrequency}
            placeholder="What does your current rhythm actually look like?"
            onChange={(e) => setTrainingFrequency(e.target.value)}
            className={inputCls}
          />
        </div>
      </Category>

      {/* SUBMIT */}
      <Category
        icon={ShieldCheck}
        title="SUBMIT"
        subtitle="Radical honesty through facts, feelings, focus, and fruit."
        accent="border-t-fit-dim"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>FACTS</div>
            <textarea
              rows={4}
              value={painNotes}
              placeholder="What are the undeniable realities of your current situation?"
              onChange={(e) => setPainNotes(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>FEELINGS</div>
            <textarea
              rows={4}
              value={energyLevel}
              placeholder="How do you actually feel about these facts?"
              onChange={(e) => setEnergyLevel(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>FOCUS</div>
            <textarea
              rows={4}
              value={secondaryGoal}
              placeholder="What has been your mindset toward these facts and feelings?"
              onChange={(e) => setSecondaryGoal(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>FRUIT</div>
            <textarea
              rows={4}
              value={trainingWorking}
              placeholder="What results or outcomes have you gotten from this mindset?"
              onChange={(e) => setTrainingWorking(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </Category>

      {/* STRUGGLE */}
      <Category
        icon={Swords}
        title="STRUGGLE"
        subtitle="Name the friction instead of hiding it."
        accent="border-t-fit-accent"
      >
        <textarea
          rows={4}
          value={injuries}
          placeholder="What are you wrestling with right now? Pain, resistance, fear, inconsistency, avoidance, shame, frustration..."
          onChange={(e) => setInjuries(e.target.value)}
          className={inputCls}
        />

        <textarea
          rows={4}
          value={medications}
          placeholder="What story are you telling yourself that keeps this pattern alive?"
          onChange={(e) => setMedications(e.target.value)}
          className={inputCls}
        />
      </Category>

      {/* STRIKE */}
      <Category
        icon={Zap}
        title="STRIKE"
        subtitle="Define the target and the next clear move."
        accent="border-t-fit-dim"
      >
        <div>
          <label className={labelCls}>Target</label>
          <textarea
            rows={3}
            value={fitnessGoal}
            placeholder="What are you moving toward?"
            onChange={(e) => setFitnessGoal(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Proof</label>
          <textarea
            rows={3}
            value={trainingNotWorking}
            placeholder="What would prove progress?"
            onChange={(e) => setTrainingNotWorking(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Next move</label>
          <textarea
            rows={3}
            value={medicalClearanceNotes}
            placeholder="What is the next clear move?"
            onChange={(e) => setMedicalClearanceNotes(e.target.value)}
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
