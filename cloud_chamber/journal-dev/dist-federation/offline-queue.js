"use strict";

// journal-dev Offline-Queue
// Gleiche Architektur wie fitness-dev/public/offline-queue.js
// IDB: aos-offline-journal | Sync-Tag: journal-flush-queue
// window.aosOfflineQueue.fetch — drop-in fetch

(() => {
  const DB_NAME = 'aos-offline-journal'
  const SYNC_TAG = 'journal-flush-queue'
  let dbPromise = null
  let online = navigator.onLine ?? true

  window.addEventListener('online',  () => { online = true;  flush() })
  window.addEventListener('offline', () => { online = false })

  function openDB() {
    if (dbPromise) return dbPromise
    dbPromise = new Promise((resolve, reject) => {
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
    return dbPromise
  }

  async function idbAdd(store, item) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      const r = tx.objectStore(store).add(item)
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => reject(r.error)
    })
  }

  async function idbPut(store, item) {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      const r = tx.objectStore(store).put(item)
      r.onsuccess = () => resolve()
      r.onerror = () => reject(r.error)
    })
  }

  async function idbGet(store, key) {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(store, 'readonly')
      const r = tx.objectStore(store).get(key)
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => resolve(null)
    })
  }

  async function idbGetAll(store) {
    const db = await openDB()
    return new Promise(resolve => {
      try {
        const r = db.transaction(store, 'readonly').objectStore(store).getAll()
        r.onsuccess = () => resolve(r.result || [])
        r.onerror = () => resolve([])
      } catch { resolve([]) }
    })
  }

  async function idbDelete(store, id) {
    const db = await openDB()
    return new Promise(resolve => {
      try {
        const r = db.transaction(store, 'readwrite').objectStore(store).delete(id)
        r.onsuccess = () => resolve()
        r.onerror = () => resolve()
      } catch { resolve() }
    })
  }

  async function cachedGet(url) {
    const entry = await idbGet('cache', url)
    return entry?.data ?? null
  }

  async function cacheSet(url, data) {
    await idbPut('cache', { url, data, ts: Date.now() })
  }

  async function flush() {
    const items = await idbGetAll('queue')
    for (const item of items) {
      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: item.headers || { 'Content-Type': 'application/json' },
          body: item.body,
        })
        if (!res.ok && res.status >= 500) break
        await idbDelete('queue', item.id)
      } catch { break }
    }
  }

  async function queuedFetch(url, init = {}) {
    const method = (init.method || 'GET').toUpperCase()

    if (method === 'GET') {
      if (!online) {
        const cached = await cachedGet(url)
        if (cached !== null) {
          return new Response(JSON.stringify(cached), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'X-Source': 'offline-cache' },
          })
        }
        return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json', 'X-Source': 'offline-empty' } })
      }
      const res = await fetch(url, init)
      if (res.ok) {
        try {
          const data = await res.clone().json()
          await cacheSet(url, data)
        } catch {}
      }
      return res
    }

    // POST / DELETE
    if (!online) {
      await idbAdd('queue', {
        method, url,
        body: init.body || null,
        headers: init.headers || { 'Content-Type': 'application/json' },
        ts: Date.now(),
      })
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(reg => reg.sync?.register(SYNC_TAG).catch(() => {}))
      }
      return new Response(JSON.stringify({ ok: true, queued: true, offline: true }), {
        status: 202,
        headers: { 'Content-Type': 'application/json', 'X-Source': 'offline-queue' },
      })
    }

    const res = await fetch(url, init)
    flush()
    return res
  }

  window.aosOfflineQueue = {
    fetch: queuedFetch,
    flush,
    size: async () => (await idbGetAll('queue')).length,
    isOnline: () => online,
  }
})()
