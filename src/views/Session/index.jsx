/**
 * Session — Thin sub-tab router.
 *
 * All state lives in useSession hook.
 * Routes between: editor (today) / history / plan.
 * index.jsx went from 860 lines → ~60 lines. 
 */

import { useState } from 'react';
import { localToday } from '@utils';
import { useSession } from './useSession';
import SessionEditor from './SessionEditor';
import SessionHistory from './SessionHistory';
import PlanView from '../Plan/index.jsx';
import WorkoutTimerCard from './WorkoutTimerCard.jsx';
import SixPackPromiseCard from '../../../6pack/SixPackPromiseCard.jsx';
import { getAllCoachingNotes } from '../../lib/coachNotes';
import { getUid } from '@db';
import SkillsCard from '../../../Skills/SkillsCard.jsx';
import TodayPlan, { useTodayPlan } from './TodayPlan.jsx';
import { isSessionGateActive } from '../../lib/sessionGate.js';
import { logWorkoutAsSession } from '../../lib/logExternalWorkout.js';
import SessionModeTabs from './SessionModeTabs.jsx';
import { IS_SOLO } from '../../constants/NavigationItems.js';
import { ChevronLeft } from 'lucide-react';

export default function Session({
  initialDate, initialDraft, onInspectExercise, onOpenSession,
  recentDays = 7, coverageThreshold = 1.0, subTab, onDateChange, onSubNav,
  planView, planId, onPlanRouteChange,
  gateAutoOpenFlag, onGateAutoOpenConsumed,
}) {
  const session = useSession({ initialDate, initialDraft, recentDays, coverageThreshold, onDateChange });
  const { loading: planLoading, cycle, nextRoutine, lastPerformance, clientUid, reload } = useTodayPlan();
  const [logFreely, setLogFreely] = useState(false);

  // BUGFIX 2026-09-05 (Klient Matthias — "stuck in Oktober 2025"): isTodayTab
  // prüfte bisher NUR subTab, nicht das tatsächliche Datum. `!subTab` ist aber
  // auch bei einem expliziten Datums-Deep-Link true (parseHashRoute() setzt
  // subTab dort nie), UND jeder Datumswechsel remountet den ganzen <Session>-
  // Baum (App.jsx: key={sessionDate}), was das lokale `logFreely` zurücksetzt.
  // Ergebnis: sobald ein Klient mit aktivem Coach-Plan (cycle+nextRoutine) den
  // Date-Picker benutzt, springt die App bei JEDEM Datumswechsel zurück auf
  // diesen TodayPlan-Screen (der selbst komplett datums-blind ist, kein
  // Date-Picker, keine SessionHeader) — Endlosschleife, kein Weg zurück zum
  // Editor für ein beliebiges Datum. Fix: Gate nur, wenn tatsächlich HEUTE
  // aktiv ist — TodayPlan ist ohnehin ein reiner "heute"-Habit-Screen, für
  // jedes andere Datum ist der normale Editor korrekt.
  const isTodayTab = (subTab === 'today' || !subTab) && session.date === localToday();
  // Ein aktiver Gate (Workout läuft bereits, siehe SessionGateCard) darf nie
  // vom TodayPlan-Habit-Screen verdrängt werden — TodayPlan kennt den Gate
  // nicht und bietet keinen Weg, eine laufende Session zu beenden. Ohne
  // diese Ausnahme landete z.B. ein Klick auf die "Workout läuft"-Push-
  // Notification (die gezielt auf #session/today verlinkt, um das Gate-Sheet
  // zu öffnen) bei Klienten mit aktivem Coach-Plan-Zyklus trotzdem auf
  // TodayPlan — Sackgasse ohne "Workout beenden"-Button (Bug/UX-Lücke aus
  // TODO.md, 2026-10-12).
  const gateActive = isSessionGateActive(session.sessionGate);
  if (isTodayTab && !planLoading && cycle && nextRoutine && !logFreely && !gateActive) {
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

  // Calisthenics (skills) und 6Pack (timer): abgeschlossene Workouts landen
  // als eigene Session im Tages-Log. Die Kopfzeile mit Kraft/Ausdauer/
  // Calisthenics/6Pack bleibt sichtbar, damit man zurück wechseln kann.
  async function handleWorkoutComplete(workout) {
    try {
      const { date, id, sessionData } = await logWorkoutAsSession(workout);
      if (date === session.date) {
        session.setDaySessions(prev => [...prev, { ...sessionData, id, date }]);
      }
    } catch (err) {
      console.error('Workout konnte nicht ins Session-Log geschrieben werden:', err);
    }
  }

  const modeTabs = (
    <div className="px-3 pt-3 pb-1 flex">
      <SessionModeTabs
        sessionMode={session.sessionMode} setSessionMode={session.setSessionMode}
        subTab={subTab} onSubNav={onSubNav}
      />
    </div>
  );

  if (subTab === 'timer') {
    const uid = (() => { try { return getUid(); } catch { return null; } })();
    return (
      <>
        {modeTabs}
        <SixPackPromiseCard onSubNav={onSubNav} coachingNotes={getAllCoachingNotes()} uid={uid} onWorkoutComplete={handleWorkoutComplete} />
      </>
    );
  }

  if (subTab === 'skills') {
    return (
      <>
        {modeTabs}
        <div
          className="px-2 mt-3 space-y-4"
          style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))' }}
        >
          <SkillsCard onWorkoutComplete={handleWorkoutComplete} />
          <WorkoutTimerCard />
        </div>
      </>
    );
  }

  // Solo-Build: History hat dort keine Nav — eigener Rückweg zu "Heute".
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

  // Solo-Build: Plan lebt dort auf vos-plan.web.app (Link im Header-Menü).
  if (subTab === 'plan' && !IS_SOLO) {
    return <PlanView routeView={planView} routeId={planId} onRouteChange={onPlanRouteChange} />;
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
