/* مصاريفي — Service Worker (v4)
   التنقّل: الشبكة أولاً (عشان دايم آخر نسخة، وما يعلق على نسخة قديمة/فاضية).
   باقي الملفات: كاش أولاً عشان يفتح فوري ويشتغل بدون نت.
   لو عدّلت أي ملف، غيّر رقم النسخة (CACHE). */
const CACHE = "masareefi-v4";
const ASSETS = [
  "./","./index.html","./manifest.webmanifest",
  "./icon-192.png","./icon-512.png","./icon-maskable-512.png","./apple-touch-icon.png","./favicon-32.png"
];
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        try { (await caches.open(CACHE)).put("./index.html", res.clone()); } catch (_) {}
        return res;
      } catch (err) {
        const cached = (await caches.match("./index.html")) || (await caches.match(req)) || (await caches.match("./"));
        if (cached) return cached;
        throw err;
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const res = await fetch(req);
    if (res && res.status === 200 && (res.type === "basic" || res.type === "default")) {
      try { (await caches.open(CACHE)).put(req, res.clone()); } catch (_) {}
    }
    return res;
  })());
});
 
