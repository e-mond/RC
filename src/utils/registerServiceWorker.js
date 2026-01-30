/**
 * Service Worker Registration Utility
 * Registers the service worker for PWA functionality
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Use relative path for service worker
      const swUrl = '/sw.js';

      if (isLocalhost) {
        // Running on localhost - check if service worker exists
        checkValidServiceWorker(swUrl);
      } else {
        // Not localhost - register service worker
        registerValidSW(swUrl);
      }
    });
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[Service Worker] Registered successfully:', registration);
      
      // Check for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New service worker available - prompt user to refresh
              console.log('[Service Worker] New content available; please refresh.');
              // You can show a toast notification here
            } else {
              // Content cached for offline use
              console.log('[Service Worker] Content cached for offline use.');
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[Service Worker] Registration failed:', error);
    });
}

function checkValidServiceWorker(swUrl) {
  // Check if service worker file exists
  fetch(swUrl)
    .then((response) => {
      // Ensure service worker exists and is valid
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found - unregister existing ones
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found - proceed with registration
        registerValidSW(swUrl);
      }
    })
    .catch(() => {
      console.log('[Service Worker] No internet connection found. App is running in offline mode.');
    });
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

