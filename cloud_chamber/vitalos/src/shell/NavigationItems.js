import {
  Dumbbell, Flame, BookOpen, CheckSquare, Brain, Settings2,
  Activity, BarChart3, UtensilsCrossed, CalendarDays, Pill, Microscope, History, ClipboardList,
} from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'fitness',  label: 'Fitness', Icon: Dumbbell },
  { id: 'fuel',     label: 'Fuel',    Icon: Flame },
  { id: 'journal',  label: 'Journal', Icon: BookOpen },
  { id: 'habits',   label: 'Habits',  Icon: CheckSquare },
  { id: 'learn',    label: 'Lernen',  Icon: Brain },
  { id: 'settings', label: 'Setup',   Icon: Settings2 },
]

export const VALID_TABS = new Set(NAV_ITEMS.map(i => i.id))

export const SUB_NAV = {
  fitness: [
    { id: 'dash',    label: 'Heute',    Icon: Activity },
    { id: 'session', label: 'Training', Icon: Dumbbell },
    { id: 'review',  label: 'Review',   Icon: BarChart3 },
    { id: 'verlauf', label: 'Verlauf',  Icon: History  },
    { id: 'plan',    label: 'Plan',     Icon: ClipboardList },
  ],
  fuel: [
    { id: 'dashboard',   label: 'Dashboard', Icon: Flame },
    { id: 'food',        label: 'Food',      Icon: UtensilsCrossed },
    { id: 'calendar',    label: 'Kalender',  Icon: CalendarDays },
    { id: 'supplements', label: 'Supps',     Icon: Pill },
    { id: 'micros',      label: 'Mikros',    Icon: Microscope },
  ],
}
