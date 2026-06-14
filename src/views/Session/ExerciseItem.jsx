import { useState, useEffect } from 'react';
import { getProgressTrend } from '@db';
import { num } from './utils';
import { TrendingUp, TrendingDown, Minus, Plus, Info, ChevronDown, ChevronUp, Clock, Target, Activity } from 'lucide-react';

export default function ExerciseItem({
  ex, i, hitMode, muscleRecovery = {}, updateEx, addSet, removeSet, removeEx, moveEx,
  isFirst, isLast, planMode, date, prev, onInspectExercise
}) {
  const [trend, setTrend] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const isFuture = new Date(date) > new Date();
  
  useEffect(() => {
    if (ex.name) {
      getProgressTrend(ex.name).then(setTrend);
    }
  }, [ex.name, ex.isHIT]);

  const isImplicitHIT = !hitMode && ex.setsArray?.length === 1 && !ex.setsArray[0].reps;
  const isActuallyHIT = ex.isHIT || hitMode || isImplicitHIT;

  const currentVolume = (!isActuallyHIT && ex.setsArray)
    ? ex.setsArray.reduce((sum, s) => sum + (num(s.reps) || 0) * (num(s.weight) || 0), 0)
    : 0;

  const prevVolume = (prev && prev.setsArray)
    ? prev.setsArray.reduce((sum, s) => sum + (num(s.reps) || 0) * (num(s.weight) || 0), 0)
    : (prev?.sets && prev?.reps && prev?.weight) ? (num(prev.sets) * num(prev.reps) * num(prev.weight)) : 0;

  const volDiff = prevVolume > 0 ? ((currentVolume - prevVolume) / prevVolume) * 100 : 0;

  const handleRepsChange = (val, sIdx) => {
    const v = String(val).toUpperCase();
    if (v === 'H' || v === 'HIT') {
      updateEx(i, 'isHIT', true);
      return;
    }
    updateEx(i, 'reps', val, sIdx);
  };
  
  let exRecoveryHours = null;
  if (ex.primaryMuscles && ex.primaryMuscles.length > 0) {
    const hours = ex.primaryMuscles.map(m => muscleRecovery[m]).filter(h => h !== undefined);
    if (hours.length > 0) {
       exRecoveryHours = Math.min(...hours);
    }
  }

  return (
    <div className={`card relative mb-3 overflow-hidden transition-all duration-300 border-l-4 ${
      planMode && isFuture && !ex.done ? 'border-orange' : 'border-accent'
    } ${showDetails ? 'shadow-2xl ring-1 ring-accent/10' : 'shadow-sm'}`}>
      
      {/* Exercise Header */}
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1.5">
              <h3 
                onClick={() => onInspectExercise?.(ex)}
                className={`text-base font-black tracking-tight ${onInspectExercise ? 'cursor-pointer hover:text-accent transition-colors' : 'text-ink'}`}
              >
                {ex.name || <span className="text-dim italic">Übung</span>}
              </h3>
              
              {ex.source && ex.source !== 'expert' && (
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-[0.2em] border ${
                  ex.source === 'bulk' ? 'bg-bg2 text-dim/40 border-line' : 'bg-orange/5 text-orange/50 border-orange/10'
                }`}>
                  {ex.source}
                </span>
              )}

              {isActuallyHIT && (
                <span className="text-[8px] font-black bg-orange text-black px-1.5 py-0.5 rounded uppercase tracking-[0.2em] shadow-sm">
                  HIT
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-3">
              {/* Primary Muscle Badges */}
              <div className="flex gap-1">
                {(ex.primaryMuscles || []).slice(0, 2).map(m => (
                  <span key={m} className="text-[9px] font-bold text-dim/60 uppercase tracking-widest">{m}</span>
                ))}
              </div>

              {/* Trend Badge */}
              {trend && trend.status !== 'neutral' && (
                <div className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full ${
                  trend.status === 'up' ? 'bg-green/10 text-green' : 'bg-red/10 text-red'
                }`}>
                  {trend.status === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {trend.change}%
                </div>
              )}

              {/* Recovery Time */}
              {exRecoveryHours !== null && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-accent uppercase tracking-widest bg-accent/5 px-2 py-0.5 rounded-full">
                  <Clock size={10} />
                  {exRecoveryHours}h Rest
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
             <div className="flex flex-col gap-1 mr-2">
                <button onClick={() => moveEx(i, -1)} disabled={isFirst} className="w-8 h-8 rounded-lg flex items-center justify-center text-dim hover:text-accent hover:bg-bg2 disabled:opacity-0 transition-all">↑</button>
                <button onClick={() => moveEx(i, 1)} disabled={isLast} className="w-8 h-8 rounded-lg flex items-center justify-center text-dim hover:text-accent hover:bg-bg2 disabled:opacity-0 transition-all">↓</button>
             </div>
             <button onClick={() => removeEx(i)} className="w-10 h-10 rounded-xl flex items-center justify-center text-dim hover:text-red hover:bg-red/5 transition-all">
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Info Bar / Previous Stats */}
        {prev && (
          <div className="mt-4 p-3 rounded-2xl bg-bg2/50 border border-line/50 flex items-center justify-between group cursor-help" onClick={() => setShowDetails(!showDetails)}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-card flex items-center justify-center text-dim border border-line">
                <History size={14} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-dim/40 mb-0.5">Zuletzt ({prev.date})</div>
                <div className="text-xs font-mono font-bold text-dim/80">
                  {prev.setsArray ? (
                    <span>{prev.setsArray.length}×{prev.setsArray[0].reps}@{prev.setsArray[0].weight}kg</span>
                  ) : (
                    <span>{prev.sets}×{prev.reps}{prev.weight ? `@${prev.weight}kg` : ''}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
               <div className="text-[10px] font-black uppercase tracking-widest text-dim/40 mb-0.5">Diff</div>
               <div className={`text-xs font-black ${volDiff > 0 ? 'text-green' : volDiff < 0 ? 'text-red' : 'text-dim'}`}>
                  {volDiff > 0 ? '+' : ''}{Math.round(volDiff)}%
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        {/* HIT View */}
        {isActuallyHIT && ex.setsArray && (
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4 bg-orange/5 p-4 rounded-3xl border border-orange/10">
            <div className="flex flex-col gap-1.5">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange/60 ml-1 flex items-center gap-2">
                 <Target size={12} /> Fokus
               </label>
               <div className="py-3 px-4 rounded-2xl bg-orange/10 border border-orange/20 text-orange font-black text-sm uppercase tracking-widest text-center shadow-inner">FAILURE</div>
            </div>
            <div className="hidden sm:block text-orange/30 font-black text-xl pt-4">@</div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange/60 ml-1">Gewicht</label>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="decimal" 
                  placeholder="kg" 
                  value={ex.setsArray[0]?.weight || ''} 
                  onChange={e => updateEx(i, 'weight', e.target.value, 0)} 
                  className="w-full text-center font-mono font-black py-3 px-4 rounded-2xl bg-card border border-orange/20 text-lg text-orange focus:border-orange focus:ring-4 focus:ring-orange/10 outline-none shadow-sm" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange/30 font-black text-xs uppercase">kg</span>
              </div>
            </div>
          </div>
        )}

        {/* Standard View */}
        {!isActuallyHIT && ex.setsArray && (
          <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_1fr_40px_1fr_32px] gap-2 px-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-dim/40 text-center">Reps</span>
                <span />
                <span className="text-[9px] font-black uppercase tracking-widest text-dim/40 text-center">Weight</span>
                <span />
                <span className="text-[9px] font-black uppercase tracking-widest text-dim/40 text-center">Volume</span>
                <span />
              </div>

              {ex.setsArray.map((set, sIdx) => (
                  <div key={sIdx} className="grid grid-cols-[1fr_auto_1fr_40px_1fr_32px] items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                      <input type="text" inputMode="numeric" placeholder="Reps" value={set.reps || ''} onChange={e => handleRepsChange(e.target.value, sIdx)} 
                        className="text-center font-mono font-black py-3 rounded-2xl bg-bg2 border border-line w-full text-sm focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all" />
                      
                      <span className="text-dim/30 font-black text-xs italic">@</span>
                      
                      <div className="relative">
                        <input type="text" inputMode="decimal" placeholder="kg" value={set.weight || ''} onChange={e => updateEx(i, 'weight', e.target.value, sIdx)} 
                          className="text-center font-mono font-black py-3 rounded-2xl bg-bg2 border border-line w-full text-sm focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none transition-all" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-black text-dim/20 uppercase">kg</span>
                      </div>

                      <div className="text-center font-black text-dim/20 text-[10px]">=</div>

                      <div className="text-xs font-mono font-black text-accent/80 bg-accent/5 rounded-2xl py-3 px-1 text-center border border-accent/10 shadow-inner">
                        { (num(set.reps) || 0) * (num(set.weight) || 0) }
                      </div>

                      <button onClick={() => removeSet(i, sIdx)} className="w-8 h-8 rounded-lg flex items-center justify-center text-dim/30 hover:text-red hover:bg-red/5 transition-all">
                        <X size={14} />
                      </button>
                  </div>
              ))}
              
              <button 
                onClick={() => addSet(i)} 
                className="w-full py-3 mt-2 rounded-[20px] bg-accent/5 border border-dashed border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent/10 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Satz hinzufügen
              </button>
          </div>
        )}
      </div>

      {/* Footer / Meta Section */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 border-t border-line/30 pt-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Info size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim/40" />
          <input 
            type="text" 
            placeholder="Notiz hinzufügen..." 
            value={ex.note || ''} 
            onChange={e => updateEx(i, 'note', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[11px] font-bold bg-bg2/50 border border-line/50 rounded-xl focus:border-accent/50 focus:bg-card outline-none transition-all" 
          />
        </div>

        <div className="flex items-center gap-2">
          {planMode && isFuture && (
             <button onClick={() => updateEx(i, 'done', !ex.done)}
               className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black border transition-all uppercase tracking-[0.2em] shadow-sm ${
                 ex.done ? 'border-green bg-green/10 text-green' : 'border-line bg-bg2 text-dim'
               }`}>
               {ex.done ? 'Erledigt' : 'Geplant'}
             </button>
          )}
          
          <button onClick={() => updateEx(i, 'isHIT', !ex.isHIT)}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black border transition-all uppercase tracking-[0.2em] shadow-sm ${
              ex.isHIT ? 'border-orange bg-orange/10 text-orange' : 'border-line bg-bg2 text-dim'
            }`}>
            HIT Modus
          </button>
          
          {!isActuallyHIT && currentVolume > 0 && (
            <div className="hidden sm:flex flex-col items-end justify-center px-4 border-l border-line/30">
               <span className="text-[8px] font-black uppercase tracking-widest text-dim/40">Gesamtvolumen</span>
               <span className="text-xs font-mono font-black text-accent">{Math.round(currentVolume).toLocaleString('de-AT')} kg</span>
            </div>
          )}
        </div>
      </div>

      {/* Detail Toggle for Mobile Volume */}
      {!isActuallyHIT && currentVolume > 0 && (
        <div className="sm:hidden px-4 py-2 bg-accent/5 border-t border-accent/10 flex justify-between items-center">
           <span className="text-[9px] font-black uppercase tracking-widest text-dim/60 flex items-center gap-1">
             <Activity size={10} /> Vol: {Math.round(currentVolume).toLocaleString('de-AT')} kg
           </span>
           {volDiff !== 0 && (
             <span className={`text-[9px] font-black ${volDiff > 0 ? 'text-green' : 'text-red'}`}>
               {volDiff > 0 ? '↗' : '↘'} {Math.abs(Math.round(volDiff))}%
             </span>
           )}
        </div>
      )}
    </div>
  );
}
