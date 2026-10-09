/* Offline support for Kohikori.
   Always tries the network first, so updates you push to GitHub show up right away.
   Falls back to the last saved copy when there's no connection.
   If you add a new app page, add it to FILES and bump the version number. */
const CACHE = 'kohikori-v5';
const FILES = [
  './', 'index.html', 'verb.html', 'adj.html', 'counters.html', 'vocab.html', 'ja.js', 'manifest.webmanifest',
  'icon-home-180.png', 'icon-home-192.png', 'icon-home-512.png', 'icon-home-maskable-512.png',
  'icon-verb-180.png', 'icon-adj-180.png', 'icon-cnt-180.png', 'icon-vocab-180.png', 'icon-favicon-64.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.allSettled(FILES.map(f => c.add(new Request(f, { cache: 'reload' }))))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(async () =>
      (await caches.match(req, { ignoreSearch: true })) ||
      (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
  );
});
