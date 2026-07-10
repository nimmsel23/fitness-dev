import { useState, useEffect } from 'react';
import { User2, Save, Check } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { updateUserProfile } from '@db';

const inputCls = "w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-bold text-fit-ink focus:border-fit-accent outline-none transition-colors";

export default function ProfileSection() {
  const { 
    user, 
    gender, setGender, 
    age, setAge, 
    heightCm, setHeightCm, 
    weightKg, setWeightKg 
  } = useUser();

  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  async function handleSave() {
    if (!user || !user.uid) return;
    setSaving(true);

    const success = await updateUserProfile(user.uid, {
      displayName,
      email: user.email,
      gender,
      age,
      heightCm,
      weightKg
    });

    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  if (!user) return null;

  return (
    <section className="card p-8 space-y-6 border-t-4 border-t-fit-accent animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-fit-accent/10 flex items-center justify-center">
          <User2 size={20} className="text-fit-accent" />
        </div>
        <div>
          <h3 className="text-xl font-black text-fit-ink">Körperprofil</h3>
          <div className="text-[10px] font-black uppercase tracking-widest text-fit-dim">{user.email}</div>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Anzeigename (Für den Coach)</div>
        <input 
          type="text" 
          value={displayName} 
          placeholder="Dein Vor- und Nachname"
          onChange={e => setDisplayName(e.target.value)}
          className={inputCls} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Geschlecht</div>
          <div className="flex gap-1 p-1 bg-fit-bg2 rounded-xl border border-fit-line">
            {[{ id: 'm', label: 'Männlich' }, { id: 'f', label: 'Weiblich' }].map(({ id, label }) => (
              <button 
                key={id} 
                onClick={() => setGender(id)}
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${gender === id ? 'bg-fit-card shadow-md text-fit-accent' : 'text-fit-dim hover:text-fit-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Alter</div>
          <input 
            type="number" value={age || ''} min={15} max={99}
            onChange={e => setAge(Number(e.target.value))}
            className={inputCls} 
          />
          <div className="text-[9px] font-bold opacity-30 ml-1 mt-1">Jahre</div>
        </div>

        <div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Größe</div>
          <input 
            type="number" value={heightCm || ''} min={120} max={230}
            onChange={e => setHeightCm(Number(e.target.value))}
            className={inputCls} 
          />
          <div className="text-[9px] font-bold opacity-30 ml-1 mt-1">cm</div>
        </div>

        <div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Gewicht</div>
          <input 
            type="number" value={weightKg || ''} min={30} max={300} step={0.5}
            onChange={e => setWeightKg(Number(e.target.value))}
            className={inputCls} 
          />
          <div className="text-[9px] font-bold opacity-30 ml-1 mt-1">kg</div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !displayName.trim()}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-4 bg-fit-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
      >
        {saving ? (
          <span className="animate-pulse">Speichert in Cloud...</span>
        ) : saved ? (
          <>
            <Check size={14} /> Cloud synchronisiert
          </>
        ) : (
          <>
            <Save size={14} /> Profil & Daten speichern
          </>
        )}
      </button>
    </section>
  );
}
