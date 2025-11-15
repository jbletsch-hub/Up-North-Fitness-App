const CACHE_NAME = 'up-north-fitness-v1.0.13';
const urlsToCache = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/compass-icon.jpg',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Network-first for HTML and JavaScript files
  const isDynamic = 
    event.request.mode === 'navigate' || 
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.html') ||
    url.pathname.startsWith('/api/');
  
  if (isDynamic) {
    // Network-first strategy: try network, fallback to cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache API responses or errors
          if (response.status === 200 && !url.pathname.startsWith('/api/')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache when offline
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-first for static assets (images, fonts, manifest, etc.)
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
        })
    );
  }
});
