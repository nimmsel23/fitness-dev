// fitness-dev Service Worker
// v1: static cache + stale-while-revalidate reads + Background Sync für offline POSTs

const CACHE = 'fitness-v0' // Platzhalter — echte Version wird post-build in dist-firebase gestempelt (scripts/stamp-sw.mjs), nie hier committed.

const STATIC = [
  '/',
  '/index.html',
  '/offline-queue.js',
  '/manifest.json',
]

// GET-Pfade die stale-while-revalidate bekommen
const SWR_PREFIXES = [
  '/session',
  '/coverage',
  '/fitness/weekly',
  '/fitness/body',
  '/fitness/plan',
  '/fitness/inbox',
  '/fitness/clients',
  '/fitness/config',
  '/fitness/muscles',
  '/fitness/search',
  '/fitness/exercises',
  '/exercises/search',
  '/exercises/by-group',
  '/exercise',
  '/journal',
  '/habitsync',
  '/plan/today',
  '/blocks',
  '/theme',
  '/health',
]

const WORKOUT_NOTIFICATION_TAG = 'fitness-workout-session'

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

  // API reads → stale-while-revalidate
  const isSWR = SWR_PREFIXES.some(p => path === p || path.startsWith(p + '?') || path.startsWith(p + '/'))
  if (isSWR) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE)
      const cached = await cache.match(req)
      const netPromise = fetch(req)
        .then(fresh => {
          if (fresh?.ok) {
            const copy = fresh.clone();
            cache.put(req, copy);
          }
          return fresh
        })
        .catch(() => null)
      if (cached) { netPromise; return cached }
      const net = await netPromise
      if (net) return net
      return new Response(JSON.stringify({ ok: false, offline: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Source': 'sw-offline' },
      })
    })())
    return
  }

  // Navigations → network-first, app-shell fallback
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(r => {
          if (r.ok) {
            const copy = r.clone();
            caches.open(CACHE).then(c => c.put('/index.html', copy));
          }
          return r
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // Hashed Vite assets → cache-first, runtime fill
  e.respondWith((async () => {
    const cached = await caches.match(req)
    if (cached) return cached
    try {
      const fresh = await fetch(req)
      if (fresh.ok) {
        const copy = fresh.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return fresh
    } catch {
      return caches.match('/index.html')
    }
  })())

})

// Manueller Update-Trigger aus dem UI (Settings → App aktualisieren)
self.addEventListener('message', e => {
  if (!e.data) return
  if (e.data.type === 'SKIP_WAITING') self.skipWaiting()
  if (e.data.type === 'GET_VERSION' && e.source) {
    e.source.postMessage({ type: 'VERSION', version: CACHE })
  }
  if (e.data.type === 'SHOW_WORKOUT_TIMER_NOTIFICATION') {
    e.waitUntil(showWorkoutNotification(e.data))
  }
  if (e.data.type === 'CLEAR_WORKOUT_TIMER_NOTIFICATION') {
    e.waitUntil(clearWorkoutNotification(e.data.tag))
  }
})

self.addEventListener('notificationclick', e => {
  const target = e.notification?.data?.link || '/#session'
  e.notification.close()
  e.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of clients) {
      if (!('focus' in client)) continue
      try {
        await client.navigate(target)
      } catch {}
      return client.focus()
    }
    if (self.clients.openWindow) return self.clients.openWindow(target)
    return null
  })())
})

// Background Sync — flushed IDB-Queue wenn Connectivity zurückkommt
self.addEventListener('sync', e => {
  if (e.tag === 'fitness-flush-queue') e.waitUntil(flushFromSW())
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
    } catch {
      break // noch offline, nächster Sync-Event
    }
  }
}

function openIDB() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('aos-offline-fitness', 1)
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

async function showWorkoutNotification(data) {
  if (!self.registration?.showNotification) return
  await self.registration.showNotification(data.title || 'Workout läuft', {
    tag: data.tag || WORKOUT_NOTIFICATION_TAG,
    renotify: false,
    silent: true,
    requireInteraction: !!data.active,
    body: data.body || 'Die Workout-Stoppuhr läuft.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      link: data.date ? `/#session?date=${data.date}` : '/#session',
      date: data.date || null,
      active: !!data.active,
    },
  })
}

async function clearWorkoutNotification(tag = WORKOUT_NOTIFICATION_TAG) {
  const notifications = await self.registration.getNotifications({ tag })
  notifications.forEach(notification => notification.close())
}
