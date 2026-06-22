import { Dumbbell, Flame, BookOpen, CheckSquare, Brain, Settings2 } from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'fitness',  label: 'Fitness', Icon: Dumbbell },
  { id: 'fuel',     label: 'Fuel',    Icon: Flame },
  { id: 'journal',  label: 'Journal', Icon: BookOpen },
  { id: 'habits',   label: 'Habits',  Icon: CheckSquare },
  { id: 'learn',    label: 'Lernen',  Icon: Brain },
  { id: 'settings', label: 'Setup',   Icon: Settings2 },
]

export const VALID_TABS = new Set(NAV_ITEMS.map(i => i.id))
