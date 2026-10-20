import { useEffect, useState } from 'react';
export default function PrivatePhoto({ photo, client }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl;
    setSrc(null);
    setError('');
    client.image(photo.filename, controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
    }).catch(err => { if (!controller.signal.aborted) setError(err.message); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [client, photo.filename]);
  if (!src) return <span className="text-xs p-2">{error || 'Foto lädt …'}</span>;
  return <img src={src} alt={new Date(photo.date).toLocaleDateString('de-AT')} className="w-full h-full object-cover" />;
}
