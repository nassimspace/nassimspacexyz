const version = "05302025b";
const cacheName = `nsspace-${version}`;
const OFFLINE_PAGE = '/offline.html';
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        '/',
        '/?utm_source=pwa',
        '/manifest.json',
        '/pwa-handler.js',
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
      ])
          .then(() => self.skipWaiting());
    })
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, {ignoreSearch: true}))
      .then(response => {
      return response || fetch(event.request);
    })
    .catch(() => {
        // Serve offline page if network fails
        return caches.match(OFFLINE_PAGE);
      })
  );
});