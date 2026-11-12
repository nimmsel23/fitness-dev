/**
 * Kraft / Ausdauer bleiben Session-Modi. Skills und 6Pack sind im Fitness-
 * Standalone externe Apps (Label „…-App“, ExternalLink; Weiterleitung in
 * App.jsx EXTERNAL_SESSION_APPS). In der VitalOS-Shell sind es lokale Tabs:
 * plain „6Pack“ / „Skills“, kein External-Link-Icon.
 */

import { Dumbbell, Activity, ExternalLink, Sparkles, TimerReset } from 'lucide-react';
import { externalSessionCopy } from './externalSessionApps.js';
import { useInShell } from './sessionShell.jsx';

const DOMAIN_ICON = { skills: Sparkles, timer: TimerReset };

export default function SessionModeTabs({ sessionMode, setSessionMode, subTab, onSubNav }) {
  const inShell = useInShell();
  const onToday = !subTab || subTab === 'today';
  const external = (key, go, active) => {
    const copy = externalSessionCopy(key, { shell: inShell });
    return {
      key,
      label: copy.label,
      ariaLabel: copy.ariaLabel,
      Icon: copy.external ? ExternalLink : DOMAIN_ICON[key],
      color: 'var(--accent)',
      active,
      go,
    };
  };
  const tabs = [
    {
      key: 'strength', label: 'Kraft', ariaLabel: 'Kraft', Icon: Dumbbell, color: 'var(--accent)',
      active: onToday && sessionMode === 'strength',
      go: () => { setSessionMode('strength'); if (!onToday) onSubNav?.('today'); },
    },
    {
      key: 'cardio', label: 'Ausdauer', ariaLabel: 'Ausdauer', Icon: Activity, color: 'var(--orange)',
      active: onToday && sessionMode === 'cardio',
      go: () => { setSessionMode('cardio'); if (!onToday) onSubNav?.('today'); },
    },
    external('skills', () => onSubNav?.('skills'), subTab === 'skills'),
    external('timer', () => onSubNav?.('timer'), subTab === 'timer'),
  ];

  return (
    <div className="flex w-full min-w-0 flex-wrap items-center gap-x-3 text-[11px] font-semibold sm:ml-auto sm:w-auto">
      {tabs.map(({ key, label, ariaLabel, Icon, color, active, go }) => (
        <button
          key={key}
          onClick={go}
          aria-label={ariaLabel}
          aria-pressed={active}
          className="flex min-h-11 items-center gap-1 pb-0.5 whitespace-nowrap"
          style={{
            color: active ? color : 'var(--dim)',
            borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
          }}
        >
          <Icon size={12} /> {label}
        </button>
      ))}
    </div>
  );
}
