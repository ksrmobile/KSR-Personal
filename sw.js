const CACHE_NAME = 'ksr-site-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/all.min.css',
  '/images/me.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // network first for navigation, cache-first for others
  if (req.mode === 'navigate' || req.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      return caches.open(CACHE_NAME).then(cache => {
        try { cache.put(req, resp.clone()); } catch (e) {}
        return resp;
      });
    }).catch(() => {}))
  );
});
