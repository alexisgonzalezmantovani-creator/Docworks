// Sólo se guarda la pantalla estática de desconexión. Nunca documentos, APIs ni respuestas autenticadas.
const OFFLINE_CACHE = 'docworks-offline-v638';
const OFFLINE_URL = '/offline.html';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then(cache => cache.add(OFFLINE_URL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('docworks-offline-') && key !== OFFLINE_CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || req.mode !== 'navigate' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(fetch(req).catch(async () => {
    const offline = await (await caches.open(OFFLINE_CACHE)).match(OFFLINE_URL);
    return offline || new Response('DocWorks necesita conexión para abrirse. Reconectate y volvé a intentar. Tus borradores locales no se eliminan.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
