import { CheckCircle2, Sparkles } from 'lucide-react';
import { useInbox } from '../Inbox/useInbox';
import InboxCard from '../Inbox/InboxCard';

export default function Coach({ onInspectExercise }) {
  const { exercises, loading, actioning, toast, approve, remove } = useInbox();

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-ink mb-1">Hidden Chamber</h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Coach Administration & Approval</p>
        </div>
        <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-xl border border-accent/20">
          <Sparkles size={16} className="text-accent" />
          <span className="text-[10px] font-black uppercase text-accent">{exercises.length} Tasks</span>
        </div>
      </header>

      {exercises.length === 0 ? (
        <div className="card py-20 flex flex-col items-center justify-center text-center opacity-30 border-dashed">
          <CheckCircle2 size={48} className="mb-4 text-green" />
          <h3 className="text-lg font-black">Alles freigegeben</h3>
          <p className="text-xs font-bold uppercase tracking-widest mt-1">Keine offenen Anfragen</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exercises.map(ex => (
            <InboxCard
              key={ex.file_id}
              ex={ex}
              actioning={actioning}
              onApprove={approve}
              onDelete={remove}
              onInspect={onInspectExercise}
              showUserId
            />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-card text-accent border border-line animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
