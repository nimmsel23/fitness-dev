import { useState } from 'react';
import { CheckCircle2, Sparkles, Dumbbell, Users } from 'lucide-react';
import { useInbox } from '../Inbox/useInbox';
import InboxCard from '../Inbox/InboxCard';
import CatalogBrowser from './CatalogBrowser';
import ClientsPanel from './ClientsPanel';

const SUB_TABS = [
  { id: 'exercises', label: (n) => `Übungsanfragen (${n})` },
  { id: 'catalog', label: () => 'Katalog Browser', icon: Dumbbell },
  { id: 'clients', label: () => 'Klienten', icon: Users },
];

export default function Coach({ onInspectExercise }) {
  const { exercises, loading, actioning, toast, approve, remove, reenrich } = useInbox({ global: true });
  const [activeSubTab, setActiveSubTab] = useState('exercises');

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-xl font-bold text-fit-ink mb-1">Coach</h1>
          <p className="text-xs" style={{ color: 'var(--dim)', opacity: 0.6 }}>Verwaltung & Freigaben</p>
        </div>
        <div className="flex items-center gap-2.5 bg-fit-accent/10 px-3.5 py-2 rounded-full border border-fit-accent/20">
          <Sparkles size={14} className="text-fit-accent" />
          <span className="text-xs font-semibold text-fit-accent">
            {activeSubTab === 'exercises' ? `${exercises.length} offen` : activeSubTab === 'catalog' ? 'Katalog' : ''}
          </span>
        </div>
      </header>

      {/* Sub-Tabs Selector */}
      <div className="flex gap-5 border-b border-fit-line/30 pb-1 overflow-x-auto">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`pb-2.5 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeSubTab === tab.id ? 'border-fit-accent text-fit-ink' : 'border-transparent text-fit-dim hover:text-fit-ink'}`}
            >
              {Icon && <Icon size={14} />} {tab.label(exercises.length)}
            </button>
          );
        })}
      </div>

      {activeSubTab === 'exercises' && (
        exercises.length === 0 ? (
          <div className="card py-16 flex flex-col items-center justify-center text-center" style={{ opacity: 0.5 }}>
            <CheckCircle2 size={40} className="mb-3 text-fit-green" />
            <h3 className="text-base font-semibold text-fit-ink">Alles freigegeben</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--dim)' }}>Keine offenen Anfragen</p>
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
                onReenrich={reenrich}
                onInspect={onInspectExercise}
                showUserId
              />
            ))}
          </div>
        )
      )}
      {activeSubTab === 'catalog' && <CatalogBrowser onInspectExercise={onInspectExercise} />}
      {activeSubTab === 'clients' && <ClientsPanel />}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg z-50 bg-fit-card text-fit-accent border border-fit-line animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
