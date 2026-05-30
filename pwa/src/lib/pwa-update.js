// pwa/src/lib/pwa-update.js

/**
 * Register Service Worker and handle update detection.
 * Returns an object with the registration and update check function.
 */
export async function setupPWAUpdate() {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    const checkForUpdate = async () => {
      if (!registration) return false;
      try {
        await registration.update();
        if (registration.waiting) {
           return true; // Update found and waiting
        }
        return false;
      } catch (err) {
        console.error("SW update check failed:", err);
        return false;
      }
    };

    const applyUpdate = () => {
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    };

    return { registration, checkForUpdate, applyUpdate };
  } catch (err) {
    console.error("setupPWAUpdate failed:", err);
    return null;
  }
}

// Keeping original for backward compatibility during refactor if needed
export function registerServiceWorkerUpdate(onUpdateAvailable) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.onupdatefound = () => {
        const installingWorker = reg.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                onUpdateAvailable();
              }
            }
          };
        }
      };
    });
  }
}
