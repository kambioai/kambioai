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

// ===== Web Push (CLAUDE.md §8) =====
// O servidor manda um JSON { titulo, corpo, url, tag }. Mostramos a notificação
// e, ao tocar, abrimos (ou focamos) o app na rota indicada.
self.addEventListener("push", (event) => {
  let dados = {};
  try {
    dados = event.data ? event.data.json() : {};
  } catch {
    dados = {};
  }
  const titulo = dados.titulo || "Kambio";
  const opcoes = {
    body: dados.corpo || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: dados.tag || undefined,
    data: { url: dados.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(titulo, opcoes));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const alvo = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientes) => {
        for (const c of clientes) {
          if ("focus" in c) {
            c.navigate(alvo);
            return c.focus();
          }
        }
        return self.clients.openWindow(alvo);
      }),
  );
});
