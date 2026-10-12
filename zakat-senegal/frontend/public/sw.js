/* Service worker prudent : cache uniquement le shell public et les ressources statiques.
   JAMAIS d'appels /api (données privées, justificatifs, paiements). */
const CACHE = 'zakat-sn-v2';
const PRECACHE = ['/', '/offline.html', '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api')) return; // réseau uniquement

  // Navigation : réseau d'abord, repli sur le shell public puis sur la page hors ligne.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(async () => (await caches.match('/')) || caches.match('/offline.html')));
    return;
  }

  // Ressources statiques : cache d'abord, sinon réseau puis mise en cache.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(req).then(async (cached) => {
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) {
          const copy = res.clone(); // cloner AVANT de renvoyer la réponse
          const cache = await caches.open(CACHE);
          await cache.put(req, copy);
        }
        return res;
      })
    );
  }
});