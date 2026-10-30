
/* R/VIDYARAJA VIDYALAYA Student Portal - PWA */
const CACHE_NAME = "vidyaraja-student-app-v2";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./school-logo.png",
  "./student-profile.jpg"
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
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    url.origin !== self.location.origin ||
    request.method !== "GET"
  ) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("./index.html");
        })
    );
    return;
  }

  if (
    APP_SHELL.some(
      (path) =>
        new URL(path, self.location.href).pathname === url.pathname
    )
  ) {
    event.respondWith(
      caches.match(request)
        .then((cached) => cached || fetch(request))
    );
  }
});
