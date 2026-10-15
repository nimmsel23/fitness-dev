import { useEffect, useRef, useState } from 'react';
import BackHeader from './BackHeader.jsx';

// Fotos werden direkt hochgeladen; nur fehlgeschlagene Uploads landen in der
// nutzergebundenen Browser-Queue. Alte, unzugeordnete Queues bleiben unberührt.
const SIXPACK_PENDING_KEY = 'fitness-sixpack-selfies-pending-v2';
const LOCAL_SERVER = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const photoUrl = (route) => `${LOCAL_SERVER ? `${LOCAL_SERVER}/` : ''}${route.replace(/^\//, '')}`;

function loadPendingQueue(uid) {
  try {
    const queue = JSON.parse(window.localStorage.getItem(`${SIXPACK_PENDING_KEY}:${uid}`) || '[]');
    return Array.isArray(queue) ? queue : [];
  } catch { return []; }
}
function savePendingQueue(uid, queue) {
  window.localStorage.setItem(`${SIXPACK_PENDING_KEY}:${uid}`, JSON.stringify(queue));
}

/** Konvertiert eine DataURL in ein File-Objekt für FormData */
function dataUrlToFile(dataUrl, filename) {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

export default function SelfiesScreen({ onBack, uid }) {
  const [serverPhotos, setServerPhotos] = useState([]);
  const [pending, setPending] = useState(() => loadPendingQueue(uid));
  const [serverOk, setServerOk] = useState(null); // null = unbekannt, true/false
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [selectionResults, setSelectionResults] = useState([]);

  const busy = useRef(false);
  const hasUid = typeof uid === 'string' && /^[\w-]{1,128}$/.test(uid);

  /** Holt die Foto-Liste vom lokalen Server */
  async function fetchServerPhotos() {
    try {
      const res = await fetch(photoUrl(`sixpack/photos?uid=${encodeURIComponent(uid)}`), {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setServerOk(true);
      if (!data.ok || !Array.isArray(data.photos)) throw new Error('Invalid photo response');
      setServerPhotos(data.photos);
      return true;
    } catch {
      setServerOk(false);
      return false;
    }
  }

  async function upload(file, id, date) {
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('id', id);
    fd.append('date', date);
    const res = await fetch(photoUrl('sixpack/photos'), {
      method: 'POST', headers: { 'x-fitness-uid': uid }, body: fd,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok || !(await res.json()).ok) throw new Error('Upload failed');
  }

  async function uploadPending() {
    if (!hasUid || busy.current) return;
    busy.current = true;
    setUploading(true);
    try {
      for (const item of loadPendingQueue(uid)) {
        await upload(dataUrlToFile(item.dataUrl, item.name), item.id, item.date);
        // Read fresh storage so photos queued elsewhere are retained.
        const remaining = loadPendingQueue(uid).filter(p => p.id !== item.id);
        savePendingQueue(uid, remaining);
        setPending(remaining);
      }
      await fetchServerPhotos();
    } catch {
      setServerOk(false);
      setStatusMsg('Synchronisierung ausstehend – bitte erneut versuchen.');
    } finally {
      busy.current = false;
      setUploading(false);
    }
  }

  useEffect(() => {
    if (!hasUid) return;
    let cancelled = false;
    async function init() {
      const ok = await fetchServerPhotos();
      if (!cancelled && ok) await uploadPending();
    }
    init();
    window.addEventListener('online', init);
    return () => { cancelled = true; window.removeEventListener('online', init); };
  }, []);

  async function onFile(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!hasUid || !files.length || busy.current) return;
    busy.current = true;
    setUploading(true);
    setStatusMsg('');
    setSelectionResults([]);
    let saved = 0;
    try {
      for (const [index, file] of files.entries()) {
        setStatusMsg(`Foto ${index + 1} von ${files.length} wird verarbeitet …`);
        let message;
        if (!file.size || file.size > 20 * 1024 * 1024 || !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
          message = 'Nicht gespeichert: JPG, PNG, WebP oder HEIC/HEIF bis 20 MB erforderlich.';
        } else {
          const item = { id: crypto.randomUUID(), date: new Date().toISOString(), name: file.name };
          try {
            await upload(file, item.id, item.date);
            saved++;
            message = 'Gespeichert';
          } catch {
            setServerOk(false);
            try {
              item.dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
              const queue = [...loadPendingQueue(uid), item];
              savePendingQueue(uid, queue);
              setPending(queue);
              message = 'Offline gespeichert – Synchronisierung ausstehend';
            } catch {
              message = 'Nicht gespeichert: Browserspeicher voll oder nicht verfügbar. Bitte Original behalten.';
            }
          }
        }
        setSelectionResults(results => [...results, { name: file.name, message }]);
      }
      if (saved) await fetchServerPhotos();
      setStatusMsg(`${files.length} Foto${files.length === 1 ? '' : 's'} verarbeitet.`);
    } finally {
      busy.current = false;
      setUploading(false);
    }
  }

  if (!hasUid) return <div><BackHeader label="Selfies" onBack={onBack} /><p>Bitte zuerst anmelden, um deine Fotos zu öffnen.</p></div>;

  // Alle sichtbaren Fotos: Server-Fotos zuerst, dann ausstehende LocalStorage-Fotos
  const allPhotos = [
    ...serverPhotos.map(p => ({ ...p, source: 'server' })),
    ...pending.map(p => ({ date: p.date, dataUrl: p.dataUrl, source: 'pending' })),
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
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} disabled={uploading} />
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
            ? `🟢 Server online — ${serverPhotos.length} Foto${serverPhotos.length !== 1 ? 's' : ''} gespeichert`
            : `🟡 Server offline — ${pending.length} Foto${pending.length !== 1 ? 's' : ''} ausstehend`
          )}
        </div>
      )}

      {pending.length > 0 && (
        <button className="w-full py-2 text-sm" onClick={() => { setStatusMsg(''); uploadPending(); }} disabled={uploading}>
          Jetzt synchronisieren ({pending.length})
        </button>
      )}

      {/* Galerie */}
      {allPhotos.length === 0 ? (
        <div className="p-6 text-center text-sm" style={{ color: 'var(--dim)' }}>Noch keine Fortschrittsfotos.</div>
      ) : (
        <div className="grid grid-cols-3 gap-px p-px" style={{ background: 'var(--line)' }}>
          {allPhotos.map((photo, i) => (
            <div
              key={i}
              className="aspect-square relative"
              style={{ background: '#000' }}
            >
              <img
                src={photo.source === 'server' ? photoUrl(photo.url) : photo.dataUrl}
                alt={new Date(photo.date).toLocaleDateString('de-AT')}
                className="w-full h-full object-cover"
              />
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


