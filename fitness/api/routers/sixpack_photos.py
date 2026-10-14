"""Authenticated progress photos for the actual FastAPI runtime (:6100/:9150)."""
import os
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse

router = APIRouter()
MAX_SIZE = 20 * 1024 * 1024
TYPES = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
         '.webp': 'image/webp', '.heic': 'image/heic', '.heif': 'image/heif'}
_lock = threading.Lock()


def verify_photo_token(token):
    with _lock:
        try:
            app = firebase_admin.get_app('sixpack-photos')
        except ValueError:
            file = Path(os.getenv('GOOGLE_APPLICATION_CREDENTIALS', str(Path.home() / '.env/firebase-fitness.json')))
            credential = credentials.Certificate(str(file)) if file.exists() else credentials.ApplicationDefault()
            app = firebase_admin.initialize_app(credential, {'projectId': os.getenv('FIREBASE_FITNESS_PROJECT', 'fitness-aos')}, name='sixpack-photos')
    return auth.verify_id_token(token, app=app, check_revoked=True)


def dev_uid_auth_enabled():
    """Lokaler Dev-Bypass: ohne Firebase-Token (Local-Modus, uid "local") darf der
    Client sich per x-fitness-uid ausweisen. Bewusst nur per Env-Flag aktivierbar
    (Default AUS) — im Prod-Prozess hinter dem Funnel darf das Flag nicht gesetzt sein."""
    return os.getenv('FITNESS_SIXPACK_DEV_UID_AUTH', '').strip() == '1'


def dev_uid(request: Request):
    """uid aus x-fitness-uid, nur im Dev-Bypass und nur ohne Authorization-Header.
    Zusätzliche Sperre: Requests, die über einen Proxy kamen (x-forwarded-*,
    Funnel/Serve), werden nie per Bypass akzeptiert — auch nicht bei gesetztem Flag."""
    if not dev_uid_auth_enabled() or request.headers.get('authorization'):
        return None
    if any(name.startswith('x-forwarded-') or name == 'forwarded' for name in request.headers.keys()):
        return None
    uid = request.headers.get('x-fitness-uid', '')
    if not re.fullmatch(r'[\w-]{1,128}', uid, re.ASCII):
        return None
    supplied = request.query_params.get('uid')
    if supplied and supplied != uid:
        raise HTTPException(403, 'forbidden')
    return uid


def current_user(request: Request):
    bypass = dev_uid(request)
    if bypass:
        return bypass
    match = re.fullmatch(r'Bearer ([^\s]+)', request.headers.get('authorization', ''), re.I)
    if not match:
        raise HTTPException(401, 'authentication_required', headers={'Cache-Control': 'no-store'})
    try:
        user = verify_photo_token(match[1])
    except (auth.InvalidIdTokenError, auth.RevokedIdTokenError, auth.UserDisabledError):
        raise HTTPException(401, 'invalid_token', headers={'Cache-Control': 'no-store'}) from None
    except Exception:
        raise HTTPException(503, 'authentication_unavailable', headers={'Cache-Control': 'no-store'}) from None
    uid = user.get('uid')
    if not isinstance(uid, str) or not re.fullmatch(r'[\w-]{1,128}', uid, re.ASCII):
        raise HTTPException(401, 'invalid_token')
    supplied = [request.query_params.get('uid'), request.headers.get('x-fitness-uid')]
    if any(value and value != uid for value in supplied):
        raise HTTPException(403, 'forbidden')
    return uid


def user_dir(uid):
    root = Path(os.getenv('FITNESS_SIXPACK_PHOTOS_DIR', str(Path.home() / '.aos/fitness/users')))
    return root / uid / 'sixpack-photos'


def json_reply(data):
    return JSONResponse(data, headers={'Cache-Control': 'private, no-store'})


@router.post('/sixpack/photos')
async def upload_photo(request: Request, uid: str = Depends(current_user)):
    # Raw binary avoids buffering an unbounded multipart body before validation.
    ext = Path(request.query_params.get('filename', '')).suffix.lower()
    if ext not in TYPES or request.headers.get('content-type', '').split(';')[0] != TYPES[ext]:
        raise HTTPException(415, 'unsupported_image_type')
    photo_id = request.query_params.get('id', '')
    if not re.fullmatch(r'[a-f0-9-]{36}', photo_id):
        raise HTTPException(400, 'invalid_photo_id')
    try:
        date = datetime.fromisoformat(request.query_params.get('date', '').replace('Z', '+00:00'))
        if date.tzinfo is None:
            raise ValueError()
        stamp = date.astimezone(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z').replace(':', '-').replace('.', '-')
    except ValueError:
        raise HTTPException(400, 'invalid_photo_date') from None
    directory = user_dir(uid)
    directory.mkdir(parents=True, exist_ok=True)
    filename = f'{stamp}_{photo_id}{ext}'
    destination = directory / filename
    temporary = directory / f'.{uuid.uuid4()}.tmp'
    size = 0
    try:
        with temporary.open('xb') as stream:
            async for chunk in request.stream():
                size += len(chunk)
                if size > MAX_SIZE:
                    raise HTTPException(413, 'photo_too_large')
                stream.write(chunk)
        if not size:
            raise HTTPException(400, 'empty_photo')
        temporary.replace(destination)
    finally:
        temporary.unlink(missing_ok=True)
    return json_reply({'ok': True, 'uid': uid, 'filename': filename})


@router.get('/sixpack/photos')
def list_photos(uid: str = Depends(current_user)):
    directory = user_dir(uid)
    photos = []
    if directory.exists():
        for file in directory.iterdir():
            if file.is_symlink() or not file.is_file() or file.suffix.lower() not in TYPES:
                continue
            stat = file.stat()
            raw = file.name.split('_')[0]
            date = re.sub(r'T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$', r'T\1:\2:\3.\4Z', raw)
            try:
                datetime.fromisoformat(date.replace('Z', '+00:00'))
            except ValueError:
                date = datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat()
            photos.append({'filename': file.name, 'date': date, 'size': stat.st_size})
    photos.sort(key=lambda item: item['date'], reverse=True)
    return json_reply({'ok': True, 'uid': uid, 'photos': photos})


@router.get('/sixpack-photos/{uid}/{filename}')
def get_photo(uid: str, filename: str, authenticated_uid: str = Depends(current_user)):
    if uid != authenticated_uid:
        raise HTTPException(403, 'forbidden')
    if not re.fullmatch(r'[\w.-]+', filename, re.ASCII) or filename.startswith('.') or Path(filename).suffix.lower() not in TYPES:
        raise HTTPException(400, 'invalid_filename')
    file = user_dir(uid) / filename
    if file.is_symlink() or not file.is_file():
        raise HTTPException(404, 'photo_not_found')
    return FileResponse(file, media_type=TYPES[file.suffix.lower()], headers={'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff'})
