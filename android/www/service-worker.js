 /**
  * 工作养生 - 离线版 Service Worker
  *
  * 缓存策略：安装时预缓存所有应用资源（Cache-First）
  * 应用完全离线运行，不需要网络连接
  */
 
 const CACHE_NAME = 'work-wellness-v1';
 
 // 需要预缓存的所有资源（应用的核心文件）
 const PRECACHE_URLS = [
   '/',
   'index.html',
   'css/style.css',
   'js/app.js',
   'js/particles.js',
   'js/service-worker-register.js',
   'icons/icon.png',
   'icons/icon-hdpi.png',
   'icons/icon-xhdpi.png',
   'icons/icon-xxhdpi.png',
   'icons/icon-xxxhdpi.png',
   'icons/splash.png'
 ];
 
 // 安装事件 - 预缓存所有资源
 self.addEventListener('install', function(event) {
   event.waitUntil(
     caches.open(CACHE_NAME).then(function(cache) {
       console.log('Caching app resources for offline use');
       return cache.addAll(PRECACHE_URLS);
     }).then(function() {
       // 跳过等待，立即激活新版本
       return self.skipWaiting();
     })
   );
 });
 
 // 激活事件 - 清理旧缓存
 self.addEventListener('activate', function(event) {
   event.waitUntil(
     caches.keys().then(function(cacheNames) {
       return Promise.all(
         cacheNames.filter(function(name) {
           return name !== CACHE_NAME;
         }).map(function(name) {
           console.log('Deleting old cache:', name);
           return caches.delete(name);
         })
       );
     }).then(function() {
       // 立即控制所有客户端
       return self.clients.claim();
     })
   );
 });
 
 // 请求拦截 - Cache-First 策略
 self.addEventListener('fetch', function(event) {
   // 只缓存同源请求
   if (event.request.url.startsWith(self.location.origin) ||
       event.request.url.startsWith('file://')) {
 
     event.respondWith(
       caches.match(event.request).then(function(cachedResponse) {
         if (cachedResponse) {
           // 缓存命中，返回缓存的资源
           return cachedResponse;
         }
 
         // 缓存未命中，尝试网络获取
         return fetch(event.request).then(function(networkResponse) {
           // 只缓存有效响应
           if (!networkResponse || networkResponse.status !== 200 ||
               networkResponse.type !== 'basic') {
             return networkResponse;
           }
 
           // 将新资源加入缓存
           const responseClone = networkResponse.clone();
           caches.open(CACHE_NAME).then(function(cache) {
             cache.put(event.request, responseClone);
           });
 
           return networkResponse;
         }).catch(function() {
           // 网络失败时，如果请求是 HTML 则返回首页
           if (event.request.mode === 'navigate') {
             return caches.match('index.html');
           }
           return new Response('Offline', { status: 503 });
         });
       })
     );
   }
 });
