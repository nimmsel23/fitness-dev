import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || 'fitness-aos',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

let appInstance = null
let dbInstance  = null

export function getFirebaseApp() {
  if (appInstance) return appInstance
  if (!config.apiKey) return null
  if (getApps().length) { appInstance = getApps()[0]; return appInstance }
  appInstance = initializeApp(config)
  return appInstance
}

export function getDb() {
  if (dbInstance) return dbInstance
  const app = getFirebaseApp()
  if (!app) return null
  dbInstance = getFirestore(app)
  return dbInstance
}

export function isFirebaseConfigured() {
  return Boolean(config.apiKey)
}
