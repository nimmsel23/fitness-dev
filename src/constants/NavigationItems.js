import { Activity, Dumbbell, BookOpen, Brain, BarChart3, Settings2 } from "lucide-react";

const baseItems = [
  { id: 'dash',     label: 'Heute',    Icon: Activity },
  { id: 'session',  label: 'Training', Icon: Dumbbell },
  { id: 'journal',  label: 'Journal',  Icon: BookOpen },
  { id: 'review',   label: 'Review',   Icon: BarChart3 },
  { id: 'learn',    label: 'Lernen',   Icon: Brain },
  { id: 'settings', label: 'Setup',    Icon: Settings2 },
];

export const NAV_ITEMS = baseItems;

export const VALID_TABS = new Set([
  ...baseItems.map(item => item.id),
  'coach',
  'inbox'
]);
