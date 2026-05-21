import { useState, useEffect } from "react";
import { getJournal, saveJournal } from "../db.js";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const card = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, marginBottom: 12 };

export default function Journal() {
  const [date, setDate]     = useState(todayISO());
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
      showToast("Gespeichert");
    } catch { showToast("Fehler beim Speichern"); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input type="date" value={date} max={todayISO()}
          onChange={e => setDate(e.target.value)}
          style={{ flex: 1, padding: "8px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14 }}
        />
      </div>

      <div style={card}>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
          placeholder="Training, Notizen, Learnings…"
          style={{ width: "100%", background: "transparent", border: "none", color: "var(--text)", fontSize: 14, lineHeight: 1.65, resize: "none", outline: "none" }}
          onFocus={e => e.target.parentElement.style.borderColor = "var(--accent)"}
          onBlur={e => e.target.parentElement.style.borderColor = "var(--border)"}
        />
        <button onClick={submit} disabled={saving || !text.trim()}
          style={{ marginTop: 10, width: "100%", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontWeight: 700, fontSize: 14, cursor: saving || !text.trim() ? "default" : "pointer", opacity: saving || !text.trim() ? 0.5 : 1 }}>
          {saving ? "…" : "Speichern"}
        </button>
      </div>

      {entries.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--muted)", marginBottom: 10 }}>
            Einträge — {date}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {entries.map((e, i) => (
              <div key={e.id || i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ color: "var(--text)", fontSize: 14, lineHeight: 1.6 }}>{e.text}</p>
                {e.time && <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 4 }}>{e.time.slice(11, 16)}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && date !== todayISO() && (
        <p style={{ textAlign: "center", color: "var(--muted)", padding: "24px 0", fontSize: 14 }}>
          Kein Eintrag für {date}
        </p>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "var(--surface)", color: "var(--accent)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 600, zIndex: 50 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
