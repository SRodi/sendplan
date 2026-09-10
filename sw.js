const CACHE = "training-shell-v17";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./data.json",
  "./manifest.webmanifest",
  "./icons/app-icon.svg",
  "./js/app.js",
  "./js/ui.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(caches.match(event.request).then((cached) => {
    const network = fetch(event.request).then((response) => {
      if (response.ok || response.type === "opaque") {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    });
    return cached || network.catch(() => caches.match("./index.html"));
  }));
});