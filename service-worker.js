// service-worker.js

const CACHE_NAME = 'job-tracker-v10'; // increment this manually if needed
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add any other static files your app needs
];

// Install event: cache app shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(FILES_TO_CACHE);
      })
  );
  self.skipWaiting(); // activate worker immediately
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // take control immediately
});

// Fetch event: serve cached content, fall back to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // only cache GET requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // Return cached file
          return response;
        }
        // Fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Optionally cache new files dynamically
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          });
      })
      .catch(() => {
        // Optional fallback if offline and file not cached
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
