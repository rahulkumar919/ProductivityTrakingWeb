self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("devtrack-ai-v2").then((cache) =>
      cache.addAll(["/", "/dashboard", "/manifest.webmanifest"])
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== "devtrack-ai-v2").map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // CRITICAL: NEVER intercept API calls, database uploads/downloads, or non-GET requests in Service Worker!
  // Let the browser communicate directly with the server socket.
  if (url.includes("/api/") || event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return new Response("Offline – no cached version available.", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      });
    })
  );
});
