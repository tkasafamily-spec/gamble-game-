// Casino With Friends - lets the game install as an app and open even with a weak connection.
// It only looks after the game page and its icons; other pages on this site (like /store) are left alone.
const V = 'cwf-2026-10-28';
const BASE = new URL('./', self.location).pathname;           // e.g. /gamble-game-/
const CORE = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon-32.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cwf-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const isGamePage = p => p === BASE || p === BASE + 'index.html';
const isGameFile = p => p.startsWith(BASE + 'icons/') || p.startsWith(BASE + 'screenshots/') || p === BASE + 'manifest.webmanifest';
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.searchParams.has('fresh')) return;                     // the game's own "is there a new version?" check
  if (u.origin === self.location.origin) {
    if (r.mode === 'navigate' && isGamePage(u.pathname)) {     // the game page: newest from the internet, saved copy if offline
      e.respondWith(fetch(u.origin + u.pathname, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
        if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(BASE, cp)); }
        return res;
      }).catch(() => caches.match(BASE)));
      return;
    }
    if (!isGameFile(u.pathname)) return;                       // anything else on the site: straight to the internet
  } else if (!/(^|\.)cdnjs\.cloudflare\.com$|(^|\.)unpkg\.com$|(^|\.)cdn\.jsdelivr\.net$|(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$/.test(u.hostname)) {
    return;
  }
  e.respondWith(caches.match(r).then(m => {                    // icons, 3D engine, fonts: saved copy first, refreshed in the background
    const net = fetch(r).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => m);
    return m || net;
  }));
});
