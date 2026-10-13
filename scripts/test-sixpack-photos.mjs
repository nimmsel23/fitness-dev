import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { sixpackPhotoRoutes } from '../routes/sixpack-photos.mjs';

const root = await mkdtemp(path.join(os.tmpdir(), 'fitness-photo-test-'));
const app = sixpackPhotoRoutes({ root });
const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aBtQAAAAASUVORK5CYII=', 'base64');
async function upload({ uid = 'test-user', name = 'photo.png', date = '2026-10-12T12:30:00.000Z', id = '12345678-1234-1234-1234-123456789abc' } = {}) {
  const form = new FormData();
  form.append('photo', new Blob([bytes], { type: 'image/png' }), name);
  form.append('id', id);
  form.append('date', date);
  return app.request('/sixpack/photos', { method: 'POST', headers: { 'x-fitness-uid': uid }, body: form });
}
try {
  assert.deepEqual((await (await app.request('/sixpack/photos?uid=test-user')).json()).photos, []);
  assert.equal((await app.request('/sixpack/photos')).status, 400);
  const response = await upload();
  assert.equal(response.status, 200);
  const saved = await response.json();
  const image = await app.request(saved.url);
  assert.equal(image.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await image.arrayBuffer()), bytes);
  assert.equal((await upload()).status, 200);
  let photos = (await (await app.request('/sixpack/photos?uid=test-user')).json()).photos;
  assert.equal(photos.length, 1, 'retries must not duplicate photos');
  assert.equal(photos[0].date, '2026-10-12T12:30:00.000Z');
  await upload({ date: '2026-10-13T12:30:00.000Z' });
  photos = (await (await app.request('/sixpack/photos?uid=test-user')).json()).photos;
  assert.equal(photos[0].date, '2026-10-13T12:30:00.000Z');
  assert.deepEqual((await (await app.request('/sixpack/photos?uid=other-user')).json()).photos, []);
  assert.equal((await upload({ uid: '../escape' })).status, 400);
  assert.equal((await upload({ name: 'photo.html' })).status, 415);
  assert.equal((await upload({ date: 'invalid' })).status, 400);
  assert.equal((await upload({ id: '../../escape' })).status, 400);
  assert.equal((await app.request('/sixpack/photos?uid=..')).status, 400);
  assert.equal((await app.request('/sixpack-photos/test-user/missing.png')).status, 404);
  console.log('SixPack photo API: upload, byte-exact download, retry deduplication, dates, user separation and validation passed.');
} finally {
  await rm(root, { recursive: true, force: true });
}
