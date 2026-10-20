// Used only for an explicit one-way import; cloud sync never falls back here.
export function photoApiBase({ configured = '' } = {}) {
  return configured.replace(/\/+$/, '');
}
function validateBase(base) {
  if (!base) return '';
  const url = new URL(base);
  if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new Error('Bitte HTTPS oder einen lokalen Foto-Server verwenden.');
  }
  return url.href.replace(/\/+$/, '');
}

function failure(message, { status, retryable = false } = {}) {
  return Object.assign(new Error(message), { status, retryable });
}
export function createPhotoClient({ uid, getIdToken, base = '', fetchImpl = fetch }) {
  base = validateBase(base);
  async function request(route, options = {}) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let token;
      try { token = await getIdToken(attempt > 0); }
      catch { throw failure('Anmeldung abgelaufen. Bitte erneut anmelden.', { status: 401 }); }
      if (!token) throw failure('Bitte zuerst anmelden.', { status: 401 });
      let response;
      try {
        response = await fetchImpl(`${base ? `${base}/` : ''}${route}`, {
          ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` },
          cache: 'no-store', redirect: 'error', signal: options.signal || AbortSignal.timeout(15000),
        });
      } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw failure('Foto-Server nicht erreichbar. Bitte Verbindung prüfen.', { retryable: true });
      }
      if (response.status === 401 && attempt === 0) continue;
      if (response.status === 401) throw failure('Anmeldung abgelaufen. Bitte erneut anmelden.', { status: 401 });
      if (response.status === 403) throw failure('Kein Zugriff auf diese Fotos.', { status: 403 });
      if (!response.ok) throw failure(`Foto-Server meldet Fehler ${response.status}.`, { status: response.status, retryable: response.status >= 500 });
      return response;
    }
  }
  async function json(route, options) {
    const response = await request(route, options);
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw failure('Foto-API fehlt auf diesem Server (HTML statt JSON). Bitte Server aktualisieren.', { retryable: true });
    }
    const data = await response.json();
    if (!data.ok || data.uid !== uid) throw failure('Ungültige Antwort des Foto-Servers.');
    return data;
  }
  return {
    list: () => json('api/sixpack/photos'),
    async image(filename, signal) {
      const response = await request(`api/sixpack-photos/${encodeURIComponent(uid)}/${encodeURIComponent(filename)}`, { signal });
      if (!response.headers.get('content-type')?.startsWith('image/')) throw failure('Foto-Server liefert kein Bild.');
      return response.blob();
    },
  };
}

// Deterministic IDs make importing an interrupted archive safe to repeat.
export async function transferLegacyPhotos({ legacy, cloud, prepare, isActive = () => true, onProgress = () => {} }) {
  const { photos } = await legacy.list();
  const existing = new Set((await cloud.list()).photos.map(photo => photo.id));
  let done = 0;
  for (const photo of photos) {
    if (!isActive()) throw new Error('Import beendet: Konto oder Ansicht gewechselt.');
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${cloud.uid}:${photo.filename}`));
    const id = `legacy-${Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')}`;
    if (!existing.has(id)) {
      const blob = await legacy.image(photo.filename);
      if (!isActive()) throw new Error('Import beendet: Konto oder Ansicht gewechselt.');
      await cloud.uploadData(id, photo.date, await prepare(blob));
      existing.add(id);
    }
    onProgress(++done, photos.length);
  }
  return done;
}
