var version = 'LSPWAV13';
var filesToCache = [
  '/',
  '/index.html',
  '/js/app.js',
  '/css/main.css'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches
      .open(version)
      .then(function(cache) {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(filesToCache);
      })
      .then(function() {
        console.log('[ServiceWorker] Install completed');
      })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches
      .keys()
      .then(function(keys) {
        return Promise.all(
          keys
            .filter(function(key) {
              return key !== version;
            })
            .map(function(key) {
              return caches.delete(key);
            })
        );
      })
      .then(function() {
        console.log('[ServiceWorker] Activate completed');
      })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUri = '/schedule.json';
  if (e.request.url.indexOf(dataUri) > -1) {
    e.respondWith(
      caches.open(version).then(function(cache) {
        return fetch(e.request)
          .then(function(response){
            cache.put(e.request.url, response.clone());
            return response;
          }).catch(function() {
            console.log('[ServiceWorker] Offline');
          });
      })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
