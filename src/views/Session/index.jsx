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
import PlanView from '../Plan/index.jsx';
import Logbuch from '../Logbuch/index.jsx';
import TodayPlan, { useTodayPlan } from './TodayPlan.jsx';
import { isSessionGateActive } from '../../lib/sessionGate.js';
import { useSessionGateLifecycle } from './useSessionGateLifecycle.js';
import { useSettings } from '../../contexts/SettingsContext';
import { IS_SOLO } from '../../constants/NavigationItems.js';
import { resolveInShell } from './externalSessionApps.js';
import { SessionShellProvider } from './sessionShell.jsx';

function SessionView({
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

  if (subTab === 'plan' && !IS_SOLO) {
    return <PlanView routeView={planView} routeId={planId} onRouteChange={onPlanRouteChange} />;
  }

  if (subTab === 'logbuch' || subTab === 'history') {
    return (
      <Logbuch initialLens={subTab === 'history' ? 'chronik' : undefined} onOpenSession={(date, draft, stored) => {
        if (stored && date === session.date) session.openStoredSession(stored);
        onOpenSession?.(date, draft);
      }} onInspectExercise={onInspectExercise} onSubNav={onSubNav} />
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

// `shell` und `embedded` sind optional. Fehlt beides, gilt die Shell, solange
// App.jsx diesen Bundle nicht als Standalone markiert hat. Ein gesetztes
// Boolean gewinnt; `shell` vor `embedded`.
export default function Session(props) {
  return (
    <SessionShellProvider inShell={resolveInShell(props)}>
      <SessionView {...props} />
    </SessionShellProvider>
  );
}
