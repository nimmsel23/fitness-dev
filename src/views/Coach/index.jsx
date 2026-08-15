import { useState } from 'react';
import { CheckCircle2, Sparkles, Dumbbell, Layers, Users } from 'lucide-react';
import { useInbox } from '../Inbox/useInbox';
import InboxCard from '../Inbox/InboxCard';
import CatalogBrowser from './CatalogBrowser';
import AssignPlan from './AssignPlan';
import ClientManagement from './ClientManagement';
import ClientWorkoutsFeed from './ClientWorkoutsFeed';

const SUB_TABS = [
  { id: 'exercises', label: (n) => `Übungsanfragen (${n})` },
  { id: 'journals', label: () => 'Klienten-Workouts' },
  { id: 'catalog', label: () => 'Katalog Browser', icon: Dumbbell },
  { id: 'plans', label: () => 'Trainingspläne', icon: Layers },
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
          <h1 className="text-3xl font-black text-fit-ink mb-1">Hidden Chamber</h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Coach Administration & Approval</p>
        </div>
        <div className="flex items-center gap-3 bg-fit-accent/10 px-4 py-2 rounded-xl border border-fit-accent/20">
          <Sparkles size={16} className="text-fit-accent" />
          <span className="text-[10px] font-black uppercase text-fit-accent">
            {activeSubTab === 'exercises' ? `${exercises.length} Tasks` : activeSubTab === 'catalog' ? 'Katalog' : ''}
          </span>
        </div>
      </header>

      {/* Sub-Tabs Selector */}
      <div className="flex gap-6 border-b border-fit-line/30 pb-1">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`pb-2.5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-1 ${activeSubTab === tab.id ? 'border-fit-accent text-fit-ink' : 'border-transparent text-fit-dim hover:text-fit-ink'}`}
            >
              {Icon && <Icon size={14} className="mb-0.5" />} {tab.label(exercises.length)}
            </button>
          );
        })}
      </div>

      {activeSubTab === 'exercises' && (
        exercises.length === 0 ? (
          <div className="card py-20 flex flex-col items-center justify-center text-center opacity-30 border-dashed">
            <CheckCircle2 size={48} className="mb-4 text-fit-green" />
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
                onReenrich={reenrich}
                onInspect={onInspectExercise}
                showUserId
              />
            ))}
          </div>
        )
      )}
      {activeSubTab === 'journals' && <ClientWorkoutsFeed />}
      {activeSubTab === 'catalog' && <CatalogBrowser onInspectExercise={onInspectExercise} />}
      {activeSubTab === 'plans' && <AssignPlan />}
      {activeSubTab === 'clients' && <ClientManagement />}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-fit-card text-fit-accent border border-fit-line animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
