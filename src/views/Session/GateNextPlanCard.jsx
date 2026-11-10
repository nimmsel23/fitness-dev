/**
 * GateNextPlanCard — Verzweigung im Gate-Sheet bei aktivem Makrozyklus:
 * Plan-Routine in den Editor übernehmen oder frei/manuell nachtragen.
 * Ohne Zyklus/Routine rendert die Karte nichts.
 */

import { useEffect, useState } from 'react';
import { ClipboardList, PencilLine, Loader2 } from 'lucide-react';
import { useTodayPlan } from './TodayPlan.jsx';
import { clientView } from '../Plan/lib/planVersions.js';
import { microcycleForWeek, planWeek, applyMicrocycleToRoutine, microcycleSummary } from '../Plan/lib/microcycles.js';
import { routineToSessionDraft, lastPerformanceMap, withLastPerformance } from '../Plan/lib/sessionDraft.js';
import { getSessionHistory } from '@db';

export default function GateNextPlanCard({ onApply, onManual, className = '' }) {
  const { loading, cycle: rawCycle, nextRoutine: next, clientUid } = useTodayPlan();
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSessionHistory(30).then((h) => setHistory(Array.isArray(h) ? h : [])).catch(() => {});
  }, []);

  if (loading || !rawCycle || !next) return null;

  const cycle = rawCycle.coachUid && rawCycle.coachUid !== clientUid ? clientView(rawCycle) : rawCycle;
  const week = planWeek(cycle);
  const microcycle = microcycleForWeek(cycle.microcycles, week);
  const routine = applyMicrocycleToRoutine(next, microcycle, week);
  const exercises = routine.exercises || [];
  const title = routine.label || routine.name || 'Nächste Routine';

  async function applyPlan() {
    if (busy || !exercises.length) return;
    setBusy(true);
    try {
      const draft = withLastPerformance(
        routineToSessionDraft(next, { microcycle, week, planName: cycle.name }),
        lastPerformanceMap(history),
      );
      await onApply?.(draft);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`rounded-2xl p-3 space-y-3 ${className}`} style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--card)' }}>
          <ClipboardList size={16} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold tracking-[0.15em] font-mono truncate" style={{ color: 'var(--dim)', opacity: 0.6 }}>
            HEUTE IM PLAN{cycle.name ? ` · ${String(cycle.name).toUpperCase()}` : ''}
          </div>
          <div className="text-sm font-bold truncate" style={{ color: 'var(--ink)' }}>{title}</div>
          <div className="text-[11px]" style={{ color: 'var(--dim)' }}>
            {exercises.length} Übungen
            {microcycle ? ` · ${microcycleSummary(cycle.microcycles, week)}` : ''}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={applyPlan}
          disabled={busy || !exercises.length}
          className="h-11 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <ClipboardList size={13} strokeWidth={2.5} />}
          Plan übernehmen
        </button>
        <button
          type="button"
          onClick={() => onManual?.()}
          disabled={busy}
          className="h-11 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-bold active:scale-95 transition-all disabled:opacity-50"
          style={{ background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line)' }}
        >
          <PencilLine size={13} strokeWidth={2.5} />
          Manuell loggen
        </button>
      </div>
    </div>
  );
}
