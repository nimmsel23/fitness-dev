import { useRef, useState } from 'react';
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, Link2, Wifi } from 'lucide-react';
import { FILE_ADAPTERS, LIVE_ADAPTERS, findFileAdapterFor, fileAdapterAccept } from '../../lib/tours/adapters/index.js';

export default function TourImportPanel({ onImportParsed }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null); // { ok, message }
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setBusy(true);
    setToast(null);
    let ok = 0;
    let failed = [];
    for (const file of files) {
      const adapter = findFileAdapterFor(file.name);
      if (!adapter) {
        failed.push(`${file.name} (Format nicht unterstützt — GPX/TCX/FIT)`);
        continue;
      }
      try {
        const tour = await adapter.parse(file);
        await onImportParsed(tour);
        ok += 1;
      } catch (err) {
        failed.push(`${file.name}: ${err?.message || 'Import fehlgeschlagen'}`);
      }
    }
    setBusy(false);
    if (ok > 0 && failed.length === 0) {
      setToast({ ok: true, message: `${ok} Tour${ok > 1 ? 'en' : ''} importiert.` });
    } else if (ok > 0) {
      setToast({ ok: true, message: `${ok} importiert, ${failed.length} fehlgeschlagen: ${failed.join('; ')}` });
    } else {
      setToast({ ok: false, message: failed.join('; ') || 'Import fehlgeschlagen.' });
    }
    setTimeout(() => setToast(null), 6000);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: 'var(--dim)', opacity: 0.7 }}>
        <UploadCloud size={14} className="text-fit-accent" />
        Tour importieren
      </div>

      {/* Datei-Import — lauffähig, kein API-Key nötig */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
          dragOver ? 'border-fit-orange bg-fit-orange/10' : 'border-fit-line hover:border-fit-orange/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={fileAdapterAccept()}
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {busy ? (
          <div className="flex flex-col items-center gap-2 text-fit-dim">
            <Loader2 size={24} className="animate-spin text-fit-orange" />
            <span className="text-xs font-semibold">Importiere…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-fit-dim">
            <UploadCloud size={24} className="opacity-40" />
            <span className="text-xs font-semibold">
              GPX/TCX/FIT-Datei hier ablegen oder klicken
            </span>
            <span className="text-[10px] opacity-40">
              Export aus Garmin Connect, Strava, Komoot, Google Fit Takeout oder Apple Health
            </span>
          </div>
        )}
      </div>

      {toast && (
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl text-xs font-semibold ${
          toast.ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {toast.ok ? <CheckCircle2 size={14} className="shrink-0 mt-0.5" /> : <AlertCircle size={14} className="shrink-0 mt-0.5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Live-Connector — ehrlich als nicht konfiguriert markiert */}
      <div className="pt-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-fit-dim/40 mb-2">
          <Wifi size={12} /> Live-Verbindung (noch nicht eingerichtet)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LIVE_ADAPTERS.map((adapter) => (
            <button
              key={adapter.id}
              onClick={() => setToast({ ok: false, message: `${adapter.label}: ${adapter.note}` })}
              className="p-3 rounded-xl border border-fit-line bg-fit-bg2 text-left opacity-70 hover:opacity-100 transition-opacity"
              title={adapter.note}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-fit-ink">
                <Link2 size={12} className="text-fit-dim/40" />
                {adapter.label}
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest text-fit-dim/40 mt-1">
                Nicht konfiguriert
              </div>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-fit-dim/40 mt-2 leading-relaxed">
          Für Google Fit/Garmin/Huawei fehlt ein echter API-Key/OAuth-Client — hier
          klicken zeigt, was konkret fehlt. Apple Health hat kein Web-Live-API;
          bis dahin: Export-Datei oben hochladen.
        </p>
      </div>
    </section>
  );
}
