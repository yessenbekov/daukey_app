// public/sw.js
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("daukey-cache").then((cache) => {
      return cache.addAll(["/", "/manifest.json", "/icons/icon-192x192.png"]);
    })
  );
});

self.addEventListener("activate", () => {
  clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => {
      return res || fetch(event.request);
    })
  );
});
