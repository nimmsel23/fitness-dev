/**
 * SplitPicker — 1-Klick-Auswahl der Trainingsart (Push/Pull/Legs/...), direkt
 * unter dem Datumspicker im SessionHeader verankert. Vorher stand dieselbe
 * Auswahl (als generisches Button-Grid) hinter "Weitere Details" versteckt in
 * SessionSidebar — die Hürde, überhaupt einen Split für den Tag festzuhalten,
 * war dadurch unnötig hoch. Bewusst eigenständige, kompakte Chip-Reihe statt
 * Wiederverwendung des alten Grid-Stils.
 */

import { ArrowUpCircle, ArrowDownCircle, Footprints, ChevronsUp, ChevronsDown, CircleDot } from 'lucide-react';
import { blockColor } from './utils';

const SPLITS = [
  { key: 'Push',  icon: ArrowUpCircle },
  { key: 'Pull',  icon: ArrowDownCircle },
  { key: 'Legs',  icon: Footprints },
  { key: 'Upper', icon: ChevronsUp },
  { key: 'Lower', icon: ChevronsDown },
  { key: 'Full',  icon: CircleDot },
];

export default function SplitPicker({ block, setBlock }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-0.5 px-0.5">
      {SPLITS.map(({ key, icon: Icon }) => {
        const isActive = block === key;
        const color = blockColor(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => setBlock(isActive ? '' : key)}
            className="flex items-center gap-1.5 shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold transition-all active:scale-95"
            style={{
              background: isActive ? color : 'var(--card)',
              color: isActive ? '#000' : 'var(--dim)',
              border: `1px solid ${isActive ? color : 'var(--line)'}`,
              boxShadow: isActive ? `0 6px 16px -4px ${color}66` : 'none',
            }}
          >
            <Icon size={13} strokeWidth={2.5} />
            {key}
          </button>
        );
      })}
    </div>
  );
}
