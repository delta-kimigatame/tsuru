const cacheName = "UTAlet_demo";
const urlsToCache = [
  "./",
  "./index.html",
  "./assets/index.js",
  "./assets/browser.js",
  "./static/logo192.png",
  "./static/logo512.png",
  "./static/favicon.ico",
];
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (e) => {
  const cacheWhiteList = [cacheName];
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((c) => {
          if (cacheWhiteList.indexOf(c) === -1) {
            return caches.delete(c);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) {
        return res;
      }
      const fetchRequest = e.request.clone();

      return fetch(fetchRequest).then((res) => {
        if (!res || res.status !== 200 || res.type !== "basic") {
          return res;
        }
        const responseToCache = res.clone();
        caches.open(cacheName).then((c) => {
          cache.put(e.request, responseToCache);
        });
        return res;
      });
    })
  );
});
