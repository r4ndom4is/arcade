const RUNTIME = {"version":"5537c37b90b3800f","shell":["index.html","trumpet/index.html","assets/arcade-DiDOYpQZ.js","assets/arcade-BSoXJDdH.css","assets/shadow-dark-aB2F7Msk.webp","assets/shadow-light-ZUWlxGOM.webp","assets/cabinet-base-dark-Bxq8NzbB.webp","assets/cabinet-base-light-DnJK-zqc.webp","assets/marquee-light-dark-CuZDlpDF.webp","assets/marquee-light-light-CysByGuy.webp","assets/modulepreload-polyfill-B5Qt9EMX.js","assets/trumpet-p5OHCqcz.js","assets/trumpet-Dy0OctWG.css","assets/hood-light-C8iqhB6D.webp","assets/frame-light-DCpQrCbf.webp","assets/bezel-light-BCUXCyIK.webp","assets/deck-light-BdBzsafW.webp","assets/apron-light-Yk10Xkzh.webp","assets/manual-light-Ctl4-R2P.webp","assets/hood-dark-BaCDSx6O.webp","assets/frame-dark-B3Z-BwaA.webp","assets/bezel-dark-CzaUs-n1.webp","assets/deck-dark-sy4j_gCm.webp","assets/apron-dark-Cs8F9NPy.webp","assets/manual-dark-z7_ANm4l.webp","assets/trumpet-marquee-D_fvtdnm.svg","manifest.webmanifest","assets/arcade-icon.svg","assets/arcade-apple-touch-icon.png","assets/arcade-favicon-32.png","assets/trumpet-icon.svg","assets/trumpet-icon-192.png","assets/trumpet-icon-512.png","assets/trumpet-maskable-192.png","assets/trumpet-maskable-512.png","assets/trumpet-apple-touch-180.png","assets/trumpet-favicon-32.png"],"games":{"trumpet":["assets/index-BqWyLkWU.js","assets/rider-CbvEIwWh.png","assets/palace-far-day-BGO2i9Uv.png","assets/palace-mid-day-DEyKKWOp.png","assets/palace-near-day-DgMKcHLM.png","assets/palace-far-night-DEXCdRvq.png","assets/palace-mid-night-DYrZF4Xz.png","assets/palace-near-night-DnU_A0na.png","assets/phaser-BwSGr_Za.js","assets/index.esm-C4LxBatj.js","assets/index.esm-a-VMAV-6.js","assets/index.esm-_ofKhjet.js","assets/index.esm-DxYUC9Rf.js"]}};
"use strict";

const PREFIX = `arcade-dev:${self.registration.scope}:`;
const CACHE = PREFIX + RUNTIME.version;
const local = path => new URL(path, self.registration.scope).href;
const shell = RUNTIME.shell.map(local);
const games = Object.fromEntries(Object.entries(RUNTIME.games).map(([id, files]) => [id, files.map(local)]));
const allowed = new Set([...shell, ...Object.values(games).flat()]);
const routes = new Map([
  [local(""), local("index.html")],
  [local("index.html"), local("index.html")],
  [local("trumpet/"), local("trumpet/index.html")],
  [local("trumpet/index.html"), local("trumpet/index.html")]
]);

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(shell.map(url => new Request(url, { cache: "reload" })));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    // Keep one previous release for still-open tabs. Never touch another app's cache.
    const previous = (await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== CACHE);
    for (const key of previous.slice(0, -1)) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener("message", event => {
  if (event.data?.type !== "CACHE_GAME" || !event.ports[0]) return;
  const files = games[event.data.id];
  event.waitUntil((async () => {
    try {
      if (!files) throw new Error("Unknown offline game.");
      const cache = await caches.open(CACHE);
      const missing = [];
      for (const url of files) if (!(await cache.match(url))) missing.push(new Request(url, { cache: "reload" }));
      await cache.addAll(missing);
      event.ports[0].postMessage({ ok: true });
    } catch (error) {
      event.ports[0].postMessage({ ok: false, error: String(error) });
    }
  })());
});
async function findCached(url) {
  const keys = [CACHE, ...(await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== CACHE).reverse()];
  for (const key of keys) {
    const response = await (await caches.open(key)).match(url);
    if (response) return response;
  }
}
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  const canonical = url.origin + url.pathname;
  const route = routes.get(canonical);
  if (event.request.mode === "navigate" && route) {
    event.respondWith((async () => {
      try {
        const response = await fetch(new Request(event.request, { cache: "no-cache" }));
        const final = new URL(response.url);
        if (!response.ok || !routes.has(final.origin + final.pathname) ||
            !response.headers.get("content-type")?.includes("text/html"))
          throw new Error("The server did not return the requested arcade page.");
        // The installed shell is a coherent release; do not mix its HTML with newer bundles.
        return response;
      } catch (error) {
        const saved = await findCached(route);
        if (saved) return saved;
        return new Response(`Arcade is unavailable offline. Reconnect to download it. ${String(error)}`, {
          status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    })());
  } else if (allowed.has(canonical) || canonical.startsWith(local("assets/"))) {
    event.respondWith((async () => (await findCached(canonical)) ?? fetch(event.request))());
  }
});
