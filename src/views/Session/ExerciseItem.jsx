import { useState, useEffect } from 'react';
import { getProgressTrend } from '@db';
import { num } from './utils';

export default function ExerciseItem({ 
  ex, i, updateEx, addSet, removeSet, removeEx, moveEx, 
  isFirst, isLast, planMode, date, prev
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
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="min-w-0 pr-4">
          <div className="font-bold text-sm leading-tight flex items-center flex-wrap gap-2">
            {ex.name || <span className="text-dim italic">Übung</span>}
            
            {trend && trend.status !== 'neutral' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${trend.status === 'up' ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
                {trend.status === 'up' ? '↗' : '↘'} {trend.change}%
              </span>
            )}
          </div>

          {/* Previous Performance (Local Intelligence) */}
          {prev && (
            <div className="text-[10px] font-mono font-bold text-dim mt-1">
              {prev.setsArray ? (
                <span>
                  {prev.setsArray.length} × {prev.setsArray[0].reps} @ {prev.setsArray[0].weight}kg
                </span>
              ) : (
                <span>
                  {prev.sets} × {prev.reps} {prev.weight ? `@ ${prev.weight}kg` : ''}
                </span>
              )}
              <span className="ml-2 opacity-50 font-normal">{prev.date}</span>
            </div>
          )}

          {/* Muscle Tags (Local Intelligence) */}
          {!prev && (ex.primaryMuscles || []).length > 0 && (
            <div className="text-[9px] font-black uppercase tracking-widest text-accent/60 mt-1">
              {ex.primaryMuscles.slice(0, 3).join(' · ')}
            </div>
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
        <div className="space-y-3 mb-4">
            {ex.setsArray.map((set, sIdx) => (
                <div key={sIdx} className="grid grid-cols-[1fr_auto_1fr_auto_minmax(45px,1.2fr)_32px] items-center gap-2">
                    <input type="text" inputMode="numeric" placeholder="Reps" value={set.reps || ''} onChange={e => updateEx(i, 'reps', e.target.value, sIdx)} className="text-center font-mono font-black py-3 px-1 rounded-xl bg-bg2 border border-line w-full text-sm focus:border-accent outline-none" />
                    <span className="text-dim text-center text-[10px] w-4 font-black">@</span>
                    <input type="text" inputMode="decimal" placeholder="kg" value={set.weight || ''} onChange={e => updateEx(i, 'weight', e.target.value, sIdx)} className="text-center font-mono font-black py-3 px-1 rounded-xl bg-bg2 border border-line w-full text-sm focus:border-accent outline-none" />
                    <span className="text-dim text-center text-[10px] w-5 hidden sm:inline font-bold">kg</span>
                    <span className="text-dim text-center text-[10px] w-1 sm:hidden"></span>
                    <div className="text-[10px] font-black text-accent/80 bg-accent/5 rounded-xl py-3.5 px-1 text-center border border-accent/10 truncate shadow-inner">{ (num(set.reps) || 0) * (num(set.weight) || 0) }</div>
                    <button onClick={() => removeSet(i, sIdx)} className="text-dim hover:text-red h-10 w-10 flex items-center justify-center -ml-1">
                      <span className="text-xl leading-none">×</span>
                    </button>
                </div>
            ))}
            <button onClick={() => addSet(i)} className="w-full text-center text-[11px] font-black uppercase tracking-widest text-accent py-4 border-2 border-dashed border-accent/20 rounded-2xl hover:bg-accent/5 active:scale-[0.98] transition-all">+ Satz hinzufügen</button>
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
