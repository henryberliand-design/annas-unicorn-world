// Service Worker for Anna's Unicorn World — offline play support
const CACHE_NAME = 'unicorn-world-v1';

const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/engine/game.js',
    '/js/engine/renderer.js',
    '/js/engine/input.js',
    '/js/engine/audio.js',
    '/js/engine/save.js',
    '/js/engine/dda.js',
    '/js/scenes/creator.js',
    '/js/scenes/hub.js',
    '/js/scenes/stable.js',
    '/js/scenes/garden.js',
    '/js/scenes/minigame.js',
    '/js/characters/unicorn.js',
    '/js/characters/creatures.js',
    '/js/characters/customisation.js',
    '/js/ui/hud.js',
    '/js/ui/menus.js',
    '/js/ui/transitions.js',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
