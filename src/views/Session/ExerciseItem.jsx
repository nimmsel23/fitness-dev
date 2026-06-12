import { useState, useEffect } from 'react';
import { getProgressTrend } from '@db';
import { num } from './utils';

export default function ExerciseItem({
  ex, i, hitMode, updateEx, addSet, removeSet, removeEx, moveEx,
  isFirst, isLast, planMode, date, prev, onInspectExercise
}) {
  const [trend, setTrend] = useState(null);
  const isFuture = new Date(date) > new Date();
  
  // Show trend for HIT based on weight, or Volume for standard
  useEffect(() => {
    if (ex.name) {
      getProgressTrend(ex.name).then(setTrend);
    }
  }, [ex.name, ex.isHIT]);

  const isImplicitHIT = !hitMode && ex.setsArray?.length === 1 && !ex.setsArray[0].reps;
  const isActuallyHIT = ex.isHIT || hitMode || isImplicitHIT;

  const handleRepsChange = (val, sIdx) => {
    const v = String(val).toUpperCase();
    if (v === 'H' || v === 'HIT') {
      updateEx(i, 'isHIT', true);
      return;
    }
    updateEx(i, 'reps', val, sIdx);
  };

  const volume = (!isActuallyHIT && ex.setsArray) 
    ? ex.setsArray.reduce((acc, set) => acc + (num(set.reps) || 0) * (num(set.weight) || 0), 0) : null;

  return (
    <div className={`card border-l-2 relative mb-2 p-3 ${planMode && isFuture && !ex.done ? 'border-orange' : 'border-accent'}`}>
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="min-w-0 pr-2">
          <div className="font-bold text-[13px] leading-tight flex items-center flex-wrap gap-1.5">
            <span
              onClick={() => onInspectExercise?.(ex)}
              className={onInspectExercise ? 'cursor-pointer hover:text-accent transition-colors' : ''}
            >
              {ex.name || <span className="text-dim italic">Übung</span>}
            </span>
            
            {trend && trend.status !== 'neutral' && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${trend.status === 'up' ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
                {trend.status === 'up' ? '↗' : '↘'} {trend.change}%
              </span>
            )}

            {isActuallyHIT && (
              <span className="text-[8px] font-black bg-orange/10 text-orange px-1.5 py-0.5 rounded uppercase tracking-widest border border-orange/10">
                HIT
              </span>
            )}
          </div>

          {/* Previous Performance (Local Intelligence) */}
          {prev && (
            <div className="text-[9px] font-mono font-bold text-dim mt-0.5 opacity-60">
              {prev.setsArray ? (
                <span>
                  {prev.setsArray.length}×{prev.setsArray[0].reps}@{prev.setsArray[0].weight}kg
                </span>
              ) : (
                <span>
                  {prev.sets}×{prev.reps}{prev.weight ? `@${prev.weight}kg` : ''}
                </span>
              )}
              <span className="ml-1.5 opacity-40 font-normal">{prev.date}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <div className="flex flex-row gap-2 -mt-0.5">
            <button onClick={() => moveEx(i, -1)} disabled={isFirst} className="text-dim hover:text-accent disabled:opacity-10 text-sm leading-none">↑</button>
            <button onClick={() => moveEx(i, 1)} disabled={isLast} className="text-dim hover:text-accent disabled:opacity-10 text-sm leading-none">↓</button>
          </div>
          <button onClick={() => removeEx(i)} className="text-dim hover:text-red transition-colors -mt-0.5">
             <span className="text-sm leading-none">×</span>
          </button>
        </div>
      </div>

      {/* HIT View: Single Weight Row */}
      {isActuallyHIT && ex.setsArray && (
        <div className="grid grid-cols-[1fr_auto_1.5fr_auto] items-center gap-3 mb-2">
          <div className="flex flex-col">
             <span className="text-[8px] font-black uppercase tracking-widest opacity-20 ml-0.5 mb-0.5">Fokus</span>
             <div className="py-2 px-3 rounded-lg bg-orange/5 border border-orange/10 text-orange font-black text-[10px] uppercase tracking-widest text-center shadow-inner">Failure</div>
          </div>
          <span className="text-dim text-center text-[9px] font-black pt-3">@</span>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest opacity-20 ml-0.5 mb-0.5">Gewicht</span>
            <input 
              type="text" 
              inputMode="decimal" 
              placeholder="kg" 
              value={ex.setsArray[0]?.weight || ''} 
              onChange={e => updateEx(i, 'weight', e.target.value, 0)} 
              className="text-center font-mono font-black py-2 px-1 rounded-lg bg-bg2 border border-line w-full text-sm focus:border-accent outline-none" 
            />
          </div>
          <span className="text-dim text-center text-[9px] font-black pt-3 uppercase">kg</span>
        </div>
      )}

      {/* Standard View: Multi-Set Table */}
      {!isActuallyHIT && ex.setsArray && (
        <div className="space-y-1.5 mb-2">
            {ex.setsArray.map((set, sIdx) => (
                <div key={sIdx} className="grid grid-cols-[1fr_auto_1fr_auto_minmax(40px,1fr)_28px] items-center gap-1.5">
                    <input type="text" inputMode="numeric" placeholder="Reps" value={set.reps || ''} onChange={e => handleRepsChange(e.target.value, sIdx)} className="text-center font-mono font-black py-2 px-1 rounded-lg bg-bg2 border border-line w-full text-xs focus:border-accent outline-none" />
                    <span className="text-dim text-center text-[9px] w-3 font-black">@</span>
                    <input type="text" inputMode="decimal" placeholder="kg" value={set.weight || ''} onChange={e => updateEx(i, 'weight', e.target.value, sIdx)} className="text-center font-mono font-black py-2 px-1 rounded-lg bg-bg2 border border-line w-full text-xs focus:border-accent outline-none" />
                    <span className="text-dim text-center text-[8px] w-4 font-bold uppercase">kg</span>
                    <div className="text-[9px] font-black text-accent/70 bg-accent/5 rounded-lg py-2.5 px-1 text-center border border-accent/5 truncate shadow-inner">{ (num(set.reps) || 0) * (num(set.weight) || 0) }</div>
                    <button onClick={() => removeSet(i, sIdx)} className="text-dim hover:text-red flex items-center justify-center">
                      <span className="text-base leading-none">×</span>
                    </button>
                </div>
            ))}
            <button onClick={() => addSet(i)} className="w-full text-center text-[9px] font-black uppercase tracking-widest text-accent py-2 border border-dashed border-accent/20 rounded-xl hover:bg-accent/5 transition-all">+ Satz</button>
        </div>
      )}

      {volume !== null && (
        <div className="text-[9px] font-mono text-dim/50 text-right mb-2">
          Vol: {Math.round(volume).toLocaleString('de-AT')}kg
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <input type="text" placeholder="Notiz…" value={ex.note || ''} onChange={e => updateEx(i, 'note', e.target.value)}
          className="flex-1 py-1 px-2.5 text-[11px] bg-bg2 border border-line/50 rounded-lg focus:border-accent/50 outline-none" />
        {planMode && isFuture && (
           <button onClick={() => updateEx(i, 'done', !ex.done)}
             className={`px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all uppercase tracking-widest ${ex.done ? 'border-green bg-green/10 text-green' : 'border-line bg-bg2 text-dim'}`}>
             {ex.done ? 'Done' : 'ToDo'}
           </button>
        )}
        <button onClick={() => updateEx(i, 'isHIT', !ex.isHIT)}
          className={`px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all uppercase tracking-widest ${ex.isHIT ? 'border-orange bg-orange/10 text-orange' : 'border-line bg-bg2 text-dim'}`}>
          HIT
        </button>
      </div>
    </div>
  );
}
