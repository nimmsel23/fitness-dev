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
      <div className="flex gap-2 mb-6">
        <input type="date" value={date} max={localToday()}
          onChange={e => setDate(e.target.value)}
          className="flex-1 p-3 rounded-xl border font-bold bg-card border-line text-ink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
        <div className="space-y-4">
          <div className="label-caps px-1">Neuer Eintrag</div>
          <div className="p-5 rounded-3xl border bg-card border-line shadow-xl">
            <textarea value={text} onChange={e => setText(e.target.value)} rows={12}
              placeholder="Was hast du heute gelernt? Wie war das Training?"
              className="w-full bg-transparent border-none outline-none text-sm leading-relaxed resize-none text-ink"
            />
            <button onClick={submit} disabled={saving || !text.trim()}
              className="btn btn-primary w-full mt-4"
              style={{ opacity: saving || !text.trim() ? 0.5 : 1 }}>
              {saving ? "…" : "Eintrag speichern"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="label-caps px-1">Einträge — {date}</div>
          <div className="space-y-3">
            {entries.length > 0 ? (
              entries.map((e, i) => (
                <div key={e.id || i} className="p-5 rounded-2xl border bg-card border-line hover:border-accent/20 transition-colors">
                  <p className="text-sm leading-relaxed text-ink">{e.text}</p>
                  {e.time && (
                    <div className="flex items-center gap-2 mt-4 opacity-30">
                       <div className="w-1 h-1 rounded-full bg-accent" />
                       <span className="text-[10px] font-bold font-mono">{e.time.slice(11, 16)} Uhr</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center rounded-3xl border border-dashed border-line opacity-30">
                <p className="text-sm">Keine Einträge für diesen Tag</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-card text-accent border border-line">
          {toast}
        </div>
      )}
    </div>
  )
}
