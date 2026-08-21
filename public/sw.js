// ============================================================================
// Savina K-12 Service Worker - Offline-First Architecture
// Provides caching for app shell, static assets, and offline fallbacks
// ============================================================================

const CACHE_NAME = 'savina-k12-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install Event: Pre-cache core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Some assets failed to pre-cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-first with Cache fallback for API and Cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g., POST payments or attendance are queued in LocalStorage)
  if (request.method !== 'GET') {
    return;
  }

  // API Requests: Network first, fall back to offline cache or fallback response
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful API responses for offline access
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(async () => {
          // Attempt to retrieve from cache
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }

          // Return offline indicator fallback JSON for health or queries
          if (url.pathname === '/api/health') {
            return new Response(
              JSON.stringify({
                status: 'offline',
                message: 'Operating in Local Storage Offline Mode',
                cachedAt: new Date().toISOString(),
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ error: 'Network unavailable. Running in offline mode.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // App Shell & Static Assets: Stale-while-revalidate strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, rely on cache or root
          return cachedResponse || caches.match('/');
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for messages from client (e.g., trigger cache purge or offline check)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
