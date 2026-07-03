import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, deleteDoc, updateDoc,
  query, where, orderBy, limit, serverTimestamp, writeBatch, collectionGroup
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut as fbSignOut, updateProfile,
} from "firebase/auth";

import { db, auth, googleProvider } from "../../../firebase.js";
import { getWeekDates, downloadText, num, todayISO, localToday } from "../shared/utils.js";
import { getAllExercises } from "./kb.js";
import { getSession, getSessionHistory } from "./sessions.js";
import { updateAnalyticsDoc } from "./analysis.js";

export function isLocalMode() { return false; }

// ── api compat shim — Views that bypass @db and call api directly will
//    hit this no-op in firebase builds. Console warning helps track them.
const noopApi = (verb) => async () => {
  console.warn(`[db.firestore] api.${verb}() called — view bypasses @db contract`);
  return null;
};
export const api = { get: noopApi("get"), post: noopApi("post"), delete: noopApi("delete") };


export { db, auth, googleProvider };


let currentUid = null;

let _lastProfileKey = null;

export function watchAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    currentUid = user ? user.uid : null;
    if (user) {
      const profileKey = `${user.uid}:${user.email}:${user.displayName}`;
      if (profileKey !== _lastProfileKey) {
        _lastProfileKey = profileKey;
        try {
          await setDoc(doc(db, "fitness", user.uid, "profile", "metadata"), {
            email: user.email || "",
            displayName: user.displayName || "",
            updated_at: serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.error("Profile metadata sync error:", e);
        }
      }
    }
    callback?.(user);
  });
}

export async function signIn() {
  await signInWithPopup(auth, googleProvider);
}

export async function signInEmail(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(cred.user, { displayName });
}

export async function signOut() { await fbSignOut(auth); }

export function getUid() {
  if (!currentUid) throw new Error("Nicht eingeloggt");
  return currentUid;
}

const BRIDGE_NOTIFY = "https://ideapad.tail7a15d6.ts.net/api/fitness/notify";
export function pingBridge() {
  fetch(BRIDGE_NOTIFY, { method: "POST" }).catch(() => {});
}

