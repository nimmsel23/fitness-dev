import { registerSixpackPushToken } from '@db';
import { getMessagingIfSupported } from '@cloud/firebase.js';
import { getToken } from 'firebase/messaging';
import { VAPID_KEY } from '@firebase-config';

// Gleicher Service Worker/Scope wie das Fitness-Push-Panel (usePushNotifications.js):
// derselbe Browser-Token, der SW kennt data.app === "sixpack" (public/fitness-messaging-sw.js).
const PUSH_SW_URL = '/fitness-messaging-sw.js';
const PUSH_SW_SCOPE = '/fitness-push/';

// Host-Callback für SixPackPromiseCard.enablePush: Gerät für die 6Pack-Erinnerung registrieren.
export async function enableSixpackPush() {
  const messaging = await getMessagingIfSupported();
  if (!messaging) throw new Error('Push wird auf diesem Gerät/Browser nicht unterstützt.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Benachrichtigungen sind blockiert.');
  const registration = await navigator.serviceWorker.register(PUSH_SW_URL, { scope: PUSH_SW_SCOPE });
  const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
  if (!token) throw new Error('Kein Push-Token erhalten.');
  await registerSixpackPushToken(token);
  return token;
}
