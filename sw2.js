const OFFLINE_VERSION = 13;
const CACHE_NAME = "offline-cache-v13";
const OFFLINE_URL = "/offline/";

// List of files to cache for offline usage
const OFFLINE_FILES = [
    '/offline'
];

const STATIC_FILES = [
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
    '/web-app-manifest-192x192.png'
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Combine both static and offline files
      const allFiles = [...new Set([...STATIC_FILES, ...OFFLINE_FILES])];

      await cache.addAll(allFiles.map((url) => new Request(url, { cache: "reload" })));
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      // Delete old caches not matching the current version
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })()
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;

          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          console.log("Fetch failed; returning offline page instead.", error);
          const cache = await caches.open(CACHE_NAME);
          return await cache.match(OFFLINE_URL);
        }
      })()
    );
  } else {
    // Try cache first for static and offline resources
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).catch(() => {
            // Optional: Fallback image or asset
            if (event.request.destination === "document") {
              return caches.match("/offline");
            }
          })
        );
      })
    );
  }
});
