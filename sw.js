const CACHE = 'checklist-empilhadeira-v17-repetir-corrigido';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './modelo-checklist.jpg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const file of FILES) {
      const response = await fetch(file, { cache: 'reload' });
      if (!response.ok) throw new Error(`Falha ao atualizar ${file}: ${response.status}`);
      await cache.put(file, response);
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      return await fetch(event.request);
    } catch (error) {
      if (event.request.mode === 'navigate') {
        return (await caches.open(CACHE)).match('./index.html');
      }
      throw error;
    }
  })());
});
