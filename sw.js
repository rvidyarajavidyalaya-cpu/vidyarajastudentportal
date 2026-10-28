/* R/VIDYARAJA VIDYALAYA Student Portal - basic PWA shell cache */
const CACHE_NAME = "vidyaraja-portal-shell-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./amin.html",
  "./manifest.json",
  "./logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Leave Firebase, CDN libraries, and other external requests to the network.
  if (url.origin !== self.location.origin || request.method !== "GET") return;

  // Network-first for page navigation so online users receive the latest portal.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("./index.html");
        })
    );
    return;
  }

  // Cache-first only for the small local app-shell files.
  if (APP_SHELL.some((path) => new URL(path, self.location.href).pathname === url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
