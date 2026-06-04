import { 
  onAuthStateChanged,
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut
} from "firebase/auth";
import { db, auth, googleProvider } from "../../firebase.js";

let currentUid = null;

export { db, auth, googleProvider };

export function watchAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    currentUid = user ? user.uid : null;
    callback(user);
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
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
}

export async function signOut() {
  await fbSignOut(auth);
}

export function getUid() {
  if (!currentUid) throw new Error("Nicht eingeloggt");
  return currentUid;
}

const BRIDGE_NOTIFY = "https://ideapad.tail7a15d6.ts.net/api/fitness/notify";
export function pingBridge() {
  fetch(BRIDGE_NOTIFY, { method: "POST" }).catch(() => {});
}
