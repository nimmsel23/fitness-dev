import { X, Target, Dumbbell, Book, Brain } from "lucide-react";

export default function JournalModal({ selectedEntry, setSelectedEntry, habits, formatRelativeDate, date }) {
  if (!selectedEntry) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEntry(null)} />
      
      <div className="relative w-full max-w-2xl bg-[var(--card)] rounded-[32px] border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
         {/* Modal Header */}
         <div className="p-6 border-b border-[var(--line)]/50 flex items-center justify-between bg-gradient-to-r from-[var(--card)] to-[var(--bg2)]">
            <div className="flex items-center gap-3">
               {(() => {
                  const isHabit = selectedEntry.type === 'habit';
                  const isWorkout = selectedEntry.type === 'workout';
                  const habit = isHabit ? habits.find(h => h.uuid === selectedEntry.habitId) : null;
                  
                  return (
                    <>
                      <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                         {isHabit ? <Target size={20} /> : isWorkout ? <Dumbbell size={20} /> : <Book size={20} />}
                      </div>
                      <div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">
                           {isHabit ? habit?.name : isWorkout ? selectedEntry.block : "Journal Eintrag"}
                         </h3>
                         <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                           {formatRelativeDate(date)} • {selectedEntry.time ? selectedEntry.time.slice(11, 16) : (selectedEntry.updated_at?.seconds ? new Date(selectedEntry.updated_at.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Ganzen Tag")} Uhr
                         </div>
                      </div>
                    </>
                  );
               })()}
            </div>
            <button onClick={() => setSelectedEntry(null)} className="p-3 rounded-2xl hover:bg-[var(--bg2)] text-[var(--dim)] transition-all">
               <X size={24} />
            </button>
         </div>

         {/* Modal Body */}
         <div className="flex-1 overflow-y-auto p-8 sm:p-10">
            <p className="text-lg sm:text-xl font-medium leading-relaxed text-[var(--ink)]/90 whitespace-pre-wrap selection:bg-[var(--accent)]/30">
               {selectedEntry.text}
            </p>

            {selectedEntry.type === 'habit' && selectedEntry.coachFeedback && (
              <div className="mt-12 p-6 rounded-[24px] bg-[var(--accent)]/5 border border-[var(--accent)]/20 relative overflow-hidden group">
                 <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-[var(--accent)]">
                    <Brain size={120} />
                 </div>
                 <div className="flex items-center gap-2 mb-4">
                    <Brain size={18} className="text-[var(--accent)]" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">Coach Feedback</span>
                 </div>
                 <p className="text-sm sm:text-base font-bold italic text-[var(--ink)]/80 leading-relaxed relative z-10">
                    "{selectedEntry.coachFeedback}"
                 </p>
              </div>
            )}
         </div>

         {/* Modal Footer */}
         <div className="p-6 border-t border-[var(--line)]/50 bg-[var(--bg2)]/50 flex justify-end">
            <button onClick={() => setSelectedEntry(null)} className="btn bg-[var(--card)] border border-[var(--line)] text-[var(--ink)] px-8 py-2.5 text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent)] transition-all">
               Schließen
            </button>
         </div>
      </div>
    </div>
  );
}
