// Casino With Friends - lets the game install as an app and open even with a weak connection.
const V = 'cwf-2026-10-27';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon-32.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.searchParams.has('fresh')) return;               // the game's own "is there a new version?" check
  if (r.mode === 'navigate') {                            // the game page: newest from the internet, saved copy if offline
    e.respondWith(fetch(u.origin + u.pathname, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put('./index.html', cp)); }
      return res;
    }).catch(() => caches.match('./index.html').then(m => m || caches.match('./'))));
    return;
  }
  const lib = /(^|\.)cdnjs\.cloudflare\.com$|(^|\.)unpkg\.com$|(^|\.)cdn\.jsdelivr\.net$|(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$/.test(u.hostname);
  if (u.origin === self.location.origin || lib) {         // icons, 3D engine, fonts: saved copy first, refreshed in the background
    e.respondWith(caches.match(r).then(m => {
      const net = fetch(r).then(res => {
        if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
        return res;
      }).catch(() => m);
      return m || net;
    }));
  }
});
