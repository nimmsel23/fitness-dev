import { Activity, Dumbbell, Target, BookOpen, Brain, BarChart3, Sparkles, Settings2 } from "lucide-react";

export const NAV_ITEMS = [
  { id: 'dash',     label: 'Heute',    Icon: Activity },
  { id: 'session',  label: 'Training', Icon: Dumbbell },
  { id: 'habits',   label: 'Habits',   Icon: Target },
  { id: 'journal',  label: 'Journal',  Icon: BookOpen },
  { id: 'review',   label: 'Review',   Icon: BarChart3 },
  { id: 'learn',    label: 'Lernen',   Icon: Brain },
  { id: 'settings', label: 'Setup',    Icon: Settings2 },
];

export const VALID_TABS = new Set(NAV_ITEMS.map(item => item.id));
