import { Bell, CheckCircle2, RefreshCw } from 'lucide-react';
import { useInbox } from './useInbox';
import InboxCard from './InboxCard';

export default function Inbox() {
  const { exercises: items, loading, actioning, toast, remove } = useInbox({ global: false });

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-end justify-between px-1 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Bell size={26} className="text-fit-accent" />
            <h1 className="text-3xl font-black text-fit-ink">Mitteilungen</h1>
          </div>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Dein persönlicher Benachrichtigungs-Feed</p>
        </div>
        {items.length > 0 && (
          <div className="flex items-center gap-2 bg-fit-accent/10 px-3 py-1.5 rounded-xl border border-fit-accent/20 shrink-0">
            <span className="text-[10px] font-black uppercase text-fit-accent">{items.length} neu</span>
          </div>
        )}
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card py-20 flex flex-col items-center justify-center text-center border-dashed opacity-40">
          <CheckCircle2 size={44} className="mb-4 text-fit-green" />
          <h3 className="text-lg font-black">Alles auf dem neuesten Stand</h3>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Keine neuen Mitteilungen</p>
        </div>
      ) : (
        <div className="grid gap-3 animate-in fade-in duration-300">
          {items.map(item => (
            <InboxCard
              key={item.file_id}
              ex={item}
              actioning={actioning}
              onApprove={null}
              onDelete={remove}
              asMessage
            />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-fit-card text-fit-accent border border-fit-line animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
