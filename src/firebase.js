import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager, getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";
import { getAI, VertexAIBackend } from "firebase/ai";
import { config } from "../firebase.config.js";

const alreadyInit = getApps().length > 0;
const app = alreadyInit ? getApp() : initializeApp(config);

// Browser-seitiger Vertex-AI-Zugang — unabhängig vom lokalen Python-Backend
// (das nur läuft, wenn der Coach-Laptop an ist). Analog zu fuel-dev's
// firebase.js (dort noch die deprecated getVertexAI-API), gleiches Projekt
// (fitness-aos), Vertex AI dort bereits aktiv. getAI()/VertexAIBackend ist
// der aktuelle, nicht-deprecated Ersatz für getVertexAI().
export const vertexAI = getAI(app, { backend: new VertexAIBackend() });

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

let messagingPromise = null;

export async function getMessagingIfSupported() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;
  if (!("serviceWorker" in navigator) || typeof Notification === "undefined") return null;

  if (!messagingPromise) {
    messagingPromise = isMessagingSupported()
      .then((supported) => (supported ? getMessaging(app) : null))
      .catch(() => null);
  }

  return messagingPromise;
}
