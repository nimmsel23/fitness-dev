import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { config } from "../firebase.config.js";

const app = initializeApp(config);

// Firestore with IndexedDB-backed persistent cache.
// Reads served from cache while offline; writes queued locally and
// flushed when connectivity returns. Multi-tab safe.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const auth = getAuth(app);
// Keep user signed in across reloads — needed for PWA offline UX.
setPersistence(auth, browserLocalPersistence).catch(() => {});

export const googleProvider = new GoogleAuthProvider();
