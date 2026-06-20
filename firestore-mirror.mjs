/**
 * Firestore Mirror — fire-and-forget dual-write für server.mjs
 *
 * Schreibt Session, Journal und Plan nach Firestore ohne den lokalen
 * Node-Server zu blockieren. Wenn Firebase nicht konfiguriert ist → still skip.
 *
 * Config: ~/.env/firebase-fitness.json (Service Account)
 * Oder: GOOGLE_APPLICATION_CREDENTIALS + FIREBASE_FITNESS_PROJECT env vars
 */

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CRED_PATH = join(homedir(), ".env", "firebase-fitness.json");
const PROJECT   = process.env.FIREBASE_FITNESS_PROJECT || "fitness-aos";

let _db = null;
let _unavailable = false;

async function getDb() {
  if (_db) return _db;
  if (_unavailable) return null;

  const credFile = process.env.GOOGLE_APPLICATION_CREDENTIALS || CRED_PATH;
  if (!existsSync(credFile)) {
    _unavailable = true;
    return null;
  }

  try {
    const require = createRequire(import.meta.url);
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(credFile),
        projectId: PROJECT,
      });
    }
    _db = admin.firestore();
    console.log(`[firestore-mirror] aktiv → ${PROJECT}`);
    return _db;
  } catch (e) {
    console.warn(`[firestore-mirror] nicht verfügbar: ${e.message}`);
    _unavailable = true;
    return null;
  }
}

function fire(fn) {
  fn().catch((e) => console.warn(`[firestore-mirror] write fehler: ${e.message}`));
}

export async function mirrorSession(date, session, uid = "default") {
  const db = await getDb();
  if (!db) return;
  const targetId = session.session_id ? `${date}__${session.session_id}` : date;
  fire(() =>
    db.collection("fitness").doc(uid).collection("sessions").doc(targetId).set({
      ...session,
      date,
      saved_at: new Date().toISOString(),
    })
  );
}

export async function mirrorJournal(date, entry, uid = "default") {
  const db = await getDb();
  if (!db) return;
  fire(() =>
    db.collection("fitness").doc(uid).collection("journal").add({
      ...entry,
      date,
      time: new Date().toISOString(),
    })
  );
}

export async function getFirestoreStatus() {
  const db = await getDb();
  return { ok: db !== null, project: db ? PROJECT : null };
}

export async function mirrorPlan(plan, uid = "default") {
  const db = await getDb();
  if (!db) return;
  fire(() =>
    db.collection("fitness").doc(uid).collection("plan").doc("active").set({
      ...plan,
      updated_at: new Date().toISOString(),
    })
  );
}
