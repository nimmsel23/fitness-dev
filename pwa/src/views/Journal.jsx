import { useState, useEffect } from "react";
import { getJournal, saveJournal, localToday } from "../db.js";

export default function Journal() {
  const [date, setDate]     = useState(localToday());
  const [text, setText]     = useState("");
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState("");

  useEffect(() => {
    getJournal(date).then(setEntries).catch(() => setEntries([]));
  }, [date]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2000); }

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const entry = await saveJournal(date, text);
      setEntries(prev => [entry, ...prev]);
      setText("");
      showToast("Gespeichert ✓");
    } catch { showToast("Fehler beim Speichern"); }
    finally { setSaving(false); }
  }

  return (
    <div className="pb-20">
      <div className="flex gap-2 mb-4">
        <input type="date" value={date} max={localToday()}
          onChange={e => setDate(e.target.value)}
          className="flex-1 p-3 rounded-xl border font-bold"
          style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }}
        />
      </div>

      <div className="p-4 rounded-2xl mb-6" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
          placeholder="Training, Notizen, Learnings…"
          className="w-full bg-transparent border-none outline-none text-sm leading-relaxed"
          style={{ color: 'var(--ink)' }}
        />
        <button onClick={submit} disabled={saving || !text.trim()}
          className="w-full mt-4 p-3 rounded-xl font-bold transition-all"
          style={{ 
            background: 'var(--accent)', color: '#fff',
            opacity: saving || !text.trim() ? 0.5 : 1
          }}>
          {saving ? "…" : "Speichern ↵"}
        </button>
      </div>

      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1">
            Einträge — {date}
          </div>
          {entries.map((e, i) => (
            <div key={e.id || i} className="p-4 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{e.text}</p>
              {e.time && <p className="text-[10px] font-bold opacity-30 mt-3 font-mono">{e.time.slice(11, 16)}</p>}
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && date !== localToday() && (
        <p className="text-center py-12 text-sm opacity-40">Kein Eintrag für {date}</p>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-bold shadow-2xl z-50"
          style={{ background: 'var(--card)', color: 'var(--accent)', border: '1px solid var(--line)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
