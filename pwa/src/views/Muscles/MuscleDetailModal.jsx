import { X, Target, Brain, Info, BookOpen } from "lucide-react";

export default function MuscleDetailModal({ muscleId, muscleData, onClose, loading }) {
  if (!muscleId) return null;

  const name = muscleData?.display_name || muscleId.charAt(0).toUpperCase() + muscleId.slice(1);
  const latin = muscleData?.latin_name;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[var(--card)] rounded-[32px] border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
         {/* Modal Header */}
         <div className="p-6 border-b border-[var(--line)]/50 flex items-center justify-between bg-gradient-to-r from-[var(--card)] to-[var(--bg2)]">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <Target size={20} />
               </div>
               <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--ink)]">
                    {name}
                  </h3>
                  {latin && (
                    <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest italic">
                       {latin}
                    </div>
                  )}
               </div>
            </div>
            <button onClick={onClose} className="p-3 rounded-2xl hover:bg-[var(--bg2)] text-[var(--dim)] transition-all">
               <X size={24} />
            </button>
         </div>

         {/* Modal Body */}
         <div className="flex-1 overflow-y-auto p-8 sm:p-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                 <div className="spinner mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Lade Anatomie-Details…</p>
              </div>
            ) : muscleData ? (
              <div className="space-y-8">
                 {/* Biomechanics Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {muscleData.origin && (
                      <div className="p-5 rounded-2xl border bg-bg2 border-line/50">
                         <div className="label-caps !mb-3 flex items-center gap-2">
                            <Info size={14} className="text-accent" />
                            Ursprung
                         </div>
                         <p className="text-sm font-medium leading-relaxed text-ink/80">{muscleData.origin}</p>
                      </div>
                    )}
                    {muscleData.insertion && (
                      <div className="p-5 rounded-2xl border bg-bg2 border-line/50">
                         <div className="label-caps !mb-3 flex items-center gap-2">
                            <Info size={14} className="text-accent" />
                            Ansatz
                         </div>
                         <p className="text-sm font-medium leading-relaxed text-ink/80">{muscleData.insertion}</p>
                      </div>
                    )}
                    {muscleData.innervation && (
                      <div className="p-5 rounded-2xl border bg-bg2 border-line/50">
                         <div className="label-caps !mb-3 flex items-center gap-2">
                            <Brain size={14} className="text-accent" />
                            Innervation
                         </div>
                         <p className="text-sm font-medium leading-relaxed text-ink/80">{muscleData.innervation}</p>
                      </div>
                    )}
                    {muscleData.function && (
                      <div className="p-5 rounded-2xl border bg-bg2 border-line/50">
                         <div className="label-caps !mb-3 flex items-center gap-2">
                            <BookOpen size={14} className="text-accent" />
                            Funktion
                         </div>
                         <p className="text-sm font-medium leading-relaxed text-ink/80">{muscleData.function}</p>
                      </div>
                    )}
                 </div>

                 {/* Exercises Section Placeholder */}
                 <div className="pt-4 border-t border-line/30">
                    <div className="label-caps mb-4">Übungsvorschläge</div>
                    <p className="text-xs italic opacity-40">Klassische Übungen für {name} folgen…</p>
                 </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-[32px] border border-dashed border-[var(--line)] opacity-20">
                <p className="text-sm font-black uppercase tracking-widest">Keine detaillierten Anatomie-Daten verfügbar</p>
              </div>
            )}
         </div>

         {/* Modal Footer */}
         <div className="p-6 border-t border-[var(--line)]/50 bg-[var(--bg2)]/50 flex justify-end">
            <button onClick={onClose} className="btn bg-[var(--card)] border border-[var(--line)] text-[var(--ink)] px-8 py-2.5 text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent)] transition-all">
               Schließen
            </button>
         </div>
      </div>
    </div>
  );
}
