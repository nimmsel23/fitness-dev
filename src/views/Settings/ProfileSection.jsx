import { useState, useEffect } from "react";
import { User, Save, Check } from "lucide-react";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default function ProfileSection({ user }) {
  // Lokaler State für das Eingabefeld
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Setzt den initialen Namen aus dem Auth-Objekt, falls vorhanden
  useEffect(() => {
    if (user && user.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);
  async function handleSave() {
    if (!user || !user.uid) return;
    setSaving(true);
    const db = getFirestore();

    try {
      // Alles in EINEM zentralen Profil-Dokument speichern
      await setDoc(doc(db, "users", user.uid), {
        displayName: displayName,
        email: user.email,
        gender: gender,        // Diese Props musst du der ProfileSection noch übergeben
        weight: weight,        // (Falls du schon States dafür hast)
      height: height,
      updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null; // Rendert nichts, wenn der User noch nicht geladen ist

  return (
    <div className="bg-fit-bg2 rounded-2xl p-6 border border-fit-line">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-fit-accent/10 flex items-center justify-center text-fit-accent">
          <User size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-fit-ink">Dein Profil</h3>
          <p className="text-xs font-medium opacity-40">Client Management Sync</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Read-only Felder für Auth-Daten */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-black text-fit-dim block mb-1">E-Mail</label>
          <div className="px-3 py-2 bg-black/5 rounded-lg text-sm font-medium text-fit-ink opacity-50">
            {user.email || "Keine E-Mail hinterlegt"}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest font-black text-fit-dim block mb-1">Client ID</label>
          <div className="px-3 py-2 bg-black/5 rounded-lg text-xs font-mono text-fit-dim truncate">
            {user.uid}
          </div>
        </div>

        {/* Editierbares Feld für den Namen */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-black text-fit-dim block mb-1">Anzeigename (Für den Coach)</label>
          <input 
            type="text" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Vor- und Nachname"
            className="w-full px-3 py-2 bg-transparent border border-fit-line rounded-lg text-sm font-medium text-fit-ink focus:border-fit-accent focus:outline-none transition-colors"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-fit-accent text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <span className="animate-pulse">Speichert...</span>
          ) : saved ? (
            <>
              <Check size={14} /> Gespeichert
            </>
          ) : (
            <>
              <Save size={14} /> Profil aktualisieren
            </>
          )}
        </button>
      </div>
    </div>
  );
}
