// VitalOS Shell Service Worker

const CACHE = 'vitalos-v1'

const STATIC = [
  '/',
  '/index.html',
  '/manifest.json',
]

self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {}))
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Remotes: nie cachen (remoteEntry.js, __federation_*)
  if (url.pathname.includes('remoteEntry') || url.pathname.includes('__federation')) return

  // Navigation → Shell ausliefern (SPA-Fallback)
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  // Hashed Assets (JS/CSS mit Hash im Namen) → cache-first
  if (/\.[0-9a-f]{8}\.(js|css)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(request, res.clone()))
        return res
      }))
    )
    return
  }
})

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
  if (e.data?.type === 'VERSION') e.source.postMessage({ type: 'VERSION', version: CACHE })
})
