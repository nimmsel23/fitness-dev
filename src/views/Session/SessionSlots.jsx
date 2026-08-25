/**
 * SessionSlots — frei belegbare Sub-Einheiten innerhalb einer Session.
 *
 * Additiv zum bestehenden ActivityAddon-Finisher: der User legt selbst fest,
 * ob/welche Slots er nutzt (Exercises-Block, Activity, Notiz). Leeres
 * `slots`-Array => diese Komponente rendert nichts, keine Verhaltensänderung.
 */

import { useEffect, useState } from 'react';
import { Plus, X, Save, ChevronDown, Pencil, Check } from 'lucide-react';
import ExerciseList from './ExerciseList';
import { ADDON_TYPES } from './ActivityAddon';
import { getSlotTemplates, saveSlotTemplate } from '@db';

const SLOT_TYPES = [
  { value: 'exercises', label: 'Übungen' },
  { value: 'activity',  label: 'Activity' },
  { value: 'note',      label: 'Notiz' },
];

function SlotCard({ slot, exercises, block, updateSlot, removeSlot, exerciseListProps }) {
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(slot.label || '');
  const [saved, setSaved] = useState(false);

  async function handleSaveTemplate() {
    const template = {
      id: crypto.randomUUID(),
      block: block || '',
      label: slot.label,
      type: slot.type,
      ...(slot.type === 'activity' ? { activityType: slot.activityType } : {}),
      ...(slot.type === 'exercises' ? {
        exercises: exercises.map(ex => ({
          id: ex.id, name: ex.name,
          primaryMuscles: ex.primaryMuscles, secondaryMuscles: ex.secondaryMuscles,
          stabilizers: ex.stabilizers, source: ex.source,
        })),
      } : {}),
    };
    await saveSlotTemplate(template);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-[24px] border border-fit-line bg-fit-card p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between gap-2">
        {editingLabel ? (
          <div className="flex-1 flex items-center gap-1.5">
            <input
              autoFocus
              value={labelDraft}
              onChange={e => setLabelDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (updateSlot(slot.id, { label: labelDraft }), setEditingLabel(false))}
              className="flex-1 px-2 py-1 rounded-lg bg-fit-bg2 border border-fit-line text-xs font-bold text-fit-ink outline-none"
            />
            <button onClick={() => { updateSlot(slot.id, { label: labelDraft }); setEditingLabel(false); }} className="text-fit-dim hover:text-fit-accent">
              <Check size={14} />
            </button>
          </div>
        ) : (
          <button onClick={() => { setLabelDraft(slot.label || ''); setEditingLabel(true); }} className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-fit-ink hover:text-fit-accent transition-colors">
            {slot.label || 'Slot'}
            <Pencil size={11} className="opacity-40" />
          </button>
        )}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleSaveTemplate}
            title="Als Baustein speichern"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-fit-dim hover:text-fit-accent hover:bg-fit-accent/10 transition-all"
          >
            {saved ? <Check size={13} /> : <Save size={13} />}
          </button>
          <button
            onClick={() => removeSlot(slot.id)}
            title="Slot entfernen"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-fit-dim hover:text-fit-red hover:bg-fit-red/10 transition-all"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {slot.type === 'exercises' && (
        <ExerciseList {...exerciseListProps} exercises={exercises} addEx={(ex) => exerciseListProps.addEx(ex, slot.id)} />
      )}

      {slot.type === 'activity' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {ADDON_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => updateSlot(slot.id, { activityType: t.value })}
                className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wide transition-all ${
                  (slot.activityType || 'hiit') === t.value
                    ? 'border-fit-orange bg-fit-orange/15 text-fit-orange'
                    : 'border-fit-line bg-fit-bg2 text-fit-dim hover:border-fit-orange/30'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="Dauer"
              value={slot.duration || ''}
              onChange={e => updateSlot(slot.id, { duration: e.target.value })}
              className="w-full p-3 pr-14 rounded-xl border bg-fit-bg2 border-fit-line text-fit-ink font-bold text-sm outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-fit-dim/30">min</span>
          </div>
        </div>
      )}

      {slot.type === 'note' && (
        <textarea
          value={slot.text || ''}
          onChange={e => updateSlot(slot.id, { text: e.target.value })}
          placeholder="Notiz..."
          rows={3}
          className="w-full p-3 rounded-xl border bg-fit-bg2 border-fit-line text-fit-ink text-sm outline-none resize-none"
        />
      )}
    </div>
  );
}

export default function SessionSlots({ slots = [], exercises = [], block, addSlot, removeSlot, updateSlot, ...exerciseListProps }) {
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState('exercises');
  const [newLabel, setNewLabel] = useState('');
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (!block) { setTemplates([]); return; }
    let alive = true;
    getSlotTemplates(block).then(t => { if (alive) setTemplates(t || []); }).catch(() => {});
    return () => { alive = false; };
  }, [block]);

  function handleAdd() {
    if (!newLabel.trim()) return;
    addSlot({ type: newType, label: newLabel.trim() });
    setNewLabel('');
    setNewType('exercises');
    setAdding(false);
  }

  async function handleUseTemplate(tpl) {
    const id = addSlot({
      type: tpl.type,
      label: tpl.label,
      ...(tpl.type === 'activity' ? { activityType: tpl.activityType } : {}),
    });
    if (tpl.type === 'exercises' && Array.isArray(tpl.exercises)) {
      for (const ex of tpl.exercises) {
        await exerciseListProps.addEx(ex, id);
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
                  <span className="text-[9px] font-black uppercase tracking-wide text-fit-dim opacity-50">{tpl.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {adding ? (
        <div className="rounded-2xl border border-dashed border-fit-line p-4 space-y-3">
          <div className="flex gap-1.5">
            {SLOT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setNewType(t.value)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${
                  newType === t.value ? 'bg-fit-accent/15 text-fit-accent border border-fit-accent' : 'bg-fit-bg2 text-fit-dim border border-fit-line'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            autoFocus
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Name des Slots (z.B. Warm-up)"
            className="w-full px-3 py-2.5 rounded-xl bg-fit-bg2 border border-fit-line text-sm font-bold text-fit-ink outline-none"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-fit-accent text-black text-xs font-bold">Slot anlegen</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2.5 rounded-xl bg-fit-bg2 border border-fit-line text-fit-dim text-xs font-bold">Abbrechen</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl border border-dashed border-fit-line text-fit-dim hover:border-fit-accent/40 hover:text-fit-accent hover:bg-fit-accent/5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200"
        >
          <Plus size={13} strokeWidth={3} />
          Slot hinzufügen
        </button>
      )}
    </div>
  );
}
