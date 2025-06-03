const runtimeCaching = [
  // Главная страница
  {
    urlPattern: /^\/$/,
    handler: "NetworkFirst",
    options: {
      cacheName: "start-url",
      expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 },
    },
  },
  // Картинки из /public
  {
    urlPattern: /^\/images\/.*\.(png|jpg|jpeg|gif|webp|svg|ico)$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "local-images",
      expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
    },
  },
  // Supabase изображения
  {
    urlPattern: /^https:\/\/luxikyclvakgjtcawupf\.supabase\.co\/.*/i,
    handler: "CacheFirst",
    options: {
      cacheName: "supabase-images",
      expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
    },
  },
  // _next/static
  {
    urlPattern: /^\/_next\/.*$/i,
    handler: "StaleWhileRevalidate",
    options: {
      cacheName: "next-static",
      expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 },
    },
  },
];

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching,
  fallbacks: {
    document: "/offline.html", // fallback при оффлайне
  },
});

module.exports = withPWA({});
