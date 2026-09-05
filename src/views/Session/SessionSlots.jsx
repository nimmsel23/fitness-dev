/**
 * SessionSlots — frei belegbare Sub-Einheiten innerhalb einer Session.
 *
 * Additiv zum bestehenden ActivityAddon-Finisher: der User legt selbst fest,
 * ob/welche Slots er nutzt (Exercises-Block, Activity, Notiz). Leeres
 * `slots`-Array => diese Komponente rendert nichts, keine Verhaltensänderung.
 */

import { useEffect, useState } from 'react';
import { Plus, X, Save, ChevronDown, Check } from 'lucide-react';
import ExerciseList from './ExerciseList';
import { ADDON_TYPES } from './ActivityAddon';
import { getSlotTemplates, saveSlotTemplate } from '@db';

function SlotCard({ slot, exercises, block, updateSlot, removeSlot, exerciseListProps }) {
  const [saved, setSaved] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const hasContent = exercises.length > 0 || !!slot.activityType || !!slot.text;

  // Der Slot selbst IST der Baustein: gespeichert wird 1:1, was der Slot
  // aktuell enthält (Übungen/Activity/Notiz beliebig kombiniert), nicht
  // ein einzelner exklusiver "Typ".
  async function handleSaveTemplate() {
    const template = {
      id: crypto.randomUUID(),
      block: block || '',
      label: slot.label,
      ...(exercises.length > 0 ? {
        exercises: exercises.map(ex => ({
          id: ex.id, name: ex.name,
          primaryMuscles: ex.primaryMuscles, secondaryMuscles: ex.secondaryMuscles,
          stabilizers: ex.stabilizers, source: ex.source,
        })),
      } : {}),
      ...(slot.activityType ? { activityType: slot.activityType, duration: slot.duration } : {}),
      ...(slot.text ? { text: slot.text } : {}),
    };
    await saveSlotTemplate(template);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-[24px] border border-fit-line bg-fit-card p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2">
        <input
          value={slot.label || ''}
          onChange={e => updateSlot(slot.id, { label: e.target.value })}
          placeholder="Slot"
          className="flex-1 min-w-0 bg-transparent text-[11px] font-black uppercase tracking-[0.15em] text-fit-ink outline-none"
        />
        {hasContent && (
          <button
            onClick={handleSaveTemplate}
            title="Als Baustein speichern"
            className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-fit-dim hover:text-fit-accent hover:bg-fit-accent/10 transition-all"
          >
            {saved ? <Check size={13} /> : <Save size={13} />}
          </button>
        )}
        <button
          onClick={() => removeSlot(slot.id)}
          title="Slot entfernen"
          className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-fit-dim hover:text-fit-red hover:bg-fit-red/10 transition-all"
        >
          <X size={13} />
        </button>
      </div>

      {/* Ein Slot ist eine Mini-Session: Übungen, Activity und Notiz sind
          unabhängig voneinander kombinierbar, nicht exklusiv nach `type`. */}
      <ExerciseList
        {...exerciseListProps}
        containerId={slot.id}
        exercises={exercises}
        exerciseOps={{
          ...exerciseListProps.exerciseOps,
          addEx: (ex) => exerciseListProps.exerciseOps.addEx(ex, slot.id),
        }}
      />

      {(showActivity || slot.activityType) && (
        <div className="flex gap-2">
          <select
            value={slot.activityType || 'hiit'}
            onChange={e => updateSlot(slot.id, { activityType: e.target.value })}
            className="flex-1 px-3 py-2.5 rounded-xl bg-fit-bg2 border border-fit-line text-fit-ink text-sm font-bold outline-none"
          >
            {ADDON_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min"
            value={slot.duration || ''}
            onChange={e => updateSlot(slot.id, { duration: e.target.value })}
            className="w-16 px-2 py-2.5 rounded-xl bg-fit-bg2 border border-fit-line text-fit-ink font-bold text-sm text-center outline-none"
          />
        </div>
      )}

      {(showNote || slot.text) && (
        <textarea
          autoFocus={showNote && !slot.text}
          value={slot.text || ''}
          onChange={e => updateSlot(slot.id, { text: e.target.value })}
          placeholder="Notiz..."
          rows={2}
          className="w-full p-3 rounded-xl border bg-fit-bg2 border-fit-line text-fit-ink text-sm outline-none resize-none"
        />
      )}

      {(!(showActivity || slot.activityType) || !(showNote || slot.text)) && (
        <div className="flex gap-4">
          {!(showActivity || slot.activityType) && (
            <button onClick={() => setShowActivity(true)} className="text-[10px] font-bold text-fit-dim hover:text-fit-accent transition-colors">
              + Activity
            </button>
          )}
          {!(showNote || slot.text) && (
            <button onClick={() => setShowNote(true)} className="text-[10px] font-bold text-fit-dim hover:text-fit-accent transition-colors">
              + Notiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function SessionSlots({ slots = [], exercises = [], block, addSlot, removeSlot, updateSlot, ...exerciseListProps }) {
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (!block) { setTemplates([]); return; }
    let alive = true;
    getSlotTemplates(block).then(t => { if (alive) setTemplates(t || []); }).catch(() => {});
    return () => { alive = false; };
  }, [block]);

  // Ein Klick legt sofort einen namenlosen Slot an — Umbenennen ist optional
  // und passiert direkt in der Slot-Karte selbst, kein Zwangs-Eingabefeld vorab.
  // Kein Auto-Timestamp: Sessions werden immer nachträglich geloggt, eine
  // "jetzt"-Uhrzeit beim Anlegen wäre erfunden, nicht die echte Trainingszeit.
  function handleAdd() {
    addSlot({ label: `Slot ${slots.length + 1}` });
  }

  // Baustein anwenden = Slot 1:1 aus der Vorlage nachbauen (Übungen +
  // Activity + Notiz, je nachdem was die Vorlage enthält).
  async function handleUseTemplate(tpl) {
    const id = addSlot({
      label: tpl.label,
      ...(tpl.activityType ? { activityType: tpl.activityType, duration: tpl.duration } : {}),
      ...(tpl.text ? { text: tpl.text } : {}),
    });
    if (Array.isArray(tpl.exercises)) {
      for (const ex of tpl.exercises) {
        await exerciseListProps.exerciseOps.addEx(ex, id);
      }
    }
    setShowTemplates(false);
  }

  const sorted = [...slots].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-3">
      {sorted.map(slot => (
        <SlotCard
          key={slot.id}
          slot={slot}
          block={block}
          exercises={exercises.filter(e => e.slotId === slot.id)}
          updateSlot={updateSlot}
          removeSlot={removeSlot}
          exerciseListProps={exerciseListProps}
        />
      ))}

      {templates.length > 0 && (
        <div>
          <button
            onClick={() => setShowTemplates(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-fit-dim hover:text-fit-ink transition-all"
          >
            <span>Aus deinen Bausteinen ({block})</span>
            <ChevronDown size={13} className={`transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
          </button>
          {showTemplates && (
            <div className="space-y-1.5 mt-1.5">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleUseTemplate(tpl)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-fit-bg2 border border-fit-line text-left hover:border-fit-accent/40 transition-all"
                >
                  <span className="text-xs font-bold text-fit-ink">{tpl.label}</span>
                  <span className="text-[9px] font-black uppercase tracking-wide text-fit-dim opacity-50">
                    {[
                      tpl.exercises?.length ? `${tpl.exercises.length} Übungen` : null,
                      tpl.activityType ? 'Activity' : null,
                      tpl.text ? 'Notiz' : null,
                    ].filter(Boolean).join(' · ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleAdd}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl border border-dashed border-fit-line text-fit-dim hover:border-fit-accent/40 hover:text-fit-accent hover:bg-fit-accent/5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200"
      >
        <Plus size={13} strokeWidth={3} />
        Slot hinzufügen
      </button>
    </div>
  );
}
