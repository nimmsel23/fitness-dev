import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { config } from './firebaseConfig.js';

function photoAuth() {
  const app = getApps().find(app => app.name === '[DEFAULT]') ? getApp() : initializeApp(config);
  if (app.options.projectId !== config.projectId) throw new Error('Die Anmeldung verwendet ein anderes Firebase-Projekt.');
  return getAuth(app);
}
export const watchPhotoUser = (callback, onError) => onAuthStateChanged(photoAuth(), callback, onError);
export const loginGoogle = () => signInWithPopup(photoAuth(), new GoogleAuthProvider());
export const loginEmail = (email, password) => signInWithEmailAndPassword(photoAuth(), email, password);
export const logoutPhotos = () => signOut(photoAuth());
