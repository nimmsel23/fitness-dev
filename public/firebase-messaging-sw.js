importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js')

// Firebase-Konfiguration (muss mit src/cloud/firebase.js übereinstimmen)
const firebaseConfig = {
  apiKey: 'AIzaSyDDVhVKKBsKQp-SJzT-8Ih4RfkR4VrP9bg',
  authDomain: 'fitness-aos.firebaseapp.com',
  projectId: 'fitness-aos',
  storageBucket: 'fitness-aos.appspot.com',
  messagingSenderId: '1075389623656',
  appId: '1:1075389623656:web:3aa903d8eca14d5c8f3cb2'
}

firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  const notificationTitle = payload.data?.title || 'Fitness Centre'
  const notificationOptions = {
    body: payload.data?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.tag || 'fitness-notification',
    data: {
      link: payload.data?.link || '/'
    }
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click — öffnet die App mit dem link aus der Nachricht
self.addEventListener('notificationclick', event => {
  event.notification.close()

  const link = event.notification.data?.link || '/'
  const urlToOpen = new URL(link, self.location.origin).href

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Prüfe ob bereits ein Window offen ist
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // Wenn nein, öffne ein neues Window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
