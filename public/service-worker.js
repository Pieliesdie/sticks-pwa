const CACHE = 'sticks-pwa-v2';

const ASSETS = [
  '/sticks-pwa/',
  '/sticks-pwa/index.html',
  '/sticks-pwa/manifest.json',
  '/sticks-pwa/favicon.ico',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      fetch('/sticks-pwa/index.html')
        .then(r => r.text())
        .then(html => {
          // Extract JS/CSS asset URLs from the HTML
          const matches = [...html.matchAll(/\/sticks-pwa\/assets\/[^"' ]+/g)].map(m => m[0]);
          return cache.addAll([...new Set([...ASSETS, ...matches])]);
        })
        .catch(() => cache.addAll(ASSETS))
    )
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
  const url = new URL(e.request.url);

  // Network-first for HTML (so updates reach users)
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('/sticks-pwa/')))
    );
    return;
  }

  // Cache-first for assets (JS, CSS, fonts, images)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r.ok) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      });
    })
  );
});