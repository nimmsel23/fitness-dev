import { useEffect, useMemo, useState } from 'react';
import { FileText, Printer } from 'lucide-react';
import { getSessionHistory } from '@db';

// Trainingsprotokoll — Pendant zum Ernährungsprotokoll in fuel-dev
// (NutritionReportView): abgabefertiges Protokoll als weißes Blatt, Ausgabe per
// window.print() ("Als PDF speichern"). Die Pflichtaufgabe verlangt N (40)
// Einheiten ohne festen Zeitraum: ab einem Anker-Datum zählen die N Einheiten
// davor (inkl. Anker-Tag) bzw. danach. Tabelle je Tag: Übung, Sätze (Wdh × kg),
// Tagesvolumen.

const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const NAME_STORAGE_KEY = 'fitness-report-name';

function isoToday() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function shiftIso(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function fmtDE(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return `${DAY_NAMES[d.getDay()]}, ${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
}
const num = (v) => Number(v) || 0;
const r1 = (v) => Math.round(num(v) * 10) / 10;

function setsOf(ex) {
  if (Array.isArray(ex?.setsArray) && ex.setsArray.length) return ex.setsArray;
  if (Array.isArray(ex?.sets) && ex.sets.length) return ex.sets;
  return [];
}
function exName(ex) {
  return ex?.name || ex?.exercise_name || ex?.exercise_id || ex?.id || 'Übung';
}
function fmtSet(s) {
  const reps = s.reps ?? s.rep;
  const w = num(s.weight);
  if (reps == null && !w) return s.duration ? `${s.duration} s` : '–';
  return w ? `${reps ?? '?'}×${r1(w)}` : `${reps ?? '?'}`;
}
function volume(ex) {
  return setsOf(ex).reduce((a, s) => a + num(s.reps) * num(s.weight), 0);
}

export default function TrainingProtocol() {
  const [direction, setDirection] = useState('before'); // before = die N Einheiten bis Datum, after = ab Datum
  const [anchorIso, setAnchorIso] = useState(isoToday());
  const [count, setCount] = useState(40);
  const [sessions, setSessions] = useState(null);
  const [name, setName] = useState(() => {
    try { return localStorage.getItem(NAME_STORAGE_KEY) || ''; } catch { return ''; }
  });

  useEffect(() => {
    let alive = true;
    getSessionHistory(2000)
      .then((h) => { if (alive) setSessions(Array.isArray(h) ? h : []); })
      .catch(() => { if (alive) setSessions([]); });
    return () => { alive = false; };
  }, []);

  const changeName = (v) => {
    setName(v);
    try { localStorage.setItem(NAME_STORAGE_KEY, v); } catch { /* ignore */ }
  };

  const picked = useMemo(() => {
    const n = Math.max(1, Math.min(500, Math.floor(Number(count)) || 40));
    const sorted = (sessions || []).filter((s) => s?.date).sort((a, b) => a.date.localeCompare(b.date));
    return direction === 'before'
      ? sorted.filter((s) => s.date <= anchorIso).slice(-n)
      : sorted.filter((s) => s.date >= anchorIso).slice(0, n);
  }, [sessions, direction, anchorIso, count]);

  const days = useMemo(() => {
    const byDate = new Map();
    for (const s of picked) {
      if (!byDate.has(s.date)) byDate.set(s.date, []);
      byDate.get(s.date).push(s);
    }
    return [...byDate.entries()];
  }, [picked]);

  const summary = useMemo(() => {
    let sets = 0, vol = 0, exercises = 0;
    for (const [, list] of days) for (const s of list) for (const ex of s.exercises || []) {
      exercises += 1;
      sets += setsOf(ex).length;
      vol += volume(ex);
    }
    return { sessions: days.reduce((a, [, l]) => a + l.length, 0), days: days.length, exercises, sets, vol };
  }, [days]);

  const fromIso = picked[0]?.date || anchorIso;
  const toIso = picked[picked.length - 1]?.date || anchorIso;

  return (
    <div className="space-y-6">
      <div className="no-print rounded-3xl border border-fit-line bg-fit-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-fit-accent" />
          <div>
            <h2 className="text-xl font-bold tracking-tight">Trainingsprotokoll</h2>
            <p className="text-sm text-fit-dim">Abgabefertiges Protokoll über eine feste Anzahl Einheiten (Pflichtaufgabe: 40). Datum und Richtung wählen, dann drucken bzw. als PDF speichern.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex gap-2">
            {[['before', 'Vorherige Einheiten'], ['after', 'Folgende Einheiten']].map(([v, l]) => (
              <button key={v} onClick={() => setDirection(v)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${direction === v ? 'bg-fit-accent text-black' : 'border border-fit-line text-fit-dim hover:text-ink'}`}>
                {l}
              </button>
            ))}
          </div>
          <label className="grid gap-1 text-xs text-fit-dim">{direction === 'before' ? 'Bis Datum (inkl.)' : 'Ab Datum (inkl.)'}
            <input type="date" value={anchorIso} onChange={(e) => setAnchorIso(e.target.value)}
              className="rounded-2xl border border-fit-line bg-transparent px-3 py-2 text-sm text-ink" />
          </label>
          <label className="grid gap-1 text-xs text-fit-dim">Einheiten
            <input type="number" min={1} max={500} value={count} onChange={(e) => setCount(e.target.value)}
              className="w-24 rounded-2xl border border-fit-line bg-transparent px-3 py-2 text-sm text-ink" />
          </label>
          <label className="grid gap-1 text-xs text-fit-dim flex-1 min-w-[200px]">Name (auf dem Protokoll)
            <input type="text" value={name} placeholder="Vor- und Nachname" onChange={(e) => changeName(e.target.value)}
              className="rounded-2xl border border-fit-line bg-transparent px-3 py-2 text-sm text-ink" />
          </label>
          <button onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-fit-accent px-5 py-2.5 text-sm font-semibold text-black">
            <Printer className="h-4 w-4" /> Drucken / als PDF
          </button>
        </div>
        <p className="text-xs text-fit-dim">{summary.sessions} von {Math.max(1, Math.floor(Number(count)) || 40)} gewünschten Einheiten gefunden ({summary.days} Trainingstage).</p>
      </div>

      <div className="report-sheet mx-auto max-w-[820px] rounded-2xl p-10">
        {sessions === null ? (
          <p style={{ fontStyle: 'italic', color: '#6b7280' }}>Daten werden geladen…</p>
        ) : (
          <>
            <header style={{ borderBottom: '2px solid #14181f', paddingBottom: 10, marginBottom: 12 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Trainingsprotokoll</h1>
              <p style={{ margin: '8px 0 0' }}><strong>Name:</strong> {name || '—'}</p>
              <p style={{ margin: '2px 0 0' }}><strong>Umfang:</strong> {summary.sessions} Einheiten · {summary.sessions ? `${fmtDE(fromIso)} – ${fmtDE(toIso)}` : '—'}</p>
            </header>

            <section>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px' }}>Auswertung</h2>
              <table>
                <tbody>
                  <tr><td>Trainingstage</td><td className="num">{summary.days}</td></tr>
                  <tr><td>Einheiten</td><td className="num">{summary.sessions}</td></tr>
                  <tr><td>Übungen gesamt</td><td className="num">{summary.exercises}</td></tr>
                  <tr><td>Sätze gesamt</td><td className="num">{summary.sets}</td></tr>
                  <tr><td>Gesamtvolumen (Wdh × kg)</td><td className="num">{Math.round(summary.vol)} kg</td></tr>
                </tbody>
              </table>
            </section>

            {days.length === 0 && (
              <p style={{ fontStyle: 'italic', color: '#6b7280', marginTop: 18 }}>Keine Einheiten gefunden.</p>
            )}

            {days.map(([iso, list], i) => (
              <section key={iso} className={`report-day${i > 0 && i % 3 === 0 ? ' report-page-break' : ''}`} style={{ marginTop: 18 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>{fmtDE(iso)}</h3>
                {list.map((s, si) => {
                  const exs = s.exercises || [];
                  const total = exs.reduce((a, ex) => a + volume(ex), 0);
                  return (
                    <table key={s.id || si} style={{ marginBottom: 8 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '34%' }}>Übung{s.block ? ` (${s.block})` : ''}</th>
                          <th>Sätze (Wdh×kg)</th>
                          <th className="num" style={{ width: '14%' }}>Volumen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exs.map((ex, ei) => (
                          <tr key={ex.exercise_id || ex.id || ei}>
                            <td>{exName(ex)}</td>
                            <td>{setsOf(ex).map(fmtSet).join(' · ') || '–'}</td>
                            <td className="num">{Math.round(volume(ex)) || '–'}</td>
                          </tr>
                        ))}
                        <tr className="day-total">
                          <td colSpan={2}>Gesamt</td>
                          <td className="num">{Math.round(total)} kg</td>
                        </tr>
                      </tbody>
                    </table>
                  );
                })}
              </section>
            ))}

            <footer style={{ marginTop: 24, paddingTop: 8, borderTop: '1px solid #c8ccd4', color: '#6b7280' }}>
              Erstellt am {fmtDE(isoToday())} · Fitness
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
