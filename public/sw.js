self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("devtrack-ai-v1").then((cache) => cache.addAll(["/", "/dashboard", "/manifest.webmanifest"])));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
