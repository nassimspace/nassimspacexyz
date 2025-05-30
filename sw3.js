const CACHE_NAME = 'nsspace-v3';
const OFFLINE_PAGE = '/offline.html';
const STATIC_ASSETS = [
  '/',
  '/?utm_source=pwa',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/web-app-manifest-512x512.png',
  '/web-app-manifest-144x144.png',
  '/normalize.css',
  '/main.css',
  '/script.js',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/offline.html',
  '/web-app-manifest-192x192.png'
];

// Install event: Cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Implement stale-while-revalidate and offline fallback
self.addEventListener('fetch', event => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Serve offline page if network fails
          return caches.match(OFFLINE_PAGE);
        })
    );
    return;
  }

  // Handle static assets with stale-while-revalidate
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response immediately if available
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update cache with fresh response
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // If cache exists, return it; otherwise, return offline page for HTML
            if (cachedResponse) {
              return cachedResponse;
            }
            if (event.request.destination === 'document') {
              return caches.match(OFFLINE_PAGE);
            }
          });

        // Return cached response immediately (if exists) while updating cache
        return cachedResponse || fetchPromise;
      })
  );
});