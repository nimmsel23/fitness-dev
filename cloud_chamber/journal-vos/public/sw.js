// journal-dev Service Worker
// stale-while-revalidate für /journal + /habitsync, Background Sync für offline POSTs

const CACHE = 'journal-v1'
const DB_NAME = 'aos-offline-journal'
const SYNC_TAG = 'journal-flush-queue'

const STATIC = ['/', '/index.html', '/offline-queue.js', '/manifest.json']

const SWR_PREFIXES = ['/journal', '/habitsync', '/health']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {}))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const req = e.request
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (req.method !== 'GET') return

  const path = url.pathname

  // Navigate → network-first + app-shell fallback
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(r => {
          if (r.ok) caches.open(CACHE).then(c => c.put('/index.html', r.clone()))
          return r
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // API-Pfade → stale-while-revalidate
  if (SWR_PREFIXES.some(p => path.startsWith(p))) {
    e.respondWith((async () => {
      const cached = await caches.match(req)
      const fetchPromise = fetch(req).then(r => {
        if (r.ok) caches.open(CACHE).then(c => c.put(req, r.clone()))
        return r
      }).catch(() => cached || new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
      return cached || fetchPromise
    })())
    return
  }

  // Hashed Vite-Assets → cache-first
  e.respondWith((async () => {
    const cached = await caches.match(req)
    if (cached) return cached
    try {
      const fresh = await fetch(req)
      if (fresh.ok) caches.open(CACHE).then(c => c.put(req, fresh.clone()))
      return fresh
    } catch {
      return caches.match('/index.html')
    }
  })())
})

self.addEventListener('message', e => {
  if (!e.data) return
  if (e.data.type === 'SKIP_WAITING') self.skipWaiting()
  if (e.data.type === 'GET_VERSION' && e.source)
    e.source.postMessage({ type: 'VERSION', version: CACHE })
})

self.addEventListener('sync', e => {
  if (e.tag === SYNC_TAG) e.waitUntil(flushFromSW())
})

async function flushFromSW() {
  const db = await openIDB().catch(() => null)
  if (!db) return
  const items = await idbGetAll(db, 'queue')
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: item.headers || { 'Content-Type': 'application/json' },
        body: item.body,
      })
      if (!res.ok && res.status >= 500) break
      await idbDelete(db, 'queue', item.id)
    } catch { break }
  }
}

function openIDB() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, 1)
    r.onupgradeneeded = e => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('queue'))
        db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true })
      if (!db.objectStoreNames.contains('cache'))
        db.createObjectStore('cache', { keyPath: 'url' })
    }
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
}

function idbGetAll(db, store) {
  return new Promise(resolve => {
    try {
      const r = db.transaction(store, 'readonly').objectStore(store).getAll()
      r.onsuccess = () => resolve(r.result || [])
      r.onerror = () => resolve([])
    } catch { resolve([]) }
  })
}

function idbDelete(db, store, id) {
  return new Promise(resolve => {
    try {
      const r = db.transaction(store, 'readwrite').objectStore(store).delete(id)
      r.onsuccess = () => resolve()
      r.onerror = () => resolve()
    } catch { resolve() }
  })
}
