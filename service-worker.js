// service-worker.js

const CACHE_NAME = 'job-tracker-cache-14';

// Files to cache
const APP_SHELL = [
  '/job-tracker/',
  '/job-tracker/index.html',
  '/job-tracker/manifest.json',
  '/job-tracker/styles.css',   // add your CSS file(s) here
  '/job-tracker/app.js'        // add your JS file(s) here
];

// Install event: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event: offline-first strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Navigation handler — always serve index.html for SPA routes
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/job-tracker/index.html').then((cached) => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  // For other requests, try cache then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cloned);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Optional: fallback if needed
        });
    })
  );
});
