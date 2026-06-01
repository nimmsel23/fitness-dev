import { Dumbbell } from "lucide-react";
import SectionHeader from "./SectionHeader";
import ExerciseItem from "./ExerciseItem";
import ExerciseSearch from "../../components/ExerciseSearch";

export default function ExerciseSection({ 
  exercises = [], hitMode, restHours, totalVolume, 
  updateEx, addSet, removeSet, removeEx, moveEx, 
  planMode, date, addEx, quickInput, setQuickInput, addQuick 
}) {
  const safeExercises = Array.isArray(exercises) ? exercises : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionHeader>Übungen</SectionHeader>
        {hitMode ? (
          restHours !== null && (
            <div className="text-[10px] font-bold text-accent font-mono uppercase tracking-widest bg-accent/5 px-2 py-1 rounded">
              Rest: {restHours}h
            </div>
          )
        ) : (
          totalVolume > 0 && (
            <div className="text-[10px] font-bold opacity-40 font-mono uppercase tracking-widest">
              Vol: {Math.round(totalVolume).toLocaleString('de-AT')} kg
            </div>
          )
        )}
      </div>
      
      <div className="space-y-3">
        {safeExercises.map((ex, idx) => (
          <ExerciseItem 
            key={idx} 
            ex={ex} 
            i={idx} 
            updateEx={updateEx}
            addSet={addSet}
            removeSet={removeSet}
            removeEx={removeEx} 
            moveEx={moveEx}
            isFirst={idx === 0}
            isLast={idx === safeExercises.length - 1}
            planMode={planMode}
            date={date}
          />
        ))}
        {safeExercises.length === 0 && (
          <div className="card border-dashed flex flex-col items-center justify-center py-12 opacity-30 bg-bg2/30">
            <Dumbbell size={32} className="mb-3" />
            <p className="text-xs font-black uppercase tracking-widest">Keine Übungen geloggt</p>
          </div>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-bg2 border border-line shadow-inner mt-6 space-y-4">
        <div className="label-caps !mb-0 font-black">Übung hinzufügen</div>
        <ExerciseSearch onSelect={addEx} />
        <div className="flex gap-2">
          <input type="text" value={quickInput} onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addQuick()}
            placeholder="Quick Entry (z.B. bench 3x8@80)" className="flex-1 p-3.5 rounded-2xl border text-sm font-mono bg-card border-line text-ink focus:border-accent outline-none shadow-sm" />
          <button onClick={addQuick} className="btn bg-orange/10 text-orange border border-orange/20 px-6 font-black">+</button>
        </div>
      </div>
    </div>
  );
}
