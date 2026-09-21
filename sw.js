const CACHE_VERSION = 'v2'; // ✅ Увеличиваем версию — это заставит браузер забыть старый кеш
const CACHE_NAME = `nezamerzayka-cache-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Установка — кешируем файлы
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('✅ Кешируем файлы версии', CACHE_VERSION);
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.warn('Не удалось закешить все файлы:', err);
            });
        })
    );
    self.skipWaiting(); // ✅ Сразу активируем новый SW
});

// Активация — удаляем старые кеши
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('🗑️ Удаляем старый кеш:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim(); // ✅ Применяем новый SW ко всем вкладкам
});

// Запрос — сначала сеть, потом кеш (для актуальных данных)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Кешируем успешные ответы
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Если сети нет — берём из кеша
                return caches.match(event.request);
            })
    );
});
