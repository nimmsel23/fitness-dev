import { useEffect, useState } from "react";
import { getJournal, saveJournal } from "../db.js";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const today = todayISO();

  useEffect(() => { getJournal(today).then(setEntries); }, [today]);

  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    const entry = await saveJournal(today, text);
    setEntries([entry, ...entries]);
    setText("");
    setSaving(false);
  }

  return (
    <>
      <h2>Journal</h2>
      <div className="card">
        <textarea placeholder="Notiz…" value={text}
          onChange={(e) => setText(e.target.value)} />
        <button className="btn" style={{ marginTop: 8, width: "100%" }}
          onClick={submit} disabled={saving || !text.trim()}>
          {saving ? "…" : "Speichern"}
        </button>
      </div>
      {entries.map((e, i) => (
        <div key={e.id || i} className="card">
          <p>{e.text}</p>
          <p className="muted" style={{ marginTop: 4 }}>{e.time?.slice(11, 16)}</p>
        </div>
      ))}
    </>
  );
}
