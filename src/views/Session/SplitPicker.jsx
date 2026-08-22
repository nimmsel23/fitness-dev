/**
 * SplitPicker — 1-Klick-Auswahl der Trainingsart (Push/Pull/Legs/...), direkt
 * unter dem Datumspicker im SessionHeader verankert. Vorher stand dieselbe
 * Auswahl (als generisches Button-Grid) hinter "Weitere Details" versteckt in
 * SessionSidebar — die Hürde, überhaupt einen Split für den Tag festzuhalten,
 * war dadurch unnötig hoch. Bewusst eigenständige, kompakte Chip-Reihe statt
 * Wiederverwendung des alten Grid-Stils.
 */

import { useState } from 'react';
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
  const [hovered, setHovered] = useState(null);

  return (
    <div className="grid grid-cols-3 gap-2">
      {SPLITS.map(({ key, icon: Icon }) => {
        const isActive = block === key;
        const isHovered = hovered === key && !isActive;
        const color = blockColor(key);
        return (
          <button
            key={key}
            type="button"
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => setBlock(isActive ? '' : key)}
            className="group relative flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-[12px] font-bold transition-all duration-200 ease-out active:scale-95"
            style={{
              background: isActive ? color : isHovered ? `${color}1a` : 'var(--card)',
              color: isActive ? '#000' : isHovered ? color : 'var(--dim)',
              border: `1px solid ${isActive ? color : isHovered ? `${color}80` : 'var(--line)'}`,
              boxShadow: isActive
                ? `0 6px 16px -4px ${color}66`
                : isHovered
                  ? `0 6px 18px -8px ${color}70`
                  : 'none',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <Icon
              size={15}
              strokeWidth={2.5}
              className="transition-transform duration-200 ease-out group-hover:scale-125 group-active:scale-95"
            />
            {key}
          </button>
        );
      })}
    </div>
  );
}
