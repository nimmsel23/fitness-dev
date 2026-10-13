import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';

const MAX_SIZE = 20 * 1024 * 1024;
const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.heic': 'image/heic', '.heif': 'image/heif' };
const validUid = value => /^[\w-]{1,128}$/.test(value);
const validId = value => /^[a-f0-9-]{36}$/.test(value);

// This is the local server's trusted-user API, not a public authenticated store.
export function sixpackPhotoRoutes({ defaultUid = 'local', root = process.env.FITNESS_SIXPACK_PHOTOS_DIR || path.join(os.homedir(), '.aos', 'fitness', 'users') } = {}) {
  const app = new Hono();
  const userDir = uid => path.join(root, uid, 'sixpack-photos');
  app.use('/sixpack/photos', bodyLimit({ maxSize: MAX_SIZE + 64 * 1024, onError: c => c.json({ ok: false, error: 'photo too large' }, 413) }));
  app.post('/sixpack/photos', async c => {
    const uid = c.req.header('x-fitness-uid') || defaultUid;
    if (!validUid(uid)) return c.json({ ok: false, error: 'invalid uid' }, 400);
    const form = await c.req.formData();
    const file = form.get('photo');
    if (!file || typeof file === 'string') return c.json({ ok: false, error: 'no photo field' }, 400);
    const ext = path.extname(file.name).toLowerCase();
    if (!TYPES[ext]) return c.json({ ok: false, error: 'unsupported image type' }, 415);
    if (!file.size || file.size > MAX_SIZE) return c.json({ ok: false, error: 'invalid photo size' }, 413);
    const id = form.get('id') || randomUUID();
    const date = form.get('date') || new Date().toISOString();
    if (!validId(id) || typeof date !== 'string' || !Number.isFinite(Date.parse(date))) return c.json({ ok: false, error: 'invalid photo metadata' }, 400);
    const timestamp = new Date(date).toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${id}${ext}`;
    await fs.mkdir(userDir(uid), { recursive: true });
    // Atomic publication, deterministic name: timed-out uploads can be retried.
    const dest = path.join(userDir(uid), filename);
    const temp = `${dest}.${randomUUID()}.tmp`;
    try {
      await fs.writeFile(temp, Buffer.from(await file.arrayBuffer()));
      await fs.rename(temp, dest);
    } finally {
      await fs.rm(temp, { force: true });
    }
    return c.json({ ok: true, uid, filename, url: `/sixpack-photos/${uid}/${filename}` });
  });
  app.get('/sixpack/photos', async c => {
    const uid = c.req.query('uid') || c.req.header('x-fitness-uid') || defaultUid;
    if (!validUid(uid)) return c.json({ ok: false, error: 'invalid uid' }, 400);
    let entries;
    try { entries = await fs.readdir(userDir(uid), { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') return c.json({ ok: true, uid, photos: [] }); throw error; }
    const photos = await Promise.all(entries.filter(entry => entry.isFile() && TYPES[path.extname(entry.name).toLowerCase()]).map(async entry => {
      const filename = entry.name;
      const stat = await fs.stat(path.join(userDir(uid), filename));
      const iso = filename.split('_')[0].replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, 'T$1:$2:$3.$4Z');
      return { filename, url: `/sixpack-photos/${uid}/${filename}`, date: Number.isFinite(Date.parse(iso)) ? iso : stat.mtime.toISOString(), size: stat.size };
    }));
    photos.sort((a, b) => b.date.localeCompare(a.date));
    return c.json({ ok: true, uid, photos });
  });
  app.get('/sixpack-photos/:uid/:filename', async c => {
    const { uid, filename } = c.req.param();
    const type = TYPES[path.extname(filename).toLowerCase()];
    if (!validUid(uid) || !type || !/^[\w.-]+$/.test(filename) || filename.startsWith('.')) return c.text('Forbidden', 403);
    try {
      const file = path.join(userDir(uid), filename);
      if (!(await fs.lstat(file)).isFile()) return c.text('Not Found', 404);
      return c.body(await fs.readFile(file), 200, { 'Content-Type': type, 'Cache-Control': 'private, max-age=86400', 'X-Content-Type-Options': 'nosniff' });
    } catch (error) { if (error.code === 'ENOENT') return c.text('Not Found', 404); throw error; }
  });
  return app;
}
