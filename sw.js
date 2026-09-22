const CACHE_NAME = 'nezamerzayka-cache-v6';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './bottle.png',
  './pack.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Установка...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Кэширование файлов:', urlsToCache);
        return Promise.all(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn('[SW] Не удалось закэшировать:', url, err.message);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] Кэширование завершено');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Активация...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Активация завершена');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Не кэшируем внешние ресурсы
  if (url.includes('open-meteo.com') || 
      url.includes('unpkg.com') ||
      url.includes('chrome-extension') ||
      url.includes('github.com') ||
      url.includes('githubusercontent.com')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        ).catch(err => {
          console.warn('[SW] Ошибка сети:', event.request.url);
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
