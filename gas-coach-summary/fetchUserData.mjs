// fetchUserData.mjs
// Retrieves user specific data from Firestore for the coaching summary.
// Requires Firebase config from the main project.

import { db } from "../src/firebase.js";
import { doc, getDoc } from "firebase/firestore";

export async function fetchUserData(uid) {
  if (!uid) throw new Error("UID missing");
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return {};
  return snap.data();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const uid = process.argv[2] ?? process.env.USER_UID;
  fetchUserData(uid)
    .then(d => console.log(JSON.stringify(d, null, 2)))
    .catch(e => { console.error(e); process.exit(1); });
}
