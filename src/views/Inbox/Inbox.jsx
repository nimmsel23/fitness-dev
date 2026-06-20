import { CheckCircle2, Sparkles, Info } from 'lucide-react';
import { useInbox } from './useInbox';
import InboxCard from './InboxCard';
import { isLocalMode } from '@db';

export default function Inbox({ user, onInspectExercise }) {
  const { exercises, loading, actioning, toast, approve, remove } = useInbox();
  const isSuperUser = isLocalMode() || user?.email?.includes('alpha') || user?.uid === '59ole36uNpNwml5H6VDYCXyCME92';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl font-black text-fit-ink mb-1">Exercise Inbox</h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">KI-angereicherte Neuanfragen</p>
        </div>
        <div className="flex items-center gap-3 bg-fit-accent/10 px-4 py-2 rounded-xl border border-fit-accent/20">
          <Sparkles size={16} className="text-fit-accent" />
          <span className="text-[10px] font-black uppercase text-fit-accent">{exercises.length} Ausstehend</span>
        </div>
      </header>

      {exercises.length === 0 ? (
        <div className="card py-20 flex flex-col items-center justify-center text-center opacity-30 border-dashed">
          <CheckCircle2 size={48} className="mb-4 text-fit-green" />
          <h3 className="text-lg font-black">Alle Anfragen bearbeitet</h3>
          <p className="text-xs font-bold uppercase tracking-widest mt-1">Keine neuen Übungen in der Inbox</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exercises.map(ex => (
            <InboxCard
              key={ex.file_id}
              ex={ex}
              actioning={actioning}
              onApprove={isSuperUser ? approve : null}
              onDelete={remove}
              onInspect={onInspectExercise}
              asMessage
            />
          ))}
        </div>
      )}

      <section className="mt-12 p-8 rounded-3xl bg-blue/5 border border-blue/10">
        <div className="flex items-start gap-4 text-blue">
          <Info size={20} className="shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-2">
              {isSuperUser ? 'Workflow Info' : 'Mitteilungen'}
            </h4>
            <p className="text-xs font-medium leading-relaxed opacity-80">
              {isSuperUser ? (
                <>
                  Übungen in dieser Liste wurden von Klienten angefragt und automatisch durch die KI angereichert.
                  Durch <strong>Freigeben</strong> wird die Übung dauerhaft in den Katalog aufgenommen.
                  Überprüfe die Biomechanik und Coaching-Notes vor der Freigabe.
                </>
              ) : (
                <>
                  Deine neu angefragten Übungen wurden durch die KI angereichert und warten auf die Freigabe durch deinen Coach.
                  Sobald der Coach die Übung freigibt, steht sie dir im Katalog zur Verfügung.
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-fit-card text-fit-accent border border-fit-line animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
