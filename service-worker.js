const CACHE_NAME = "giris-paneli-v3";
const BASE_PATH = new URL("./", self.registration.scope);
const APP_SHELL = [
  BASE_PATH.href,
  new URL("index.html", BASE_PATH).href,
  new URL("manifest.webmanifest", BASE_PATH).href,
  new URL("icons/icon-192.png", BASE_PATH).href,
  new URL("icons/icon-512.png", BASE_PATH).href,
  new URL("icons/favicon.svg", BASE_PATH).href
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(fetch(req).then(res => {
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
    }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match(new URL("index.html", BASE_PATH).href))));
});
