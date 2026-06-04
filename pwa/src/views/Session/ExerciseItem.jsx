import { useState, useEffect } from 'react';
import { getProgressTrend } from '../../db.js';
import { num } from './utils';

export default function ExerciseItem({ 
  ex, i, updateEx, addSet, removeSet, removeEx, moveEx, 
  isFirst, isLast, planMode, date 
}) {
  const [trend, setTrend] = useState(null);
  const isFuture = new Date(date) > new Date();
  
  useEffect(() => {
    if (!ex.isHIT && ex.name) {
      getProgressTrend(ex.name).then(setTrend);
    }
  }, [ex.name, ex.isHIT]);

  const volume = (!ex.isHIT && ex.setsArray) 
    ? ex.setsArray.reduce((acc, set) => acc + (num(set.reps) || 0) * (num(set.weight) || 0), 0) : null;

  return (
    <div className={`card border-l-4 relative mb-3 p-4 ${planMode && isFuture && !ex.done ? 'border-orange' : 'border-accent'}`}>
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="font-bold text-sm leading-tight">
          {ex.name || <span className="text-dim italic">Übung</span>}
          
          {trend && trend.status !== 'neutral' && (
            <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded ${trend.status === 'up' ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
              {trend.status === 'up' ? '↗' : '↘'} {trend.change}%
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 -mt-1">
            <button onClick={() => moveEx(i, -1)} disabled={isFirst} className="text-dim hover:text-accent disabled:opacity-20 text-lg leading-none">↑</button>
            <button onClick={() => moveEx(i, 1)} disabled={isLast} className="text-dim hover:text-accent disabled:opacity-20 text-lg leading-none">↓</button>
          </div>
          <button onClick={() => removeEx(i)} className="text-dim hover:text-red transition-colors -mt-1 p-1">
             <span className="text-lg leading-none">×</span>
          </button>
        </div>
      </div>

      {!ex.isHIT && ex.setsArray && (
        <div className="space-y-2 mb-3">
            {ex.setsArray.map((set, sIdx) => (
                <div key={sIdx} className="grid grid-cols-[1fr_auto_1fr_auto_minmax(40px,1fr)_25px] items-center gap-1 sm:gap-2">
                    <input type="text" inputMode="numeric" placeholder="Reps" value={set.reps || ''} onChange={e => updateEx(i, 'reps', e.target.value, sIdx)} className="text-center font-mono font-bold p-2 rounded-lg bg-bg2 border border-line w-full text-sm" />
                    <span className="text-dim text-center text-[10px] w-4">@</span>
                    <input type="text" inputMode="decimal" placeholder="kg" value={set.weight || ''} onChange={e => updateEx(i, 'weight', e.target.value, sIdx)} className="text-center font-mono font-bold p-2 rounded-lg bg-bg2 border border-line w-full text-sm" />
                    <span className="text-dim text-center text-[10px] w-5 hidden sm:inline">kg</span>
                    <span className="text-dim text-center text-[10px] w-1 sm:hidden"></span>
                    <div className="text-[10px] font-bold text-ink bg-bg2 rounded-lg py-2 px-1 text-center border border-line truncate">{ (num(set.reps) || 0) * (num(set.weight) || 0) }</div>
                    <button onClick={() => removeSet(i, sIdx)} className="text-dim hover:text-red text-xs flex justify-center">×</button>
                </div>
            ))}
            <button onClick={() => addSet(i)} className="w-full text-center text-[10px] font-bold text-accent py-2 border border-dashed border-accent/30 rounded-lg hover:bg-accent/5">+ Satz</button>
        </div>
      )}

      {volume !== null && (
        <div className="text-[11px] font-mono text-dim text-right mb-3">
          Gesamt: {Math.round(volume).toLocaleString('de-AT')} kg
        </div>
      )}

      <div className="flex items-center gap-2">
        <input type="text" placeholder="Notiz…" value={ex.note || ''} onChange={e => updateEx(i, 'note', e.target.value)}
          className="flex-1 py-1.5 px-3 text-xs bg-bg2 border-line rounded-lg" />
        {planMode && isFuture && (
           <button onClick={() => updateEx(i, 'done', !ex.done)}
             className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${ex.done ? 'border-green bg-green/10 text-green' : 'border-line bg-bg2 text-dim'}`}>
             {ex.done ? 'Done' : 'ToDo'}
           </button>
        )}
        <button onClick={() => updateEx(i, 'isHIT', !ex.isHIT)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${ex.isHIT ? 'border-orange bg-orange/10 text-orange' : 'border-line bg-bg2 text-dim'}`}>
          HIT
        </button>
      </div>
    </div>
  );
}
