const RUNTIME = {"version":"b85b6c1d687a28f5","files":[{"path":"assets/index-C9yITZ46.js","integrity":"sha256-7q7vipEHdBCi/40aD8BWgI9n8tPXreZTQ2QHdB5t2Eg="},{"path":"assets/index-CB1S5Yrj.js","integrity":"sha256-/VhcIZKHcgUksfjgehwR62Zh8MTBQyLA19lRuIybbtQ="},{"path":"assets/index-Cod7yWOt.css","integrity":"sha256-8DitD3lfFj/e/+uXCys/7THxMkXPUZ4CDwDt0FVRSys="},{"path":"assets/index.esm-_ofKhjet.js","integrity":"sha256-v+DGbdmPEkqgHvWQiZ9B1V7rTWIY2DL3/LHXiTf0dX0="},{"path":"assets/index.esm-a-VMAV-6.js","integrity":"sha256-rTtfSey8/BvyXxIeY4D7hPChsPYuKa+/tFqhdvOxkeQ="},{"path":"assets/index.esm-C4LxBatj.js","integrity":"sha256-Qy3/zgdiOa2bUPmbd+TxLiqk/PwrVEbG1q6POcAy0pI="},{"path":"assets/index.esm-DxYUC9Rf.js","integrity":"sha256-AJkBeHzbHF/9V4glo/XJLY9lpH3gPQA1lgY2Y+yB+00="},{"path":"assets/lantern-BbqZJ8yC.webp","integrity":"sha256-nSHSMDPgE9NyKw32LLWh4hotjkD+h0gsyYR1/j5eDmc="},{"path":"assets/parallax-landmarks-Cgy_bvGI.webp","integrity":"sha256-86g+29ZIpnz5Xi0IOjkFh8NC+8Y+c/cmIhMrzzGnOnc="},{"path":"assets/parallax-mountains-CZfs2upF.webp","integrity":"sha256-x3vixJrH1vVC8GuC63k3F15dl/UngMx8PxZg6fBeJpo="},{"path":"assets/parallax-near-C_i-4R7w.webp","integrity":"sha256-W99+HEPP6nsa9yXEq4dqKTVKK957qZPnrPudiAcvPjc="},{"path":"assets/phaser-BwSGr_Za.js","integrity":"sha256-zZnqpAWjrxz5C223IXA1ErIZMl4BucREWEqsNYBhNA4="},{"path":"assets/rider-B9CrlwQU.png","integrity":"sha256-A28RKwRCd2zoN1JxkVHiF57RsZ1eX4g4kvlBXvRvebU="},{"path":"assets/rider-tucked-BUvF8DOy.png","integrity":"sha256-vOqv7iONiAZjHA34gQb+I/iXWFUkgQ0fOEuefMEXEUE="},{"path":"assets/roof-DBEgMbP5.webp","integrity":"sha256-lKcs5WygOS5Gfz3cZr/CgnqCD9pTEb/xe0y0EcHZtRY="},{"path":"assets/sky-BXF3aV4t.webp","integrity":"sha256-UYqLqAnUdyNghBMawK5jzqR7/H7LtbLXduC696RGIDI="},{"path":"assets/skybound-icon-192.png","integrity":"sha256-ZVB/FYHYp8f+LfPzWUp1Sbnc+CRgoYCMeJ7wKhuJRFA="},{"path":"assets/skybound-icon-512.png","integrity":"sha256-dNXk2xHZvF6ginF4oFKKwlo2jlFLDkdpT1Fh5QAvi8Y="},{"path":"assets/temple-facade-CHUIBQuS.webp","integrity":"sha256-6DTgwyc2adv5bNIr8RnI4MzXqhLqedEbqeCjjR3j7ZU="},{"path":"assets/temple-roof-MCoIfFwC.webp","integrity":"sha256-M8eKGTXZCS95Xk4N0OZ7XGoAQ/g2Tee+Wic3gQXOA5g="},{"path":"assets/title-DBwpOM4L.svg","integrity":"sha256-DyFSfFqpubvNkDqTon5odCbYUJSFbn48bYW/HJ6M4yY="},{"path":"index.html","integrity":"sha256-r88T31AldQDiTw7OLrn4rgHDfbd9A+i48WZwFY9b+Bs="},{"path":"manifest.webmanifest","integrity":"sha256-UFCJs1Hr86Vt45M+BCHkkYSgr+IRJcJ4Iv3bQlay1KY="}]};
/* RUNTIME is generated from the complete production build, including lazy chunks. */
const scope = self.registration.scope;
const prefix = `skybound-offline:${scope}:`;
const cacheName = prefix + RUNTIME.version;
const files = new Map(RUNTIME.files.map(file => [new URL(file.path, scope).href, file.integrity]));
let preparation;

function prepare() {
  if (!preparation) preparation = (async () => {
    const cache = await caches.open(cacheName);
    const missing = [];
    for (const [url, integrity] of files) {
      if (!await cache.match(url)) missing.push(new Request(url, { cache: "reload", integrity }));
    }
    if (missing.length) await cache.addAll(missing);
  })().finally(() => { preparation = undefined; });
  return preparation;
}

self.addEventListener("install", event => {
  event.waitUntil(prepare().then(() => self.skipWaiting()).catch(async error => {
    await caches.delete(cacheName);
    throw error;
  }));
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const previous = (await caches.keys()).filter(key => key.startsWith(prefix) && key !== cacheName);
    await Promise.all(previous.slice(0, -1).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("message", event => {
  if (event.data?.type !== "CACHE_GAME") return;
  event.waitUntil((async () => {
    try {
      if (event.data.id !== "ninjacat") throw new Error("Unknown offline game.");
      await prepare();
      event.ports[0]?.postMessage({ ok: true });
    } catch (error) {
      event.ports[0]?.postMessage({ ok: false, error: String(error) });
    }
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || !url.href.startsWith(scope)) return;
  const clean = new URL(url.pathname, url.origin).href;
  const navigation = request.mode === "navigate" && (clean === scope || clean === scope + "index.html");
  const asset = clean.startsWith(scope + "assets/");
  if (!navigation && !files.has(clean) && !asset) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    // Serve one coherent release until its replacement has fully installed.
    const cached = await cache.match(navigation ? scope + "index.html" : clean);
    if (cached) return cached;
    if (asset) {
      const previous = (await caches.keys()).filter(key => key.startsWith(prefix) && key !== cacheName).reverse();
      for (const name of previous) {
        const old = await (await caches.open(name)).match(clean);
        if (old) return old;
      }
    }
    return fetch(request);
  })());
});
