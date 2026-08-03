import { Dumbbell, Brain, BarChart3, Settings2, CalendarDays, ClipboardList, History, LibraryBig, Microscope, HelpCircle, TrendingUp, Layers, Zap } from "lucide-react";

const baseItems = [
  { id: 'session',  label: 'Training', Icon: Dumbbell,  sub: [
    { id: 'today',   label: 'Heute',    Icon: CalendarDays },
    { id: 'plan',    label: 'Plan',     Icon: ClipboardList },
    { id: 'history', label: 'History',  Icon: History },
  ]},
  { id: 'review',   label: 'Review',   Icon: BarChart3, sub: [
    { id: 'report',    label: 'Bericht',   Icon: TrendingUp },
    { id: 'muscles',   label: 'Muskeln',   Icon: Layers },
    { id: 'readiness', label: 'Readiness', Icon: Zap },
  ]},
  { id: 'learn',    label: 'Lernen',   Icon: Brain,     sub: [
    { id: 'exercises', label: 'Übungen',  Icon: LibraryBig },
    { id: 'anatomy',   label: 'Anatomie', Icon: Microscope },
    { id: 'quiz',      label: 'Quiz',     Icon: HelpCircle },
  ]},
  { id: 'settings', label: 'Setup',    Icon: Settings2 },
];

export const NAV_ITEMS = baseItems;

export const VALID_TABS = new Set([
  ...baseItems.map(item => item.id),
  'coach',
  'inbox',
]);
