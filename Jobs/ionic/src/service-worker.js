/**
 * Check out https://googlechromelabs.github.io/sw-toolbox/ for
 * more info on how to use sw-toolbox to custom configure your service worker.
 */


'use strict';
// importScripts('./build/sw-toolbox.js');

// self.toolbox.options.cache = {
//     name: 'ionic-cache'
// };

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open('ionic-cache').then(function(cache) {
            return cache.addAll([
                './build/main.js',
                './build/vendor.js',
                './build/main.css',
                './build/polyfills.js',
                'index.html',
                'manifest.json'
            ]);
        })
    );
});
self.addEventListener('fetch', function(event) {
    console.log(event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
// pre-cache our key assets
// self.toolbox.precache(
//     [
//         './build/main.js',
//         './build/vendor.js',
//         './build/main.css',
//         './build/polyfills.js',
//         'index.html',
//         'manifest.json'
//     ]
// );

// dynamically cache any other local assets
// self.toolbox.router.any('/*', self.toolbox.fastest);

// for any other requests go to the network, cache,
// and then only use that cached resource if your user goes offline
// self.toolbox.router.default = self.toolbox.networkFirst