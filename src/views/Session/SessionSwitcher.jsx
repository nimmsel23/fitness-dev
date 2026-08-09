/**
 * SessionSwitcher — Multi-session pill bar + New/Delete actions.
 * Premium redesign: colored pills, smooth transitions.
 */

import { Plus, Trash2 } from 'lucide-react';
import { blockColor } from './utils';

export default function SessionSwitcher({ daySessions, sessionId, selectSession, onNew, onDelete }) {
  if (daySessions.length === 0) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-[10px] font-black uppercase tracking-[0.2em]"
          style={{ color: 'var(--dim)', opacity: 0.5 }}
        >
          Kein Workout für diesen Tag
        </span>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'var(--accent)',
            color: '#000',
            boxShadow: '0 4px 14px -2px rgba(200,255,0,0.3)',
          }}
        >
          <Plus size={12} strokeWidth={3} />
          Manuell anlegen
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Session pills */}
      <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
        {daySessions.map(s => {
          const isSelected = s.id === sessionId;
          const label = s.block || (s.id === null ? 'Hauptsession' : `Workout`);
          const color = blockColor(s.block, s.activity, s.sessionMode);
          return (
            <button
              key={s.id ?? 'main'}
              onClick={() => selectSession(s.id)}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
              style={isSelected ? {
                background: color,
                color: '#000',
                boxShadow: `0 4px 14px -2px ${color}55`,
                border: `1px solid ${color}`,
              } : {
                background: 'var(--bg2)',
                color: 'var(--dim)',
                border: '1px solid var(--line)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onNew}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105"
          style={{
            border: '1px dashed var(--line)',
            color: 'var(--dim)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--dim)'; }}
        >
          <Plus size={11} strokeWidth={3} />
          Neu
        </button>
        {/* Löschen für jede Session in der Tagesliste — auch die Hauptsession (id null).
            Vorher war der Button auf sessionId !== null beschränkt, d.h. die Haupt-
            session (der Normalfall bei Klienten) war im UI gar nicht löschbar. */}
        {daySessions.some(s => s.id === sessionId) && (
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-fit-red/40 hover:text-fit-red hover:bg-fit-red/10 transition-all"
            title="Session löschen"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
