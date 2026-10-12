/* Service worker prudent : met en cache uniquement le « shell » public et les ressources statiques.
   JAMAIS d'appels /api (données privées, justificatifs, paiements) : ils passent toujours par le réseau. */
const CACHE = 'zakat-sn-v1';
const PRECACHE = ['/', '/offline.html', '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
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
  // Ressources statiques : cache d'abord, mise à jour en arrière-plan.
   // Ressources statiques : cache d'abord, mise à jour en arrière-plan.
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone(); // cloner AVANT de renvoyer la réponse
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached); // hors ligne : on garde la version en cache
        return cached || network;
      })
    );
  }
});
