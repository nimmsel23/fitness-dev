/**
 * Session — Thin sub-tab router.
 *
 * All state lives in useSession hook.
 * Routes between: editor (today) / history / plan.
 * index.jsx went from 860 lines → ~60 lines. 
 */

import { useState } from 'react';
import { useSession } from './useSession';
import SessionEditor from './SessionEditor';
import SessionHistory from './SessionHistory';
import PlanView from '../Plan/index.jsx';
import WorkoutTimerCard from './WorkoutTimerCard.jsx';
import SixPackPromiseCard from './SixPackPromiseCard.jsx';
import SkillsCard from './SkillsCard.jsx';
import TodayPlan, { useTodayPlan } from './TodayPlan.jsx';

export default function Session({
  initialDate, initialDraft, onInspectExercise, onOpenSession,
  recentDays = 7, coverageThreshold = 1.0, subTab, onDateChange, onSubNav,
  planView, planId, onPlanRouteChange,
  gateAutoOpenFlag, onGateAutoOpenConsumed,
}) {
  const session = useSession({ initialDate, initialDraft, recentDays, coverageThreshold, onDateChange });
  const { loading: planLoading, cycle, nextRoutine, lastPerformance, clientUid, reload } = useTodayPlan();
  const [logFreely, setLogFreely] = useState(false);

  const isTodayTab = subTab === 'today' || !subTab;
  if (isTodayTab && !planLoading && cycle && nextRoutine && !logFreely) {
    return (
      <TodayPlan
        cycle={cycle}
        nextRoutine={nextRoutine}
        lastPerformance={lastPerformance}
        clientUid={clientUid}
        onDone={reload}
        onLogFreely={() => setLogFreely(true)}
      />
    );
  }

  if (subTab === 'timer') {
    return <SixPackPromiseCard onSubNav={onSubNav} />;
  }

  if (subTab === 'skills') {
    return (
      <div className="px-2 mt-3 pb-32 space-y-4">
        <SkillsCard />
        <WorkoutTimerCard />
      </div>
    );
  }

  if (subTab === 'plan') {
    return <PlanView routeView={planView} routeId={planId} onRouteChange={onPlanRouteChange} />;
  }

  if (subTab === 'history') {
    return (
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
        hasMoreHistory={session.hasMoreHistory}
        onLoadMoreHistory={session.loadMoreHistory}
      />
    );
  }

  // Default: today / session editor
  return (
      <SessionEditor
        {...session}
        onInspectExercise={onInspectExercise}
        currentSubTab={subTab}
        onSubNav={onSubNav}
        gateAutoOpenFlag={gateAutoOpenFlag}
        onGateAutoOpenConsumed={onGateAutoOpenConsumed}
      />
  );
}
