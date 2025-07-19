/* * Designed & Developed by Sagar Raj
 * Version 36: Definitive Push Notification Service Worker
 */

// ** THE FIX **: Import the Firebase Cloud Messaging service worker script.
// This gives our app the ability to receive push notifications from the background.
importScripts('/firebase-messaging-sw.js');

// --- Configuration ---
const CACHE_VERSION = new Date().toISOString();
const CACHE_NAME = `padhailikhai-cache-${CACHE_VERSION}`;
const OFFLINE_URL = 'offline.html';

// Complete list of assets for a full offline experience.
const ASSETS_TO_CACHE = [
    '/',
    'index.html',
    'admin.html',
    'style.css',
    'admin.css', // Added the new admin stylesheet
    'script.js',
    'game.html',
    'offline.html',
    'icon-192.png',
    'icon-512.png',
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
                    if (cacheName.startsWith('padhailikhai-cache-') && cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// 3. Fetch Event: Intercept network requests.
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // For navigation requests (loading a page), try network first, then fall back to cache/offline page.
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

    // For all other requests (CSS, JS, images), use the "Stale-While-Revalidate" strategy.
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(request);
            const fetchPromise = fetch(request).then((networkResponse) => {
                cache.put(request, networkResponse.clone());
                return networkResponse;
            });
            return cachedResponse || await fetchPromise;
        })()
    );
});
