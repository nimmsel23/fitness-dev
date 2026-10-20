import { useEffect, useRef, useState } from 'react';
import BackHeader from './BackHeader.jsx';
import PrivatePhoto from './PrivatePhoto.jsx';
import { prepareSelfie, MAX_DATA_URL } from './selfieCloud.js';
import { createPhotoClient, photoApiBase, transferLegacyPhotos } from './photoClient.mjs';

// Persist each prepared photo before upload; remove it only after cloud confirmation.
// Legacy queues stay bound to their original account.
const SIXPACK_PENDING_KEY = 'fitness-sixpack-selfies-pending-v2';
function loadPendingQueue(uid) {
  try {
    const queue = JSON.parse(window.localStorage.getItem(`${SIXPACK_PENDING_KEY}:${uid}`) || '[]');
    if (!Array.isArray(queue)) throw new Error('invalid queue');
    return queue;
  } catch { throw new Error('Foto-Warteschlange nicht lesbar. Bitte Browserspeicher nicht löschen.'); }
}
function savePendingQueue(uid, queue) {
  window.localStorage.setItem(`${SIXPACK_PENDING_KEY}:${uid}`, JSON.stringify(queue));
}

export default function SelfiesGallery({ onBack, uid, client }) {
  const [serverPhotos, setServerPhotos] = useState([]);
  const [pending, setPending] = useState(() => { try { return loadPendingQueue(uid); } catch { return []; } });
  const [serverOk, setServerOk] = useState(null); // null = unbekannt, true/false
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [selectionResults, setSelectionResults] = useState([]);

  const [legacyBase, setLegacyBase] = useState(() => photoApiBase({ configured: import.meta.env.VITE_SIXPACK_API_BASE || '' }));
  const [importing, setImporting] = useState(false);
  const busy = useRef(false);
  const active = useRef(true);
  const hasUid = typeof uid === 'string' && /^[\w-]{1,128}$/.test(uid);

  /** Loads cloud metadata; image bytes use authenticated requests in PrivatePhoto. */
  async function fetchServerPhotos() {
    try {
      const data = await client.list();
      setServerOk(true);
      if (!data.ok || !Array.isArray(data.photos)) throw new Error('Invalid photo response');
      setServerPhotos(data.photos);
      return true;
    } catch (error) {
      setServerOk(false);
      setStatusMsg(error.message || 'Cloud nicht erreichbar.');
      return false;
    }
  }

  async function upload(item) {
    const dataUrl = item.dataUrl.startsWith('data:image/jpeg;base64,') && item.dataUrl.length <= MAX_DATA_URL
      ? item.dataUrl : await prepareSelfie(await (await fetch(item.dataUrl)).blob());
    await client.uploadData(item.id, item.date, dataUrl);
  }

  async function uploadPending() {
    if (!hasUid || busy.current) return;
    busy.current = true;
    setUploading(true);
    try {
      for (const item of loadPendingQueue(uid)) {
        if (!active.current) break;
        await upload(item);
        // Read fresh storage so photos queued elsewhere are retained.
        const remaining = loadPendingQueue(uid).filter(p => p.id !== item.id);
        savePendingQueue(uid, remaining);
        setPending(remaining);
      }
      await fetchServerPhotos();
    } catch (error) {
      setServerOk(false);
      setStatusMsg(error.message || 'Synchronisierung ausstehend – bitte erneut versuchen.');
    } finally {
      busy.current = false;
      setUploading(false);
    }
  }

  useEffect(() => {
    if (!hasUid) return;
    active.current = true;
    let cancelled = false;
    async function init() {
      const ok = await fetchServerPhotos();
      if (!cancelled && ok) await uploadPending();
    }
    init();
    window.addEventListener('online', init);
    const onVisible = () => { if (document.visibilityState === 'visible') init(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { active.current = false; cancelled = true; window.removeEventListener('online', init); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  async function onFile(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!hasUid || !files.length || busy.current) return;
    busy.current = true;
    setUploading(true);
    setStatusMsg('');
    setSelectionResults([]);
    try {
      for (const [index, file] of files.entries()) {
        if (!active.current) break;
        setStatusMsg(`Foto ${index + 1} von ${files.length} wird verarbeitet …`);
        let message;
        if (!file.size || file.size > 20 * 1024 * 1024 || !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
          message = 'Nicht gespeichert: JPG, PNG, WebP oder HEIC/HEIF bis 20 MB erforderlich.';
        } else {
          const item = { id: crypto.randomUUID(), date: new Date().toISOString(), name: file.name };
          let queued = false;
          try {
            item.dataUrl = await prepareSelfie(file);
            if (!active.current) break;
            // Persist before the request. A tab closed during upload can safely retry.
            const queue = [...loadPendingQueue(uid), item];
            savePendingQueue(uid, queue);
            setPending(queue);
            queued = true;
            await upload(item);
            const remaining = loadPendingQueue(uid).filter(p => p.id !== item.id);
            savePendingQueue(uid, remaining);
            setPending(remaining);
            message = 'In der Cloud gespeichert';
            setServerOk(true);
          } catch (error) {
            setServerOk(false);
            message = queued
              ? `Vorgemerkt – ${error.message || 'Synchronisierung ausstehend'}`
              : `Nicht gespeichert: ${item.dataUrl ? 'Browserspeicher voll oder Warteschlange nicht lesbar.' : 'Bildformat nicht lesbar.'} Bitte Original behalten.`;
          }
        }
        setSelectionResults(results => [...results, { name: file.name, message }]);
      }
      if (active.current) await fetchServerPhotos();
      setStatusMsg(`${files.length} Foto${files.length === 1 ? '' : 's'} verarbeitet.`);
    } finally {
      busy.current = false;
      setUploading(false);
    }
  }

  async function importLegacy() {
    if (busy.current) return;
    busy.current = true;
    setImporting(true);
    setUploading(true);
    try {
      const legacy = createPhotoClient({
        uid, getIdToken: force => client.getIdToken(force), base: legacyBase,
      });
      const count = await transferLegacyPhotos({
        legacy, cloud: client, prepare: prepareSelfie, isActive: () => active.current,
        onProgress: (done, total) => setStatusMsg(`Alte Fotos importieren: ${done}/${total}`),
      });
      setStatusMsg(`${count} alte Fotos in der Cloud verfügbar. Originale bleiben auf dem Server.`);
      await fetchServerPhotos();
    } catch (error) { setStatusMsg(error.message); }
    finally { busy.current = false; setImporting(false); setUploading(false); }
  }

  if (!hasUid) return <div><BackHeader label="Selfies" onBack={onBack} /><p>Bitte zuerst anmelden, um deine Fotos zu öffnen.</p></div>;

  // Alle sichtbaren Fotos: Server-Fotos zuerst, dann ausstehende LocalStorage-Fotos
  const allPhotos = [
    ...serverPhotos.map(p => ({ ...p, source: 'server' })),
    ...pending.filter(p => !serverPhotos.some(s => s.id === p.id)).map(p => ({ id: p.id, date: p.date, dataUrl: p.dataUrl, source: 'pending' })),
  ];

  return (
    <div>
      <BackHeader label="Selfies" onBack={onBack} />

      {/* Upload-Button */}
      <label
        className="block px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em]"
        style={{ background: uploading ? '#a01010' : '#e2001a', color: '#fff', cursor: uploading ? 'wait' : 'pointer' }}
      >
        {uploading ? 'Uploading…' : 'Foto aufnehmen'}
        <input type="file" accept="image/*" capture="user" className="hidden" onChange={onFile} disabled={uploading} />
      </label>

      <label
        className="block px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em]"
        style={{ background: '#222', color: '#fff', cursor: uploading ? 'wait' : 'pointer' }}
      >
        Fotos auswählen
        <input type="file" accept="image/*" multiple className="hidden" onChange={onFile} disabled={uploading} />
      </label>
      {selectionResults.length > 0 && (
        <ul className="px-4 py-2 text-xs space-y-1" aria-live="polite">
          {selectionResults.map((result, index) => <li key={index}>{result.name}: {result.message}</li>)}
        </ul>
      )}

      {/* Status-Zeile */}
      {(statusMsg || serverOk !== null) && (
        <div
          className="px-4 py-2 text-xs text-center font-bold"
          style={{ color: serverOk ? '#4ade80' : '#facc15', background: '#0e0e0e' }}
        >
          {statusMsg || (serverOk
            ? `🟢 Cloud verbunden — ${serverPhotos.length} Foto${serverPhotos.length !== 1 ? 's' : ''} gespeichert`
            : `🟡 Synchronisierung nicht verfügbar — ${pending.length} Foto${pending.length !== 1 ? 's' : ''} ausstehend`
          )}
        </div>
      )}

      {(
        <button className="w-full py-2 text-sm" onClick={() => { setStatusMsg(''); uploadPending(); }} disabled={uploading}>
          Jetzt synchronisieren{pending.length ? ` (${pending.length})` : ''}
        </button>
      )}

      <details className="px-4 py-3 text-xs">
        <summary>Vorhandene Server-Fotos übernehmen</summary>
        <p className="py-2">Importiert nur Fotos deines angemeldeten Kontos. Originale bleiben erhalten. Wiederholen erzeugt keine Duplikate.</p>
        <label>Foto-Server (HTTPS oder localhost)
          <input className="w-full p-2 text-black" aria-label="Foto-Server" placeholder="https://dein-server/fitness" value={legacyBase} onChange={e => setLegacyBase(e.target.value)} disabled={uploading} />
        </label>
        <button className="py-2 underline" disabled={uploading} onClick={importLegacy}>{importing ? 'Import läuft …' : 'Alte Fotos in die Cloud übernehmen'}</button>
      </details>

      {/* Galerie */}
      {allPhotos.length === 0 ? (
        <div className="p-6 text-center text-sm" style={{ color: 'var(--dim)' }}>Noch keine Fortschrittsfotos.</div>
      ) : (
        <div className="grid grid-cols-3 gap-px p-px" style={{ background: 'var(--line)' }}>
          {allPhotos.map((photo, i) => (
            <div
              key={photo.id || photo.filename || i}
              className="aspect-square relative"
              style={{ background: '#000' }}
            >
              {photo.source === 'server' ? <PrivatePhoto photo={photo} client={client} /> : (
                <img src={photo.dataUrl} alt={new Date(photo.date).toLocaleDateString('de-AT')} className="w-full h-full object-cover" />
              )}
              {/* Pending-Indikator */}
              {photo.source === 'pending' && (
                <div
                  className="absolute top-1 right-1 text-[9px] font-black px-1 rounded"
                  style={{ background: '#facc15', color: '#000' }}
                >
                  ↑
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
