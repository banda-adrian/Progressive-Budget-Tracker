const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
  "/",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/db.js",
  "/index.html",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
];

//install
self.addEventListener("install", event => {

  // Wait until promise is finished  
  event.waitUntil(
    caches.open(DATA_CACHE_NAME)
      .then(cache => {
        console.log(`Service Worker: Caching Files: ${cache}`);
        cache.addAll(FILES_TO_CACHE)
          // When everything is set 
          .then(() => self.skipWaiting())
      })
  );
});

// fetch api
self.addEventListener("activate", event => {
  console.log('Service Worker: Activated');
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {

            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then( response => {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      });
    })
  );
});