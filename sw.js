// Service Worker for Anna's Unicorn World — offline play support
const CACHE_NAME = 'unicorn-world-v3';

// Derive base path from service worker location (works on both localhost and GitHub Pages)
const BASE = self.location.pathname.replace(/sw\.js$/, '');

const ASSET_PATHS = [
    '',
    'index.html',
    'css/styles.css',
    'manifest.json',
    // Engine
    'js/engine/game.js',
    'js/engine/renderer.js',
    'js/engine/input.js',
    'js/engine/audio.js',
    'js/engine/save.js',
    'js/engine/dda.js',
    // Scenes
    'js/scenes/creator.js',
    'js/scenes/hub.js',
    'js/scenes/stable.js',
    'js/scenes/garden.js',
    'js/scenes/minigame.js',
    // Characters
    'js/characters/unicorn.js',
    'js/characters/creatures.js',
    'js/characters/customisation.js',
    // UI
    'js/ui/hud.js',
    'js/ui/menus.js',
    'js/ui/transitions.js',
    // Zones (all 9)
    'js/zones/rainbow-meadow.js',
    'js/zones/counting-creek.js',
    'js/zones/letter-grove.js',
    'js/zones/shape-mountain.js',
    'js/zones/music-pond.js',
    'js/zones/feelings-forest.js',
    'js/zones/star-observatory.js',
    'js/zones/swimming-pool.js',
    'js/zones/places-playground.js',
    // Icons
    'icons/icon-192.png',
    'icons/icon-512.png'
];

const ASSETS = ASSET_PATHS.map(p => BASE + p);

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
