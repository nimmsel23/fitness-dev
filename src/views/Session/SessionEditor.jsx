/**
 * SessionEditor — Main workout logging view.
 *
 * Assembles: DateStrip + SessionSwitcher + ModeSwitcher + ExerciseList / ActivitySection + ActivityAddon
 * State comes entirely from useSession hook via props.
 * No inline history, no inline plan — those are separate sub-tabs.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Save, ChevronDown, X } from 'lucide-react';
import SessionGateCard from './SessionGateCard.jsx';
import SessionSlots from './SessionSlots.jsx';
import SessionHeader from './SessionHeader';
import SplitPicker from './SplitPicker';
import EffortPicker from './EffortPicker';
import ExerciseList from './ExerciseList';
import ActivitySection from './ActivitySection';
import ActivityAddon, { ADDON_TYPES } from './ActivityAddon';
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
  quickInput, setQuickInput,
  restHours,
  activity, setActivity,
  hasActivity, setHasActivity,
  activityAddons, removeActivityAddon,
  sessionGate,
  slots, addSlot, removeSlot, updateSlot,
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
  addEx, addQuick, updateEx, addSet, replaceSets, removeSet, moveEx, removeEx,
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
          <>
            {/* Frei belegbare Session-Slots (Warm-up-Block, Activity, Notiz, ...) —
                additiv, leeres slots-Array rendert nichts */}
            <SessionSlots
              slots={slots}
              exercises={exercises}
              block={block}
              addSlot={addSlot}
              removeSlot={removeSlot}
              updateSlot={updateSlot}
              restHours={restHours}
              muscleRecovery={recentSessions[date]?.muscle_recovery || {}}
              updateEx={updateEx}
              addSet={addSet}
              removeSet={removeSet}
              removeEx={removeEx}
              replaceSets={replaceSets}
              moveEx={moveEx}
              date={date}
              addEx={addEx}
              quickInput={quickInput}
              setQuickInput={setQuickInput}
              addQuick={addQuick}
              prevMap={prevMap}
              onInspectExercise={onInspectExercise}
            />

            <ExerciseList
              exercises={exercises.filter(ex => !ex.slotId)}
              restHours={restHours}
              muscleRecovery={recentSessions[date]?.muscle_recovery || {}}
              updateEx={updateEx}
              addSet={addSet}
              removeSet={removeSet}
              removeEx={removeEx}
              replaceSets={replaceSets}
              moveEx={moveEx}
              date={date}
              addEx={addEx}
              quickInput={quickInput}
              setQuickInput={setQuickInput}
              addQuick={addQuick}
              prevMap={prevMap}
              onInspectExercise={onInspectExercise}
            />

            {/* Activity finisher addon */}
            <ActivityAddon
              hasActivity={hasActivity}
              setHasActivity={setHasActivity}
              activity={activity}
              setActivity={v => { setActivity(v); scheduleAutoSave(); }}
            />
          </>
        ) : (
          /* Cardio mode */
          <div
            className="p-5 rounded-3xl animate-in slide-in-from-top-2 duration-300"
            style={{
              background: 'rgba(255,140,50,0.04)',
              border: '1px solid rgba(255,140,50,0.15)',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
                style={{ background: 'rgba(255,140,50,0.12)' }}
              >
                🏃
              </div>
              <div>
                <div
                  className="text-[11px] font-black uppercase tracking-[0.2em]"
                  style={{ color: 'var(--orange)' }}
                >
                  Ausdauer-Session
                </div>
                <div
                  className="text-[10px] font-medium"
                  style={{ color: 'var(--dim)', opacity: 0.5 }}
                >
                  Cardio · Endurance
                </div>
              </div>
            </div>
            <ActivitySection activity={activity} setActivity={v => { setActivity(v); scheduleAutoSave(); }} />
          </div>
        )}

        {/* Bereits gespeicherte Finisher dieses Tages (activityAddons-Historie) */}
        {activityAddons?.length > 0 && (
          <div className="space-y-1.5">
            <div
              className="text-[9px] font-black uppercase tracking-[0.2em] px-1"
              style={{ color: 'var(--dim)', opacity: 0.5 }}
            >
              Geloggte Finisher
            </div>
            {activityAddons.map((addon, i) => {
              const meta = ADDON_TYPES.find(t => t.value === addon.type) || ADDON_TYPES[0];
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--line)' }}
                >
                  <span className="text-base leading-none">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold" style={{ color: 'var(--ink)' }}>
                      {meta.label}{addon.duration ? ` · ${addon.duration} min` : ''}
                    </div>
                    {addon.notes && (
                      <div className="text-[10px] truncate" style={{ color: 'var(--dim)', opacity: 0.6 }}>
                        {addon.notes}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeActivityAddon(i)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-fit-dim hover:text-fit-red hover:bg-fit-red/10 transition-all"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

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
      {toast && (
        <div
          className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 animate-in slide-in-from-bottom-4 duration-300"
          style={{
            background: 'var(--card)',
            color: 'var(--accent)',
            border: '1px solid var(--line)',
          }}
        >
          {toast}
        </div>
      )}

      {/* Floating save FAB (mobile) */}
      <div className="lg:hidden fixed bottom-24 right-4 z-40 flex flex-col items-end gap-1.5">
        {dirty && !autoSaveLabel && (
          <span
            className="text-[9px] font-black uppercase tracking-widest animate-in fade-in duration-300"
            style={{ color: 'var(--red)', opacity: 0.7 }}
          >
            ●
          </span>
        )}
        <button
          onClick={save}
          disabled={saving}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: 'var(--accent)',
            color: '#000',
            boxShadow: dirty
              ? '0 0 0 4px rgba(200,255,0,0.15), 0 8px 32px -4px rgba(200,255,0,0.4)'
              : '0 8px 24px -4px rgba(200,255,0,0.3)',
          }}
        >
          {saving
            ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            : <Save size={22} strokeWidth={2.5} />}
        </button>
      </div>

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

      {gateSheetOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-fit-scrim backdrop-blur-sm" onClick={() => setGateSheetOpen(false)} />
          <div className="relative w-full max-w-xl bg-fit-card border-t border-fit-line rounded-t-[32px] sm:rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-fit-card pt-3 pb-2 flex items-center justify-between px-4 sm:px-5 z-10">
              <div className="w-10 h-1 rounded-full bg-fit-line mx-auto" />
              <button
                onClick={() => setGateSheetOpen(false)}
                className="absolute right-4 top-3 p-1.5 rounded-lg text-fit-dim hover:text-fit-ink transition-colors"
                aria-label="Schließen"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-2 sm:px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <SessionGateCard
                date={date}
                sessionGate={sessionGate}
                currentSubTab={currentSubTab}
                onSubNav={(id) => { setGateSheetOpen(false); onSubNav?.(id); }}
                onStart={() => { startSessionGate(); setGateSheetOpen(false); }}
                onStop={stopSessionGate}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
