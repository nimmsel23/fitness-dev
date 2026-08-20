import { useState, useEffect } from 'react';
import { Users, Star, UserCheck, Dumbbell, Layers, Target } from 'lucide-react';
import { getAllUserProfiles, getUserProfile, updateUserProfile } from '@db';
import ClientWorkoutsFeed from './ClientWorkoutsFeed';
import AssignPlan from './AssignPlan';
import ClientHabits from './ClientHabits';

const STATUS_OPTIONS = [
  { id: 'client', label: 'Klient', hint: 'Zahlend & committed — volle Coach-Aufmerksamkeit', icon: Star, color: 'text-fit-accent' },
  { id: 'friend', label: 'Freund/Test', hint: 'Testet die App — kein aktives Coaching-Commitment', icon: UserCheck, color: 'text-fit-dim' },
];

const DETAIL_TABS = [
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'habits', label: 'Habits', icon: Target },
  { id: 'plan', label: 'Trainingsplan', icon: Layers },
];

// Klient wählen -> alles zu diesem Klienten (Workouts + Trainingsplan) in
// einer Ansicht. Löst den früher dokumentierten "kein gemeinsamer State
// zwischen Tabs"-Punkt: vorher waren Klienten-Workouts, Trainingspläne und
// Klienten-Verwaltung drei unabhängige Tabs, jeder mit eigener
// Klientenauswahl bzw. gar keiner.
export default function ClientsPanel() {
  const [profiles, setProfiles] = useState({});
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [selectedUid, setSelectedUid] = useState('');
  const [detailTab, setDetailTab] = useState('workouts');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const p = await getAllUserProfiles();
      setProfiles(p);
      const entries = await Promise.all(
        Object.keys(p).map(async (uid) => [uid, (await getUserProfile(uid))?.clientStatus || 'friend'])
      );
      setStatuses(Object.fromEntries(entries));
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(uid, status) {
    setSaving(uid);
    setStatuses(prev => ({ ...prev, [uid]: status }));
    try {
      await updateUserProfile(uid, { clientStatus: status });
    } finally {
      setSaving(null);
    }
  }

  const uids = Object.keys(profiles).sort((a, b) => {
    const nameA = profiles[a].displayName || profiles[a].email || a;
    const nameB = profiles[b].displayName || profiles[b].email || b;
    return nameA.localeCompare(nameB);
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
    </div>
  );

  if (uids.length === 0) return (
    <div className="card py-16 flex flex-col items-center justify-center text-center" style={{ opacity: 0.5 }}>
      <Users size={40} className="mb-3 text-fit-dim" />
      <h3 className="text-base font-semibold text-fit-ink">Keine Nutzer</h3>
      <p className="text-xs mt-1" style={{ color: 'var(--dim)' }}>Es haben sich noch keine Klienten registriert</p>
    </div>
  );

  const selectedProfile = selectedUid ? profiles[selectedUid] : null;
  const selectedName = selectedProfile ? (selectedProfile.displayName || selectedProfile.email || selectedUid) : '';

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-16rem)] min-h-[480px] border border-fit-line/30 rounded-2xl overflow-hidden bg-fit-bg">
      {/* Klientenliste */}
      <div className="w-full md:w-72 md:border-r border-b md:border-b-0 border-fit-line/30 bg-fit-bg2/50 flex flex-col shrink-0 max-h-56 md:max-h-none overflow-y-auto">
        <div className="px-4 py-3 text-xs font-medium sticky top-0 bg-fit-bg2/80 backdrop-blur-sm" style={{ color: 'var(--dim)', opacity: 0.6 }}>
          {uids.length} Klient{uids.length === 1 ? '' : 'en'}
        </div>
        <ul className="divide-y divide-fit-line/20">
          {uids.map((uid) => {
            const profile = profiles[uid];
            const name = profile.displayName || profile.email || uid;
            const status = statuses[uid] || 'friend';
            const statusOpt = STATUS_OPTIONS.find(o => o.id === status);
            const StatusIcon = statusOpt?.icon;
            const isSelected = selectedUid === uid;
            return (
              <li
                key={uid}
                className={`px-4 py-3 cursor-pointer transition-all border-l-2 ${isSelected ? 'bg-fit-accent/10 border-l-fit-accent' : 'border-l-transparent hover:bg-fit-bg'}`}
                onClick={() => { setSelectedUid(uid); setDetailTab('workouts'); }}
              >
                <div className={`text-sm font-semibold truncate ${isSelected ? 'text-fit-accent' : 'text-fit-ink'}`}>{name}</div>
                {statusOpt && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <StatusIcon size={11} className={statusOpt.color} />
                    <span className="text-xs" style={{ color: 'var(--dim)', opacity: 0.6 }}>{statusOpt.label}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Klienten-Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedUid ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-8" style={{ opacity: 0.5 }}>
            <Users className="w-10 h-10 text-fit-dim" />
            <h3 className="text-base font-semibold text-fit-dim">Klient wählen</h3>
            <p className="text-xs max-w-sm leading-relaxed">
              Wähle links einen Klienten, um Workouts, Feedback und Trainingsplan an einem Ort zu sehen.
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-fit-line/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-fit-ink truncate">{selectedName}</h3>
                {selectedProfile.email && selectedProfile.email !== selectedName && (
                  <p className="text-xs truncate" style={{ color: 'var(--dim)', opacity: 0.6 }}>{selectedProfile.email}</p>
                )}
              </div>
              <div className="flex gap-1 p-1 bg-fit-bg2 rounded-full border border-fit-line/40 shrink-0">
                {STATUS_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const active = (statuses[selectedUid] || 'friend') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      title={opt.hint}
                      disabled={saving === selectedUid}
                      onClick={() => setStatus(selectedUid, opt.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-50 ${active ? 'bg-fit-accent text-black' : 'text-fit-dim hover:text-fit-ink'}`}
                    >
                      <Icon size={12} className={active ? '' : opt.color} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-5 px-4 border-b border-fit-line/30 shrink-0">
              {DETAIL_TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={`py-2.5 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 ${detailTab === tab.id ? 'border-fit-accent text-fit-ink' : 'border-transparent text-fit-dim hover:text-fit-ink'}`}
                  >
                    <Icon size={13} /> {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {detailTab === 'workouts' && <ClientWorkoutsFeed clientUid={selectedUid} />}
              {detailTab === 'habits' && <ClientHabits clientUid={selectedUid} />}
              {detailTab === 'plan' && <AssignPlan clientUid={selectedUid} clientName={selectedName} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
