/* * Designed & Developed by Sagar Raj
 * Version 33: Definitive Service Worker with Stale-While-Revalidate Strategy
 */

// --- Configuration ---
// By using a dynamic date, we ensure the cache is always updated when you deploy a new version.
const CACHE_VERSION = new Date().toISOString();
const CACHE_NAME = `padhailikhai-cache-${CACHE_VERSION}`;
const OFFLINE_URL = 'offline.html';

// ** FIX **: Complete list of assets for a full offline experience, including the admin page and icons.
const ASSETS_TO_CACHE = [
    '/',
    'index.html',
    'admin.html', // Added for offline admin access
    'style.css',
    'script.js',
    'game.html',
    'offline.html',
    'icon-192.png', // Added from manifest
    'icon-512.png', // Added from manifest
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js'
];

// --- Service Worker Lifecycle ---

// 1. Install Event: Cache all critical assets.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching all critical assets for offline use.');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => {
            // Force the waiting service worker to become the active service worker.
            self.skipWaiting();
        })
    );
});

// 2. Activate Event: Clean up old, outdated caches.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // If the cache name is not our current one, delete it.
                    if (cacheName.startsWith('padhailikhai-cache-') && cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all open clients once activated.
            return self.clients.claim();
        })
    );
});

// 3. Fetch Event: Intercept network requests.
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // For navigation requests (e.g., loading a page), try network first, then fall back to cache/offline page.
    if (request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    const networkResponse = await fetch(request);
                    return networkResponse;
                } catch (error) {
                    console.log('[Service Worker] Fetch failed for navigation; returning offline page.', error);
                    const cache = await caches.open(CACHE_NAME);
                    return await cache.match(OFFLINE_URL);
                }
            })()
        );
        return;
    }

    // ** FIX **: For all other requests (CSS, JS, images), use the "Stale-While-Revalidate" strategy.
    // This provides the best of both worlds: instant loading from cache and seamless updates in the background.
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(request);

            // Fetch a fresh version from the network in the background.
            const fetchPromise = fetch(request).then((networkResponse) => {
                // If the fetch is successful, update the cache with the new version.
                cache.put(request, networkResponse.clone());
                return networkResponse;
            });

            // Return the cached response immediately if it exists, otherwise wait for the network response.
            return cachedResponse || await fetchPromise;
        })()
    );
});
