import { useState } from "react";
import {
  ClipboardList, PauseCircle, ShieldCheck, Swords, Zap, Save, Check,
} from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import { updateUserProfile } from "@db";

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
    trainingType, setTrainingType,
    fitnessGoal, setFitnessGoal,
    injuries, setInjuries,
    medicalClearanceNotes, setMedicalClearanceNotes,
    trainingNotWorking, setTrainingNotWorking,
    submitFacts, setSubmitFacts,
    submitFeelings, setSubmitFeelings,
    submitFocus, setSubmitFocus,
    submitFruit, setSubmitFruit,
    warStackTitle, setWarStackTitle,
    warStackDomain, setWarStackDomain,
    warStackSubdomain, setWarStackSubdomain,
    warStackDoor, setWarStackDoor,
    warStackTrigger, setWarStackTrigger,
    warStackNarrative, setWarStackNarrative,
    warStackValidation, setWarStackValidation,
    warStackImpact, setWarStackImpact,
    warStackConsequences, setWarStackConsequences,
    warStackInsights, setWarStackInsights,
    warStackLesson, setWarStackLesson,
  } = useUser();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const success = await updateUserProfile(user.uid, {
      trainingType,
      fitnessGoal,
      injuries,
      medicalClearanceNotes,
      trainingNotWorking,
      submitFacts,
      submitFeelings,
      submitFocus,
      submitFruit,
      warStackTitle,
      warStackDomain,
      warStackSubdomain,
      warStackDoor,
      warStackTrigger,
      warStackNarrative,
      warStackValidation,
      warStackImpact,
      warStackConsequences,
      warStackInsights,
      warStackLesson,
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
        subtitle="pausa"
        accent="border-t-fit-accent"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>TITLE · titulus</div>
            <textarea
              rows={3}
              value={warStackTitle}
              placeholder="What do you call this? / Wie nennst du das?"
              onChange={(e) => setWarStackTitle(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>DOMAIN · dominium</div>
            <textarea
              rows={3}
              value={warStackDomain}
              placeholder="What part of life does this belong to? / Wohin gehört das in deinem Leben?"
              onChange={(e) => setWarStackDomain(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>SUB-DOMAIN · subdominium</div>
            <textarea
              rows={3}
              value={warStackSubdomain}
              placeholder="What is the deeper layer here? / Was ist die tiefere Schicht darunter?"
              onChange={(e) => setWarStackSubdomain(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>THRESHOLD · porta</div>
            <textarea
              rows={3}
              value={warStackDoor}
              placeholder="What is the threshold you are trying to cross? / Welche Schwelle versuchst du zu überschreiten?"
              onChange={(e) => setWarStackDoor(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <textarea
          rows={6}
          value={trainingType}
          placeholder="What is actually going on right now? / Was geht gerade wirklich ab?"
          onChange={(e) => setTrainingType(e.target.value)}
          className={inputCls}
        />
      </Category>

      {/* SUBMIT */}
      <Category
        icon={ShieldCheck}
        title="SUBMIT"
        subtitle="submissio"
        accent="border-t-fit-dim"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>FACTS · facta</div>
            <textarea
              rows={4}
              value={submitFacts}
              placeholder="What are the undeniable realities of your current situation? / Was sind die unbestreitbaren Tatsachen?"
              onChange={(e) => setSubmitFacts(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>FEELINGS · sensus</div>
            <textarea
              rows={4}
              value={submitFeelings}
              placeholder="How do you truly feel about these facts? / Wie fühlst du dich dazu wirklich?"
              onChange={(e) => setSubmitFeelings(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>FOCUS · focus</div>
            <textarea
              rows={4}
              value={submitFocus}
              placeholder="What has been your mindset toward these facts and feelings? / Wie war dein Fokus gegenüber diesen Fakten und Gefühlen?"
              onChange={(e) => setSubmitFocus(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-fit-line/60 bg-fit-bg2/60 p-4">
            <div className={miniCls}>FRUIT · fructus</div>
            <textarea
              rows={4}
              value={submitFruit}
              placeholder="What results or outcomes have you gotten from this mindset? / Welche Resultate kamen daraus?"
              onChange={(e) => setSubmitFruit(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </Category>

      {/* STRUGGLE */}
      <Category
        icon={Swords}
        title="STRUGGLE"
        subtitle="lucta"
        accent="border-t-fit-accent"
      >
        <textarea
          rows={4}
          value={warStackTrigger}
          placeholder="What person or event set this in motion? / Welcher Mensch oder welches Ereignis hat das in Bewegung gesetzt?"
          onChange={(e) => setWarStackTrigger(e.target.value)}
          className={inputCls}
        />

        <textarea
          rows={4}
          value={injuries}
          placeholder="What are you wrestling with right now? / Womit ringst du gerade wirklich?"
          onChange={(e) => setInjuries(e.target.value)}
          className={inputCls}
        />

        <textarea
          rows={4}
          value={warStackNarrative}
          placeholder="What story are you currently telling yourself about this? / Welche Geschichte erzählst du dir dazu gerade?"
          onChange={(e) => setWarStackNarrative(e.target.value)}
          className={inputCls}
        />

        <textarea
          rows={4}
          value={warStackValidation}
          placeholder="Why does this feel necessary? / Warum fühlt sich das notwendig an?"
          onChange={(e) => setWarStackValidation(e.target.value)}
          className={inputCls}
        />
      </Category>

      {/* STRIKE */}
      <Category
        icon={Zap}
        title="STRIKE"
        subtitle="ictus"
        accent="border-t-fit-dim"
      >
        <textarea
          rows={4}
          value={fitnessGoal}
          placeholder="What are you moving toward? / Worauf gehst du konkret zu?"
          onChange={(e) => setFitnessGoal(e.target.value)}
          className={inputCls}
        />

        <textarea
          rows={4}
          value={warStackImpact}
          placeholder="What would change if this opened? / Was verändert sich, wenn sich das öffnet?"
          onChange={(e) => setWarStackImpact(e.target.value)}
          className={inputCls}
        />

        <textarea
          rows={4}
          value={warStackConsequences}
          placeholder="What happens if this stays closed? / Was passiert, wenn das geschlossen bleibt?"
          onChange={(e) => setWarStackConsequences(e.target.value)}
          className={inputCls}
        />

        <textarea
          rows={4}
          value={trainingNotWorking}
          placeholder="What would prove progress? / Woran würdest du Fortschritt erkennen?"
          onChange={(e) => setTrainingNotWorking(e.target.value)}
          className={inputCls}
        />

        <textarea
          rows={4}
          value={medicalClearanceNotes}
          placeholder="What is the next clear move? / Was ist der nächste klare Move?"
          onChange={(e) => setMedicalClearanceNotes(e.target.value)}
          className={inputCls}
        />

        <textarea
          rows={4}
          value={warStackInsights}
          placeholder="What new realizations have come to light? / Welche Einsichten sind aufgetaucht?"
          onChange={(e) => setWarStackInsights(e.target.value)}
          className={inputCls}
        />

        <textarea
          rows={4}
          value={warStackLesson}
          placeholder="What is the most important lesson this stack has taught you? / Was ist die wichtigste Lektion?"
          onChange={(e) => setWarStackLesson(e.target.value)}
          className={inputCls}
        />
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
