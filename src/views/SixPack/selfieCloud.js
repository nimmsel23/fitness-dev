import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const MAX_DATA_URL = 700000;
const failure = (message, status, retryable = false) => Object.assign(new Error(message), { status, retryable });

// Auth and project are inherited from the host. No second Firebase app or login.
export function createCloudPhotoClient({ uid, getIdToken, isCurrentUser, projectId, fetchImpl = fetch, endpoint = 'https://firestore.googleapis.com/v1' }) {
  if (!/^[\w-]{1,128}$/.test(uid) || uid === 'local') throw failure('Bitte zuerst anmelden.', 401);
  const collection = `${endpoint}/projects/${projectId}/databases/(default)/documents/sixpackSelfies/${encodeURIComponent(uid)}/photos`;
  async function request(suffix = '', options = {}) {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!isCurrentUser()) throw failure('Konto gewechselt. Bitte Fotos erneut öffnen.', 401);
      let token;
      try { token = await getIdToken(attempt > 0); }
      catch { throw failure('Anmeldung abgelaufen. Bitte erneut anmelden.', 401); }
      if (!token || !isCurrentUser()) throw failure('Bitte zuerst anmelden.', 401);
      let response;
      try {
        response = await fetchImpl(`${collection}${suffix}`, {
          ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          signal: options.signal || AbortSignal.timeout(20000), cache: 'no-store', redirect: 'error',
        });
      } catch (error) {
        if (options.signal?.aborted) throw error;
        throw failure('Cloud nicht erreichbar. Foto bleibt zur Synchronisierung vorgemerkt.', 0, true);
      }
      if (!isCurrentUser()) throw failure('Konto gewechselt. Bitte Fotos erneut öffnen.', 401);
      if (response.status === 401 && attempt === 0) continue;
      if (!response.ok) throw failure(
        response.status === 403 ? 'Kein Foto-Zugriff. Bitte Anmeldung und Foto-Regeln prüfen.' : `Foto-Sync: HTTP ${response.status}`,
        response.status, response.status >= 500 || response.status === 429,
      );
      return response.json();
    }
  }
  return {
    uid,
    getIdToken: force => isCurrentUser() ? getIdToken(force) : Promise.reject(failure('Konto gewechselt.', 401)),
    async list() {
      const photos = [];
      let pageToken = '';
      do {
        const page = await request(`?pageSize=30&mask.fieldPaths=date${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`);
        for (const item of page.documents || []) {
          photos.push({ id: item.name.split('/').pop(), filename: item.name.split('/').pop(), date: item.fields.date.stringValue });
        }
        pageToken = page.nextPageToken;
      } while (pageToken);
      return { ok: true, uid, photos: photos.sort((a, b) => b.date.localeCompare(a.date)) };
    },
    async uploadData(id, date, dataUrl) {
      if (!/^[\w-]{1,128}$/.test(id) || !Number.isFinite(Date.parse(date)) || !dataUrl.startsWith('data:image/jpeg;base64,') || dataUrl.length > MAX_DATA_URL) throw failure('Ungültiges oder zu großes Foto.', 400);
      const fields = { date: { stringValue: new Date(date).toISOString() }, dataUrl: { stringValue: dataUrl } };
      await request(`/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ fields }) });
    },
    async image(id, signal) {
      if (!/^[\w-]{1,128}$/.test(id)) throw failure('Ungültige Foto-ID.', 400);
      const data = await request(`/${encodeURIComponent(id)}`, { signal });
      const url = data.fields.dataUrl.stringValue;
      if (!url.startsWith('data:image/jpeg;base64,') || url.length > MAX_DATA_URL) throw failure('Ungültiges Foto.', 400);
      const bytes = Uint8Array.from(atob(url.split(',')[1]), char => char.charCodeAt(0));
      return new Blob([bytes], { type: 'image/jpeg' });
    },
  };
}

export function cloudPhotoClient(user) {
  const app = getApp();
  return createCloudPhotoClient({
    uid: user.uid, projectId: app.options.projectId,
    getIdToken: force => user.getIdToken(force),
    isCurrentUser: () => getAuth(app).currentUser?.uid === user.uid,
  });
}

// One bounded JPEG per document, below Firestore's 1 MiB limit. Originals stay intact.
export async function prepareSelfie(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.5, 0.3]) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.startsWith('data:image/jpeg;base64,') && dataUrl.length <= MAX_DATA_URL) return dataUrl;
    }
    throw new Error('Foto kann nicht ausreichend verkleinert werden.');
  } finally { URL.revokeObjectURL(url); }
}
