const CACHE_VERSION = 'v6-final-fix';
const CACHE_NAME = `nezamerzayka-${CACHE_VERSION}`;
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(names => Promise.all(
            names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
        ))
    );
    self.clients.claim();
});

// ВАЖНО: Не перехватываем внешние API, чтобы избежать ошибок CORS
self.addEventListener('fetch', e => {
    if (e.request.url.startsWith(self.location.origin)) {
        e.respondWith(
            caches.match(e.request).then(cached => cached || fetch(e.request))
        );
    }
    // Все остальные запросы (API погоды) идут напрямую без вмешательства SW
});
