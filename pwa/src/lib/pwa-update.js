// pwa/src/lib/pwa-update.js
export function registerServiceWorkerUpdate(onUpdateAvailable) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.onupdatefound = () => {
        const installingWorker = reg.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                onUpdateAvailable();
              }
            }
          };
        }
      };
    });
  }
}
