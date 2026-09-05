/**
 * SessionEditor — Main workout logging view.
 *
 * Assembles: DateStrip + SessionSwitcher + ModeSwitcher + ExerciseList + ActivityAddon + SessionSlots / ActivitySection
 * State comes entirely from useSession hook via props.
 * No inline history, no inline plan — those are separate sub-tabs.
 */

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import SessionGateSheet from './SessionGateSheet.jsx';
import SessionSlots from './SessionSlots.jsx';
import SessionHeader from './SessionHeader';
import SplitPicker from './SplitPicker';
import EffortPicker from './EffortPicker';
import ExerciseList from './ExerciseList';
import CardioSection from './CardioSection.jsx';
import ActivityAddon from './ActivityAddon';
import ActivityAddonHistory from './ActivityAddonHistory.jsx';
import SessionToast from './SessionToast.jsx';
import SessionSaveFab from './SessionSaveFab.jsx';
import SidebarSheet from './SidebarSheet';
import SessionSidebar from './SessionSidebar';
import SourceSettingsModal from './SourceSettingsModal';
import { normalizeSessionGate } from '../../lib/sessionGate.js';
import { inferBlockFromExercises } from './utils';

export default function SessionEditor({
  // State from useSession
  date, setDate,
  sessionMode, setSessionMode,
  block, setBlock,
  exercises,
  effort, setEffort,
  location, setLocation,
  duration, setDuration,
  trainingsart, setTrainingsart,
  notes, setNotes,
  coachFeedback,
  saving, dirty, autoSaveLabel,
  restHours,
  activity, setActivity,
  hasActivity, setHasActivity,
  activityAddons, removeActivityAddon,
  sessionGate,
  slots, addSlot, removeSlot, updateSlot, reorderSlots,
  recentSessions,
  hint,
  prevMap,
  daySessions, sessionId,
  showSidebar, setShowSidebar,
  showTabSettings, setShowTabSettings,
  rollingDays,
  toast,
  // Handlers
  save, selectSession, handleNewSession, handleDeleteSession,
  startSessionGate, stopSessionGate,
  moveExercise,
  exerciseOps,
  exportObsidian, handleDownload, scheduleAutoSave,
  onInspectExercise,
  currentSubTab,
  onSubNav,
  gateAutoOpenFlag,
  onGateAutoOpenConsumed,
}) {
  const [showInlineDetails, setShowInlineDetails] = useState(false);
  const gpsMapsUrl = normalizeSessionGate(sessionGate).gps?.mapsUrl || null;

  // Session Gate ist kein inline Card-Element mehr, sondern ein echtes Sheet
  // über dem Training-Haupttab: "Heute" in der Nav-Bar (SessionGateCard.jsx
  // SESSION_NAV_ITEMS) öffnet es explizit, statt dass es immer sichtbar oben
  // klebt. Editor selbst bleibt darunter erreichbar (kein Plan-Zwang).
  //
  // gateAutoOpenFlag kommt als One-Shot-Signal von App (überlebt Remounts) —
  // nur wahr, wenn tatsächlich auf den "Heute"-Subtab navigiert wurde, nicht
  // bei jedem Datumswechsel (der wegen key={sessionDate} in App.jsx einen
  // kompletten Remount dieser Komponente auslöst, ein reiner
  // currentSubTab-Check hier würde also bei jedem Datumswechsel erneut
  // feuern, da mount-Effects unabhängig von deps immer einmal laufen).
  const [gateSheetOpen, setGateSheetOpen] = useState(false);
  useEffect(() => {
    if (gateAutoOpenFlag) {
      setGateSheetOpen(true);
      onGateAutoOpenConsumed?.();
    }
  }, []);

  // Split-Autoerkennung: solange der User selbst noch keinen Split gewählt
  // hat (block === ''), leitet sie den Split aus den bereits eingetragenen
  // Übungen ab (z.B. nur Chest/Shoulder/Tricep-Übungen → "Push") — die
  // Session bekommt so automatisch ihre Kennzeichnung, ohne dass der Split
  // manuell nachgetragen werden muss.
  useEffect(() => {
    if (sessionMode !== 'strength' || block) return;
    const inferred = inferBlockFromExercises(exercises);
    if (inferred) {
      setBlock(inferred);
      scheduleAutoSave();
    }
  }, [exercises, sessionMode, block]);

  // Übungen tragen ihren Index im flachen exercises-Array als __i mit sich
  // (ExerciseList reicht ihn 1:1 an updateEx/addSet/removeEx/moveEx durch) —
  // notwendig, weil sowohl die Basisliste als auch jede Slot-Liste nur eine
  // gefilterte Teilmenge rendern; ohne __i würde ein lokaler Listen-Index
  // (0,1,2,...) auf die falsche Übung im Gesamt-Array zeigen, sobald ein
  // Slot benutzt wird.
  const indexedExercises = exercises.map((ex, i) => ({ ...ex, __i: i }));

  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const BASE_CONTAINER = '__base__';

  function handleExerciseDragEnd({ active, over }) {
    if (!over || !moveExercise) return;
    const activeId = active.id;
    const overData = over.data.current;
    const targetContainer = overData?.containerId ?? over.id;
    const targetSlotId = targetContainer === BASE_CONTAINER ? null : targetContainer;
    const containerItems = exercises.filter(e => (e.slotId || null) === (targetSlotId || null));
    const targetIndex = overData?.containerId
      ? containerItems.findIndex(e => e.id === over.id)
      : containerItems.length;
    if (targetIndex === -1) return;
    moveExercise(activeId, targetSlotId, targetIndex);
  }

  // Slots selbst sind seit Phase-3-Stück-3 ebenfalls per dnd-kit sortierbar
  // (eigene SortableContext in SessionSlots.jsx, gleicher DndContext wie die
  // Exercise-Listen). `type` in den jeweiligen `data`-Objekten (siehe
  // ExerciseList.jsx/SessionSlots.jsx) unterscheidet, welcher der beiden
  // Reorder-Pfade greift — beide teilen sich diesen einen DndContext, weil
  // dnd-kit Drag-Erkennung nur über den nächsten Vorfahren-Context läuft.
  function handleDragEnd({ active, over }) {
    if (!over) return;
    if (active.data.current?.type === 'slot') {
      if (over.data.current?.type === 'slot' && active.id !== over.id) {
        reorderSlots(active.id, over.id);
      }
      return;
    }
    handleExerciseDragEnd({ active, over });
  }

  return (
    <div className="pb-36">
      {/* Sticky header — DateStrip/SessionSwitcher/hint/ModeSwitcher merged into one calm unit */}
      <SessionHeader
        date={date} setDate={setDate} rollingDays={rollingDays} recentSessions={recentSessions}
        saving={saving} autoSaveLabel={autoSaveLabel} dirty={dirty} onSave={save}
        onOpenSidebar={() => setShowSidebar(true)}
        onOpenSettings={() => setShowTabSettings(true)}
        hint={hint}
        daySessions={daySessions} sessionId={sessionId} selectSession={selectSession}
        onNew={handleNewSession} onDelete={handleDeleteSession}
        sessionMode={sessionMode} setSessionMode={setSessionMode}
      />

      {/* Split-Auswahl — 1 Klick, direkt unter dem Datumspicker statt hinter "Weitere Details" */}
      {sessionMode === 'strength' && (
        <div className="px-3 mt-1.5 mb-1.5">
          <SplitPicker block={block} setBlock={v => { setBlock(v); scheduleAutoSave(); }} />
        </div>
      )}

      {/* RPE — ebenfalls prominent statt hinter "Details & Notizen" versteckt */}
      <div className="px-3 mb-1.5">
        <EffortPicker effort={effort} setEffort={v => { setEffort(v); scheduleAutoSave(); }} />
      </div>

      <div className="px-2 space-y-4 mt-1">
        {sessionMode === 'strength' ? (
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {/* Basis-Übungsliste = impliziter erster Abschnitt der Session
                (wie schon immer: Übungen + Sets + Activity-Finisher unten). */}
            <ExerciseList
              containerId={BASE_CONTAINER}
              exercises={indexedExercises.filter(ex => !ex.slotId)}
              restHours={restHours}
              muscleRecovery={recentSessions[date]?.muscle_recovery || {}}
              date={date}
              prevMap={prevMap}
              onInspectExercise={onInspectExercise}
              exerciseOps={exerciseOps}
            />

            {/* Activity finisher addon — für den Basis-Abschnitt, unverändert */}
            <ActivityAddon
              hasActivity={hasActivity}
              setHasActivity={setHasActivity}
              activity={activity}
              setActivity={v => { setActivity(v); scheduleAutoSave(); }}
            />

            {/* Zusätzliche, frei benannte Abschnitte (Slots) — jeder ein
                weiterer Übungen+Activity+Notiz-Block wie der Basis-Abschnitt
                oben, additiv. Leeres slots-Array rendert nichts. */}
            <SessionSlots
              slots={slots}
              exercises={indexedExercises}
              block={block}
              addSlot={addSlot}
              removeSlot={removeSlot}
              updateSlot={updateSlot}
              restHours={restHours}
              muscleRecovery={recentSessions[date]?.muscle_recovery || {}}
              date={date}
              prevMap={prevMap}
              onInspectExercise={onInspectExercise}
              exerciseOps={exerciseOps}
            />
          </DndContext>
        ) : (
          /* Cardio mode */
          <CardioSection activity={activity} setActivity={setActivity} scheduleAutoSave={scheduleAutoSave} />
        )}

        {/* Bereits gespeicherte Finisher dieses Tages (activityAddons-Historie) */}
        <ActivityAddonHistory activityAddons={activityAddons} removeActivityAddon={removeActivityAddon} />

        {/* Details & Notizen — Location/Dauer/Trainingsart/Effort/Notizen, klappt Sidebar-Inhalte inline auf.
            Split (Push/Pull/...) sitzt seit der UX-Überarbeitung nicht mehr hier, sondern prominent
            unter dem Datumspicker (SplitPicker) — das war vorher die eigentliche Logging-Hürde. */}
        <div>
          <button
            onClick={() => setShowInlineDetails(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--dim)' }}
          >
            <span>Details & Notizen</span>
            <ChevronDown size={14} style={{ transform: showInlineDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {showInlineDetails && (
            <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
              <SessionSidebar
                location={location} setLocation={v => { setLocation(v); scheduleAutoSave(); }}
                duration={duration} setDuration={v => { setDuration(v); scheduleAutoSave(); }}
                gpsMapsUrl={gpsMapsUrl}
                trainingsart={trainingsart} setTrainingsart={v => { setTrainingsart(v); scheduleAutoSave(); }}
                notes={notes} setNotes={v => { setNotes(v); scheduleAutoSave(); }}
                onDownload={handleDownload}
                onExportObsidian={exportObsidian}
                coachFeedback={coachFeedback}
              />
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <SessionToast toast={toast} />

      {/* Floating save FAB (mobile) */}
      <SessionSaveFab dirty={dirty} autoSaveLabel={autoSaveLabel} saving={saving} onSave={save} />

      {/* Modals */}
      {showSidebar && (
        <SidebarSheet
          onClose={() => setShowSidebar(false)}
          location={location} setLocation={v => { setLocation(v); scheduleAutoSave(); }}
          duration={duration} setDuration={v => { setDuration(v); scheduleAutoSave(); }}
          gpsMapsUrl={gpsMapsUrl}
          trainingsart={trainingsart} setTrainingsart={v => { setTrainingsart(v); scheduleAutoSave(); }}
          notes={notes} setNotes={v => { setNotes(v); scheduleAutoSave(); }}
          onDownload={handleDownload}
          onExportObsidian={exportObsidian}
          coachFeedback={coachFeedback}
        />
      )}

      {showTabSettings && (
        <SourceSettingsModal onClose={() => setShowTabSettings(false)} />
      )}

      <SessionGateSheet
        open={gateSheetOpen}
        onClose={() => setGateSheetOpen(false)}
        date={date}
        sessionGate={sessionGate}
        currentSubTab={currentSubTab}
        onSubNav={onSubNav}
        onStart={() => { startSessionGate(); setGateSheetOpen(false); }}
        onStop={stopSessionGate}
      />
    </div>
  );
}
