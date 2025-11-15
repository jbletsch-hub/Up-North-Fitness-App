const CACHE_NAME = 'up-north-fitness-v1.0.15';
const urlsToCache = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        const cachePromises = urlsToCache.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              console.log('[Service Worker] Cached:', url);
            } else {
              console.warn('[Service Worker] Failed to cache (non-200):', url, response.status);
            }
          } catch (error) {
            console.warn('[Service Worker] Failed to cache:', url, error);
          }
        });
        await Promise.all(cachePromises);
        console.log('[Service Worker] Pre-caching complete');
      })
      .catch((error) => {
        console.error('[Service Worker] Cache open failed:', error);
        throw error;
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('[Service Worker] Existing caches:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activation complete');
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
