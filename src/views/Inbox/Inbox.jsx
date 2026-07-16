import { Bell, MessageSquare, CheckCircle2, Sparkles, Dumbbell, Clock } from 'lucide-react';

const ROADMAP = [
  {
    id: 'coach_comments',
    icon: MessageSquare,
    label: 'Coach-Kommentare',
    description: 'Feedback deines Coaches auf Journal-Einträge und Sessions — direkt hier, ohne App-Wechsel.',
    status: 'next',
    color: 'text-fit-accent',
    bg: 'bg-fit-accent/10 border-fit-accent/20',
  },
  {
    id: 'approved_exercises',
    icon: Dumbbell,
    label: 'Freigegebene Übungen',
    description: 'Wenn der Coach eine neue Übung für dich freigibt, erscheint sie hier — inkl. Anatomie-Details.',
    status: 'next',
    color: 'text-fit-green',
    bg: 'bg-fit-green/10 border-fit-green/20',
  },
  {
    id: 'direct_messages',
    icon: MessageSquare,
    label: 'Direktnachrichten',
    description: 'Persönliche Nachrichten vom Coach — Motivations-Push, Plan-Anpassungen, Hinweise.',
    status: 'planned',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
  {
    id: 'milestones',
    icon: Sparkles,
    label: 'Meilensteine & Erfolge',
    description: 'Automatische Benachrichtigungen wenn du Superkompensations-Fenster triffst, Streak-Records etc.',
    status: 'planned',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/20',
  },
];

const STATUS_LABEL = {
  next: { label: 'Als nächstes', dot: 'bg-fit-accent' },
  planned: { label: 'Geplant', dot: 'bg-fit-dim' },
};

export default function Inbox() {
  return (
    <div className="space-y-10 pb-24">
      <header className="px-1">
        <div className="flex items-center gap-3 mb-2">
          <Bell size={28} className="text-fit-accent" />
          <h1 className="text-3xl font-black text-fit-ink">Mitteilungen</h1>
        </div>
        <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Dein persönlicher Benachrichtigungs-Feed</p>
      </header>

      {/* Empty state */}
      <div className="card py-16 flex flex-col items-center justify-center text-center border-dashed opacity-40">
        <CheckCircle2 size={44} className="mb-4 text-fit-green" />
        <h3 className="text-lg font-black">Alles auf dem neuesten Stand</h3>
        <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Keine neuen Mitteilungen</p>
      </div>

      {/* Roadmap */}
      <section>
        <div className="flex items-center gap-2 mb-5 px-1">
          <Clock size={14} className="text-fit-dim" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fit-dim">Was hier bald erscheint</span>
        </div>
        <div className="grid gap-4">
          {ROADMAP.map(item => {
            const Icon = item.icon;
            const s = STATUS_LABEL[item.status];
            return (
              <div key={item.id} className={`rounded-2xl border p-5 flex items-start gap-4 ${item.bg}`}>
                <div className={`mt-0.5 shrink-0 ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-fit-ink">{item.label}</span>
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-50">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed opacity-60">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
