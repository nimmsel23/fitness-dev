/**
 * SessionEditor — Main workout logging view.
 *
 * Assembles: DateStrip + SessionSwitcher + ModeSwitcher + ExerciseList / ActivitySection + ActivityAddon
 * State comes entirely from useSession hook via props.
 * No inline history, no inline plan — those are separate sub-tabs.
 */

import { useState } from 'react';
import { Save, ChevronDown } from 'lucide-react';
import DateStrip from './DateStrip';
import ModeSwitcher from './ModeSwitcher';
import SessionSwitcher from './SessionSwitcher';
import SessionGateCard from './SessionGateCard.jsx';
import ExerciseList from './ExerciseList';
import ActivitySection from './ActivitySection';
import ActivityAddon from './ActivityAddon';
import SidebarSheet from './SidebarSheet';
import SessionSidebar from './SessionSidebar';
import AnatomyInline from './AnatomyInline';
import SourceSettingsModal from './SourceSettingsModal';
import { normalizeSessionGate } from '../../lib/sessionGate.js';

const scrollToAnatomyCheck = () =>
  document.getElementById('anatomy-check')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
  sessionGate,
  recentSessions,
  hint, gaps,
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
}) {
  const [showInlineDetails, setShowInlineDetails] = useState(false);
  const gpsMapsUrl = normalizeSessionGate(sessionGate).gps?.mapsUrl || null;

  return (
    <div className="pb-36">
      {/* Sticky date strip */}
      <DateStrip
        date={date}
        setDate={setDate}
        rollingDays={rollingDays}
        recentSessions={recentSessions}
        saving={saving}
        autoSaveLabel={autoSaveLabel}
        dirty={dirty}
        onSave={save}
        onOpenSidebar={() => setShowSidebar(true)}
        onOpenSettings={() => setShowTabSettings(true)}
      />

      <div className="px-2 space-y-4 mt-3">
        <SessionGateCard
          date={date}
          sessionGate={sessionGate}
          currentSubTab={currentSubTab}
          onSubNav={onSubNav}
          onStart={startSessionGate}
          onStop={stopSessionGate}
        />

        {/* Session switcher */}
        <div
          className="px-4 py-3 rounded-2xl"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--line)',
          }}
        >
          <SessionSwitcher
            daySessions={daySessions}
            sessionId={sessionId}
            selectSession={selectSession}
            onNew={handleNewSession}
            onDelete={handleDeleteSession}
          />
        </div>

        {/* Mode switcher */}
        <ModeSwitcher sessionMode={sessionMode} setSessionMode={setSessionMode} />

        {/* Main content */}
        <div className="px-1">
          <div
            className="text-[10px] font-black uppercase tracking-[0.22em] mb-2"
            style={{ color: 'var(--dim)', opacity: 0.65 }}
          >
            Manuell nachtragen / editieren
          </div>
        </div>
        {sessionMode === 'strength' ? (
          <>
            <ExerciseList
              exercises={exercises}
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
              hint={hint}
              gaps={gaps}
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

        {/* Anatomie-Check — inline statt Modal */}
        <AnatomyInline exercises={exercises} />

        {/* Weitere Details — versteckt, klappt Sidebar-Inhalte inline auf */}
        <div>
          <button
            onClick={() => setShowInlineDetails(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--dim)' }}
          >
            <span>Weitere Details</span>
            <ChevronDown size={14} style={{ transform: showInlineDetails ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {showInlineDetails && (
            <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
              <SessionSidebar
                location={location} setLocation={v => { setLocation(v); scheduleAutoSave(); }}
                duration={duration} setDuration={v => { setDuration(v); scheduleAutoSave(); }}
                gpsMapsUrl={gpsMapsUrl}
                sessionMode={sessionMode}
                block={block} setBlock={v => { setBlock(v); scheduleAutoSave(); }}
                trainingsart={trainingsart} setTrainingsart={v => { setTrainingsart(v); scheduleAutoSave(); }}
                effort={effort} setEffort={v => { setEffort(v); scheduleAutoSave(); }}
                notes={notes} setNotes={v => { setNotes(v); scheduleAutoSave(); }}
                onDownload={handleDownload}
                onExportObsidian={exportObsidian}
                onShowMap={scrollToAnatomyCheck}
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
          onShowMap={() => { setShowSidebar(false); scrollToAnatomyCheck(); }}
          location={location} setLocation={v => { setLocation(v); scheduleAutoSave(); }}
          duration={duration} setDuration={v => { setDuration(v); scheduleAutoSave(); }}
          gpsMapsUrl={gpsMapsUrl}
          sessionMode={sessionMode}
          block={block} setBlock={v => { setBlock(v); scheduleAutoSave(); }}
          trainingsart={trainingsart} setTrainingsart={v => { setTrainingsart(v); scheduleAutoSave(); }}
          effort={effort} setEffort={v => { setEffort(v); scheduleAutoSave(); }}
          notes={notes} setNotes={v => { setNotes(v); scheduleAutoSave(); }}
          onDownload={handleDownload}
          onExportObsidian={exportObsidian}
          coachFeedback={coachFeedback}
        />
      )}

      {showTabSettings && (
        <SourceSettingsModal onClose={() => setShowTabSettings(false)} />
      )}
    </div>
  );
}
