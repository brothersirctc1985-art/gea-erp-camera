const CACHE_NAME = 'gea-camera-offline-v1';
const CAMERA_PAGE = new URL('./camera.html', self.location.href).toString();

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.add(new Request(CAMERA_PAGE, {cache: 'reload'})))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.mode === 'navigate' && url.pathname.endsWith('/camera.html')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(CAMERA_PAGE, copy));
        }
        return response;
      }).catch(() =>
        caches.open(CACHE_NAME).then(cache =>
          cache.match(CAMERA_PAGE).then(cached => cached || Response.error())
        )
      )
    );
  }
});
