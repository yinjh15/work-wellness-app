 (function() {
   if (!('serviceWorker' in navigator)) {
     console.log('Service Worker not supported');
     return;
   }
   window.addEventListener('load', function() {
     navigator.serviceWorker.register('service-worker.js', { scope: '/' })
       .then(function(reg) {
         console.log('ServiceWorker registered. Scope:', reg.scope);
         reg.addEventListener('updatefound', function() {
           var worker = reg.installing;
           worker.addEventListener('statechange', function() {
             if (worker.state === 'installed' && navigator.serviceWorker.controller) {
               console.log('New version available');
             }
           });
         });
       })
       .catch(function(err) {
         console.warn('ServiceWorker registration failed:', err);
       });
   });
 })();
