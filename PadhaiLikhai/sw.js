/*
 * Service Worker for PadhaiLikhai - Developed by Sagar Raj
 * This file handles caching and offline functionality.
 */

const cacheName = 'padhailikhai-v1';
const assetsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'game.html',
  'offline.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css'
];

// Install event: cache all essential assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(assetsToCache);
    })
  );
});

// Fetch event: serve from cache first, with network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if found, otherwise fetch from network
      return response || fetch(event.request).catch(() => {
        // If the network request fails (e.g., offline), and it's a navigation request,
        // show the offline page.
        if (event.request.mode === 'navigate') {
          return caches.match('offline.html');
        }
      });
    })
  );
});
