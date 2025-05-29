const VERSION = 'v17';
const OFFLINE_CACHE = 'offline-cache-' + VERSION;
const APP_CACHE = 'app-cache-' + VERSION;

self.addEventListener('install', event => {
    event.waitUntil(installServiceWorker());
});

async function installServiceWorker() {
    console.log(VERSION, 'Installing Service Worker...');

    const appCache = await caches.open(APP_CACHE);
    const offlineCache = await caches.open(OFFLINE_CACHE);
// Your original app files to cache
await appCache.addAll([
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
])

 // Cache all offline files (update list as needed or automate with a build tool)
 await offlineCache.addAll([
    '/offline/index.html',
    '/offline/style.css',
    '/offline/script.js'
])

console.log(VERSION, 'Service Worker installed.');
}

self.addEventListener('activate', async event => {
console.log(VERSION, 'Activating new Service Worker...');
const keys = await caches.keys();
await Promise.all(keys.map(key => {
    if (![APP_CACHE, OFFLINE_CACHE].includes(key)) {
        return caches.delete(key);
    }
}));
});

self.addEventListener('fetch', event => {
event.respondWith(networkFirst(event.request));
});

async function networkFirst(request) {
try {
    const networkResponse = await fetch(request);
    return networkResponse;
} catch (err) {
    const cache = await caches.open(APP_CACHE);
    const offlineCache = await caches.open(OFFLINE_CACHE);

    // Serve offline fallback for homepage
    if (request.mode === 'navigate') {
        return offlineCache.match('/offline/index.html');
    }

    const cachedResponse = await cache.match(request) || await offlineCache.match(request);
    return cachedResponse || Response.error();
}
}
