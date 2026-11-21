// Service worker mínimo do Kambio (PWA base).
// Objetivo nesta fase: permitir a instalação na tela inicial e servir a casca
// offline. A estratégia de cache completa entra numa fase posterior.

const CACHE = "kambio-casca-v1";
const CASCA = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CASCA)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Só navegação GET: tenta a rede, cai para o cache da casca se offline.
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match("/").then((r) => r ?? Response.error()),
      ),
    );
  }
});
