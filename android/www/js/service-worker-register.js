 /**
  * Service Worker 注册脚本
  * 工作养生 Android 离线版
  *
  * 注册 Service Worker 以实现完全离线运行。
  * 即使没有网络连接，应用也能正常使用。
  */
 
 (function registerSW() {
   // 只在支持 Service Worker 的浏览器（Android WebView 支持）
   if (!('serviceWorker' in navigator)) {
     console.log('Service Worker not supported in this browser/WebView');
     return;
   }
 
   // 确保页面完全加载后再注册
   window.addEventListener('load', function() {
     navigator.serviceWorker.register('service-worker.js', {
       scope: '/'
     }).then(function(registration) {
       console.log('ServiceWorker registered successfully. Scope:', registration.scope);
 
       // 监听更新
       registration.addEventListener('updatefound', function() {
         const installingWorker = registration.installing;
         if (!installingWorker) return;
 
         installingWorker.addEventListener('statechange', function() {
           if (installingWorker.state === 'installed') {
             if (navigator.serviceWorker.controller) {
               console.log('New version available. Refresh to update.');
             } else {
               console.log('App cached for offline use.');
             }
           }
         });
       });
     }).catch(function(error) {
       console.warn('ServiceWorker registration failed:', error);
     });
 
     // 检查更新
     navigator.serviceWorker.ready.then(function(registration) {
       registration.update();
     });
   });
 
   // 处理离线/在线状态
   window.addEventListener('online', function() {
     console.log('App is online');
   });
 
   window.addEventListener('offline', function() {
     console.log('App is offline - running from cache');
   });
 })();
