import { Activity, Dumbbell, Target, BookOpen, Brain, BarChart3, Settings2, Soup } from "lucide-react";

const baseItems = [
  { id: 'dash',     label: 'Heute',    Icon: Activity },
  { id: 'session',  label: 'Training', Icon: Dumbbell },
  { id: 'habits',   label: 'Habits',   Icon: Target },
  { id: 'journal',  label: 'Journal',  Icon: BookOpen },
  { id: 'review',   label: 'Review',   Icon: BarChart3 },
  { id: 'learn',    label: 'Lernen',   Icon: Brain },
  { id: 'settings', label: 'Setup',    Icon: Settings2 },
];

const isFederation = import.meta.env.VITE_FEDERATION === 'true';

export const NAV_ITEMS = isFederation
  ? [
      { id: 'dash',     label: 'Heute',    Icon: Activity },
      { id: 'session',  label: 'Training', Icon: Dumbbell },
      { id: 'journal',  label: 'Journal',  Icon: BookOpen },
      { id: 'fuel',     label: 'Fuel',     Icon: Soup },
      { id: 'review',   label: 'Review',   Icon: BarChart3 },
      { id: 'learn',    label: 'Lernen',   Icon: Brain },
      { id: 'settings', label: 'Setup',    Icon: Settings2 },
    ]
  : baseItems;

export const VALID_TABS = new Set([
  ...baseItems.map(item => item.id),
  'fuel',
  'coach',
  'inbox'
]);
