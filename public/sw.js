// DocWorks — Service Worker
// No lleva número de versión: no hace falta tocarlo al subir versiones nuevas.
// El HTML siempre se pide a internet primero y los archivos de /assets/ cambian
// de nombre solos en cada build, así que nunca queda una versión vieja guardada.
const CACHE_NAME = "docworks-cache";

self.addEventListener("install", (event) => {
  // No precacheamos index.html: así nunca queda una versión vieja guardada.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Solo manejamos lo del mismo dominio (Supabase y demás pasan directo).
  if (url.origin !== self.location.origin) return;

  // 1) Páginas / HTML: RED PRIMERO. Si no hay internet, usa la última copia.
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put("/index.html", copy));
          }
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 2) Archivos con hash en /assets/: caché primero (cambian de nombre en cada build).
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  // 3) Todo lo demás (sw.js, manifest, íconos): red primero.
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
