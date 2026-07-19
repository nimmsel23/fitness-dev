import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager, getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { config } from "../firebase.config.js";

const alreadyInit = getApps().length > 0;
const app = alreadyInit ? getApp() : initializeApp(config);

export const db = alreadyInit
  ? getFirestore(app)
  : initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() }),
      // Ohne dieses Flag wirft setDoc() bei jedem undefined-Feldwert (z.B. eine
      // Übung ohne aufgelöste catalog-id) — Auto-Save fängt das im silent-Modus
      // ab und zeigt keinen Fehler, wodurch ganze Session-Saves lautlos verpuffen.
      ignoreUndefinedProperties: true,
    });

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

export const googleProvider = new GoogleAuthProvider();
