/**
 * Session — Thin sub-tab router.
 *
 * Default: Editor + SessionGate als Plan/Manuell-Verzweigung.
 * Optional (Settings → TodayPlan-Screen): Habit-Übersicht bei Makrozyklus.
 */

import { useState } from 'react';
import { localToday } from '@utils';
import { useSession } from './useSession';
import SessionEditor from './SessionEditor';
import SessionHistory from './SessionHistory';
import PlanView from '../Plan/index.jsx';
import Logbuch from '../Logbuch/index.jsx';
import TodayPlan, { useTodayPlan } from './TodayPlan.jsx';
import { isSessionGateActive } from '../../lib/sessionGate.js';
import { useSessionGateLifecycle } from './useSessionGateLifecycle.js';
import { useSettings } from '../../contexts/SettingsContext';
import { IS_SOLO } from '../../constants/NavigationItems.js';
import { ChevronLeft } from 'lucide-react';

export default function Session({
  initialDate, initialDraft, onInspectExercise, onOpenSession,
  recentDays = 7, coverageThreshold = 1.0, subTab, onDateChange, onSubNav,
  planView, planId, onPlanRouteChange,
  gateAutoOpenFlag, onGateAutoOpenConsumed,
}) {
  const session = useSession({ initialDate, initialDraft, recentDays, coverageThreshold, onDateChange });
  useSessionGateLifecycle(session.sessionGate, session.date);
  const { todayPlanScreen } = useSettings();
  const { loading: planLoading, cycle, nextRoutine, lastPerformance, clientUid, reload } = useTodayPlan();
  const [logFreely, setLogFreely] = useState(false);

  const isTodayTab = (subTab === 'today' || !subTab) && session.date === localToday();
  const gateActive = isSessionGateActive(session.sessionGate);

  // Opt-in Habit-Screen (Settings). Sonst Gate-Verzweigung im Editor.
  if (
    todayPlanScreen
    && isTodayTab
    && !planLoading
    && cycle
    && nextRoutine
    && !logFreely
    && !gateActive
    && !gateAutoOpenFlag
    && !initialDraft
  ) {
    return (
      <TodayPlan
        cycle={cycle}
        nextRoutine={nextRoutine}
        lastPerformance={lastPerformance}
        clientUid={clientUid}
        onDone={reload}
        onLogFreely={() => setLogFreely(true)}
        onLoadDraft={(draft) => onOpenSession?.(localToday(), draft)}
      />
    );
  }

  const openPlanGate = Boolean(
    !todayPlanScreen
    && isTodayTab
    && !planLoading
    && cycle
    && nextRoutine
    && !initialDraft
  );

  const soloBack = IS_SOLO && (
    <div className="px-3 pt-3">
      <button
        onClick={() => onSubNav?.('today')}
        className="flex items-center gap-1 text-[11px] font-semibold"
        style={{ color: 'var(--dim)' }}
      >
        <ChevronLeft size={14} /> Heute
      </button>
    </div>
  );

  if (subTab === 'plan' && !IS_SOLO) {
    return <PlanView routeView={planView} routeId={planId} onRouteChange={onPlanRouteChange} />;
  }

  if (subTab === 'logbuch' || subTab === 'history') {
    return (
      <Logbuch onOpenSession={onOpenSession} onInspectExercise={onInspectExercise} onSubNav={onSubNav} />
    );
  }

  if (subTab === 'history') {
    return (
      <>
      {soloBack}
      <SessionHistory
        recentSessions={session.recentSessions}
        onOpenSession={onOpenSession}
        setDate={session.setDate}
        reDateEntry={session.reDateEntry}
        setReDateEntry={session.setReDateEntry}
        draggedDate={session.draggedDate}
        setDraggedDate={session.setDraggedDate}
        dragOverDate={session.dragOverDate}
        setDragOverDate={session.setDragOverDate}
        moveSessionToDate={session.moveSessionToDate}
        deleteSessionAtDate={session.deleteSessionAtDate}
        hasMoreHistory={session.hasMoreHistory}
        onLoadMoreHistory={session.loadMoreHistory}
      />
      </>
    );
  }

  return (
      <SessionEditor
        {...session}
        onInspectExercise={onInspectExercise}
        currentSubTab={subTab}
        onSubNav={onSubNav}
        gateAutoOpenFlag={gateAutoOpenFlag}
        onGateAutoOpenConsumed={onGateAutoOpenConsumed}
        openPlanGate={openPlanGate}
      />
  );
}
