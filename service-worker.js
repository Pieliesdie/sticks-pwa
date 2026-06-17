const CACHE = 'sticks-pwa-v5';

const ASSETS = [
  '/sticks-pwa/',
  '/sticks-pwa/index.html',
  '/sticks-pwa/manifest.json',
  '/sticks-pwa/favicon.ico',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Stale-while-revalidate strategy
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Fallback for offline if not in cache (e.g., navigation)
        if (e.request.mode === 'navigate') {
          return caches.match('/sticks-pwa/');
        }
      });

      return cached || fetchPromise;
    })
  );
});