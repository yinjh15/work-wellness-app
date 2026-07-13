 var CACHE = 'work-wellness-v1';
 var URLS = [
   '/',
   'index.html',
   'css/style.css',
   'js/app.js',
   'js/particles.js',
   'js/service-worker-register.js',
   'manifest.json',
   'icons/apple-touch-icon.png',
   'icons/pwa-icon-192.png',
   'icons/pwa-icon-512.png'
 ];
 
 self.addEventListener('install', function(e) {
   e.waitUntil(
     caches.open(CACHE).then(function(c) {
       return c.addAll(URLS);
     }).then(function() {
       return self.skipWaiting();
     })
   );
 });
 
 self.addEventListener('activate', function(e) {
   e.waitUntil(
     caches.keys().then(function(names) {
       return Promise.all(
         names.filter(function(n) { return n !== CACHE; })
           .map(function(n) { return caches.delete(n); })
       );
     }).then(function() {
       return self.clients.claim();
     })
   );
 });
 
 self.addEventListener('fetch', function(e) {
   e.respondWith(
     caches.match(e.request).then(function(r) {
       return r || fetch(e.request).then(function(resp) {
         if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
         var clone = resp.clone();
         caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
         return resp;
       }).catch(function() {
         if (e.request.mode === 'navigate') return caches.match('index.html');
         return new Response('Offline', { status: 503 });
       });
     })
   );
 });
