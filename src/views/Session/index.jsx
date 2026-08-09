/**
 * Session — Thin sub-tab router.
 *
 * All state lives in useSession hook.
 * Routes between: editor (today) / history / plan.
 * index.jsx went from 860 lines → ~60 lines. 
 */

import { useSession } from './useSession';
import SessionEditor from './SessionEditor';
import SessionHistory from './SessionHistory';
import PlanView from '../Plan/index.jsx';
import WorkoutTimerCard from './WorkoutTimerCard.jsx';

export default function Session({
  initialDate, initialDraft, onInspectExercise, onOpenSession,
  recentDays = 7, coverageThreshold = 1.0, subTab, onDateChange, onSubNav,
}) {
  const session = useSession({ initialDate, initialDraft, recentDays, coverageThreshold, onDateChange });

  if (subTab === 'timer') {
    return (
      <div className="px-2 mt-3 pb-32">
        <WorkoutTimerCard />
      </div>
    );
  }

  if (subTab === 'plan') {
    return <PlanView />;
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
      />
  );
}
