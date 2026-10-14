import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient
from firebase_admin import auth
from fitness.api.routers import sixpack_photos as photos


class PhotoTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        env = patch.dict(os.environ, {'FITNESS_SIXPACK_PHOTOS_DIR': self.temp.name})
        env.start(); self.addCleanup(env.stop)
        def verify(token):
            if token not in ['alice-token', 'bob-token']:
                raise auth.InvalidIdTokenError('bad token')
            return {'uid': token.split('-')[0]}
        verifier = patch.object(photos, 'verify_photo_token', side_effect=verify)
        verifier.start(); self.addCleanup(verifier.stop)
        app = FastAPI()
        app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])
        app.include_router(photos.router)
        self.client = TestClient(app)
        self.headers = {'Authorization': 'Bearer alice-token', 'Content-Type': 'image/png'}
        self.params = {'filename': 'photo.png', 'id': '12345678-1234-1234-1234-123456789abc', 'date': '2026-10-13T12:00:00.000Z'}

    def upload(self):
        return self.client.post('/sixpack/photos', params=self.params, headers=self.headers, content=b'image bytes')

    def test_auth_and_isolation(self):
        self.assertEqual(self.client.get('/sixpack/photos').status_code, 401)
        self.assertEqual(self.client.post('/sixpack/photos', content=b'image').status_code, 401)
        self.assertEqual(self.client.get('/sixpack/photos', headers={'Authorization': 'Bearer forged'}).status_code, 401)
        self.assertEqual(self.client.get('/sixpack/photos?uid=bob', headers=self.headers).status_code, 403)
        self.assertEqual(self.client.get('/sixpack/photos', headers={**self.headers, 'x-fitness-uid': 'bob'}).status_code, 403)
        saved = self.upload()
        self.assertEqual(saved.status_code, 200, saved.text)
        name = saved.json()['filename']
        url = f'/sixpack-photos/alice/{name}'
        self.assertEqual(self.client.get(url).status_code, 401)
        self.assertEqual(self.client.get(url, headers={'Authorization': 'Bearer bob-token'}).status_code, 403)
        image = self.client.get(url, headers=self.headers)
        self.assertEqual(image.content, b'image bytes')
        self.assertIn('no-store', image.headers['cache-control'])
        self.assertEqual(self.client.get('/sixpack/photos', headers={'Authorization': 'Bearer bob-token'}).json()['photos'], [])
        self.upload()
        listed = self.client.get('/sixpack/photos', headers=self.headers).json()
        self.assertEqual(listed['uid'], 'alice')
        self.assertEqual(len(listed['photos']), 1)
        self.assertEqual(listed['photos'][0]['date'], self.params['date'])

    def test_validation_and_cleanup(self):
        with patch.object(photos, 'MAX_SIZE', 5):
            self.assertEqual(self.upload().status_code, 413)
        self.assertEqual(list(Path(self.temp.name).rglob('*.tmp')), [])
        self.assertEqual(list(Path(self.temp.name).rglob('*.png')), [])
        self.params['filename'] = 'photo.html'
        self.assertEqual(self.upload().status_code, 415)
        self.params['filename'] = 'photo.png'
        self.params['id'] = '../escape'
        self.assertEqual(self.upload().status_code, 400)

    def test_auth_unavailable_and_preflight(self):
        with patch.object(photos, 'verify_photo_token', side_effect=RuntimeError('credentials unavailable')):
            self.assertEqual(self.client.get('/sixpack/photos', headers=self.headers).status_code, 503)
        response = self.client.options('/sixpack/photos', headers={
            'Origin': 'https://vos-6pack.web.app', 'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'authorization,content-type',
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('authorization', response.headers['access-control-allow-headers'])


class DevUidBypassTests(unittest.TestCase):
    """Lokaler Dev-Bypass (x-fitness-uid ohne Token) — nur per Env-Flag, nie hinter Proxy."""

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.env = {'FITNESS_SIXPACK_PHOTOS_DIR': self.temp.name}
        verifier = patch.object(photos, 'verify_photo_token', side_effect=auth.InvalidIdTokenError('bad token'))
        verifier.start(); self.addCleanup(verifier.stop)
        app = FastAPI()
        app.include_router(photos.router)
        self.client = TestClient(app)
        self.params = {'filename': 'photo.png', 'id': '12345678-1234-1234-1234-123456789abc', 'date': '2026-10-13T12:00:00.000Z'}

    def request(self, method, url, flag='1', **kwargs):
        env = {**self.env, **({'FITNESS_SIXPACK_DEV_UID_AUTH': flag} if flag is not None else {})}
        with patch.dict(os.environ, env):
            return self.client.request(method, url, **kwargs)

    def upload(self, uid='local', **kwargs):
        headers = {'x-fitness-uid': uid, 'Content-Type': 'image/png', **kwargs.pop('headers', {})}
        return self.request('POST', '/sixpack/photos', params=self.params, headers=headers, content=b'image bytes', **kwargs)

    def test_off_by_default(self):
        for flag in (None, '', '0', 'true'):
            self.assertEqual(self.upload(flag=flag).status_code, 401, flag)
            self.assertEqual(self.request('GET', '/sixpack/photos', flag=flag, headers={'x-fitness-uid': 'local'}).status_code, 401, flag)

    def test_enabled_roundtrip_and_isolation(self):
        saved = self.upload()
        self.assertEqual(saved.status_code, 200, saved.text)
        name = saved.json()['filename']
        listed = self.request('GET', '/sixpack/photos', headers={'x-fitness-uid': 'local'}).json()
        self.assertEqual((listed['uid'], len(listed['photos'])), ('local', 1))
        image = self.request('GET', f'/sixpack-photos/local/{name}', headers={'x-fitness-uid': 'local'})
        self.assertEqual(image.content, b'image bytes')
        self.assertEqual(self.request('GET', '/sixpack/photos', headers={'x-fitness-uid': 'other'}).json()['photos'], [])
        self.assertEqual(self.request('GET', f'/sixpack-photos/local/{name}', headers={'x-fitness-uid': 'other'}).status_code, 403)
        self.assertEqual(self.request('GET', '/sixpack/photos?uid=other', headers={'x-fitness-uid': 'local'}).status_code, 403)

    def test_never_behind_proxy_or_with_bearer_or_bad_uid(self):
        for header in ('x-forwarded-for', 'x-forwarded-host', 'forwarded'):
            self.assertEqual(self.upload(headers={header: '100.64.0.1'}).status_code, 401, header)
        # Bearer-Token wird immer geprüft, x-fitness-uid zählt dann nicht
        self.assertEqual(self.request('GET', '/sixpack/photos', headers={'authorization': 'Bearer forged', 'x-fitness-uid': 'local'}).status_code, 401)
        for bad in ('../x', 'a/b', 'x' * 129, ''):
            self.assertEqual(self.request('GET', '/sixpack/photos', headers={'x-fitness-uid': bad}).status_code, 401, bad)
        self.assertEqual(list(Path(self.temp.name).rglob('*')), [])


if __name__ == '__main__':
    unittest.main()
