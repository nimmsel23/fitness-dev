import { Dumbbell, Brain, BarChart3, Settings2, CalendarDays, ClipboardList, History, LibraryBig, Microscope, HelpCircle, Layers, Zap } from "lucide-react";

const baseItems = [
  { id: 'session',  label: 'Training', Icon: Dumbbell,  sub: [
    { id: 'today',   label: 'Heute',    Icon: CalendarDays },
    { id: 'plan',    label: 'Plan',     Icon: ClipboardList },
    { id: 'history', label: 'History',  Icon: History },
  ]},
  // 'Bericht' ist bewusst KEIN eigener Sub-Eintrag: das ist der Review-Tab
  // selbst (Default-Ansicht beim Klick auf "Review"), keine gleichrangige
  // Nebenansicht wie Muskeln/Readiness/Verlauf — die sind innerhalb von
  // WeeklyReview verschachtelt und werden hier als Sprungmarken angeboten.
  // noDefaultSub: fehlender subTab markiert keinen der sub-Einträge als aktiv
  // (anders als z.B. bei 'session', wo subTab=null == sub[0]/"Heute").
  { id: 'review',   label: 'Review',   Icon: BarChart3, noDefaultSub: true, sub: [
    { id: 'muscles',   label: 'Muskeln',      Icon: Layers },
    { id: 'readiness', label: 'Readiness',    Icon: Zap },
    { id: 'strength',  label: 'Stärke-Matrix',Icon: Dumbbell },
    { id: 'verlauf',   label: 'Verlauf',      Icon: History },
  ]},
  { id: 'learn',    label: 'Lernen',   Icon: Brain,     sub: [
    { id: 'exercises', label: 'Übungen',  Icon: LibraryBig },
    { id: 'anatomy',   label: 'Anatomie', Icon: Microscope },
    { id: 'quiz',      label: 'Quiz',     Icon: HelpCircle },
  ]},
  { id: 'anamnese', label: 'Anamnese', Icon: ClipboardList },
  { id: 'settings', label: 'Setup',    Icon: Settings2 },
];

export const NAV_ITEMS = baseItems;

export const VALID_TABS = new Set([
  ...baseItems.map(item => item.id),
  'coach',
  'inbox',
]);
