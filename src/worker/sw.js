// InjectManifest (webpack-плагин Workbox) требует, чтобы self.__WB_MANIFEST
// где-то встречался в исходнике — иначе сборка падает. Но саму
// precacheAndRoute() сознательно не вызываем: она на install скачивает
// СРАЗУ ВСЕ файлы из манифеста через Promise.all, и если хоть один не
// загрузится (нестабильная мобильная сеть, единичный 404), весь install
// целиком проваливается и SW никогда не доходит до "activated" —
// navigator.serviceWorker.ready на странице ждёт вечно. Офлайн-кеширование
// нам не нужно, а push должен быть максимально надёжным, поэтому просто
// "используем" переменную и не кешируем ничего на install.
// eslint-disable-next-line no-unused-vars
const __precacheManifest = self.__WB_MANIFEST;

// В отличие от режима автогенерации next-pwa (который раньше собирал этот
// файл сам), при своём swSrc next-pwa больше не подставляет skipWaiting/
// clientsClaim за нас — без них новый SW зависает в "waiting" и не берёт
// на себя управление уже открытой страницей, из-за чего
// navigator.serviceWorker.ready никогда не резолвится на клиенте.
self.skipWaiting();
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Daukey App", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Daukey App";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    data: { url: payload.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  const targetPath = new URL(url, self.location.origin).pathname;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // client.url всегда абсолютный (с origin), поэтому сравниваем
        // именно pathname, а не сам url целиком.
        if (new URL(client.url).pathname === targetPath && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
