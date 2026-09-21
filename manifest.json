const CACHE_NAME = 'nezamerzayka-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // Если вы вынесете CSS/JS в отдельные файлы, добавьте их имена сюда
];

// Установка сервис-воркера и кэширование файлов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Кэширование файлов приложения');
        return cache.addAll(urlsToCache);
      })
  );
  // Активируем новый SW сразу
  self.skipWaiting();
});

// Очистка старого кэша при обновлении
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов: сначала ищем в кэше, если нет — загружаем из сети
self.addEventListener('fetch', (event) => {
  // API погоды не кэшируем, чтобы данные были свежими
  if (event.request.url.includes('open-meteo.com')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Найдено в кэше
        }
        return fetch(event.request).then( // Загружаем из сети
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
        );
      })
  );
});
