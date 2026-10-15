/**
 * SessionModeTabs — Kraft / Ausdauer / Calisthenics / 6Pack als eine Reihe
 * Underline-Tabs im Training-Tab. Kraft/Ausdauer setzen den sessionMode der
 * Heute-Ansicht, Calisthenics (Skills) und 6Pack (Core-Timer) sind eigene
 * Subtabs (skills / timer) — siehe Session/index.jsx. Die Reihe steht auch
 * über diesen beiden Subtabs, damit man von dort zurück kommt.
 */

import { Dumbbell, Activity, Sparkles, TimerReset } from 'lucide-react';

export default function SessionModeTabs({ sessionMode, setSessionMode, subTab, onSubNav }) {
  const onToday = !subTab || subTab === 'today';
  const tabs = [
    {
      key: 'strength', label: 'Kraft', Icon: Dumbbell, color: 'var(--accent)',
      active: onToday && sessionMode === 'strength',
      go: () => { setSessionMode('strength'); if (!onToday) onSubNav?.('today'); },
    },
    {
      key: 'cardio', label: 'Ausdauer', Icon: Activity, color: 'var(--orange)',
      active: onToday && sessionMode === 'cardio',
      go: () => { setSessionMode('cardio'); if (!onToday) onSubNav?.('today'); },
    },
    {
      key: 'skills', label: 'Calisthenics', Icon: Sparkles, color: 'var(--accent)',
      active: subTab === 'skills',
      go: () => onSubNav?.('skills'),
    },
    {
      key: 'timer', label: '6Pack', Icon: TimerReset, color: 'var(--accent)',
      active: subTab === 'timer',
      go: () => onSubNav?.('timer'),
    },
  ];

  return (
    <div className="ml-auto flex items-center gap-3 text-[11px] font-semibold shrink-0">
      {tabs.map(({ key, label, Icon, color, active, go }) => (
        <button
          key={key}
          onClick={go}
          className="flex items-center gap-1 pb-0.5"
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
