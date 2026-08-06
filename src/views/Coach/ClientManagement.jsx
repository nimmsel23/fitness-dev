import { useState, useEffect } from 'react';
import { Users, Star, UserCheck } from 'lucide-react';
import { getAllUserProfiles, getUserProfile, updateUserProfile } from '@db';

const STATUS_OPTIONS = [
  { id: 'client', label: 'Klient', hint: 'Zahlend & committed — volle Coach-Aufmerksamkeit', icon: Star, color: 'text-fit-accent' },
  { id: 'friend', label: 'Freund/Test', hint: 'Testet die App — kein aktives Coaching-Commitment', icon: UserCheck, color: 'text-fit-dim' },
];

export default function ClientManagement() {
  const [profiles, setProfiles] = useState({});
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

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

  const uids = Object.keys(profiles);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-fit-accent/30 border-t-fit-accent rounded-full animate-spin" />
    </div>
  );

  if (uids.length === 0) return (
    <div className="card py-20 flex flex-col items-center justify-center text-center opacity-30 border-dashed">
      <Users size={48} className="mb-4 text-fit-dim" />
      <h3 className="text-lg font-black">Keine Nutzer</h3>
      <p className="text-xs font-bold uppercase tracking-widest mt-1">Es haben sich noch keine Klienten registriert</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-fit-dim px-1">
        Status legt fest, wen du als committed betreust — rein informativ, keine Firestore-Regel hängt daran.
      </p>
      {uids.map((uid) => {
        const profile = profiles[uid];
        const name = profile.displayName || profile.email || uid;
        const status = statuses[uid] || 'friend';
        return (
          <div key={uid} className="card p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-bold text-fit-ink truncate">{name}</div>
              {profile.email && profile.email !== name && (
                <div className="text-[10px] text-fit-dim truncate">{profile.email}</div>
              )}
            </div>
            <div className="flex gap-1 p-1 bg-fit-bg2 rounded-xl border border-fit-line/40 shrink-0">
              {STATUS_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = status === opt.id;
                return (
                  <button
                    key={opt.id}
                    title={opt.hint}
                    disabled={saving === uid}
                    onClick={() => setStatus(uid, opt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 ${
                      active ? 'bg-fit-accent text-black' : 'text-fit-dim hover:text-fit-ink'
                    }`}
                  >
                    <Icon size={12} className={active ? '' : opt.color} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
