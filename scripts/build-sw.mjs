// Genera out/sw.js con la lista de todos los archivos del sitio exportado,
// para que la plataforma funcione sin conexión después de la primera visita.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
// Subruta de publicación (GitHub Pages), la misma que usa next.config.ts.
const BASE = process.env.BASE_PATH ?? "";
const archivos = [];

function recorrer(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, e.name);
    // Las carpetas __next.* originales ya tienen su copia plana (ver postbuild.mjs).
    if (e.isDirectory()) {
      if (!e.name.startsWith("__next.")) recorrer(ruta);
      continue;
    }
    if (e.name === "sw.js" || e.name.endsWith(".map")) continue;
    archivos.push(ruta);
  }
}
recorrer(OUT);

const hash = crypto.createHash("sha256");
const urls = archivos
  .map((ruta) => {
    hash.update(fs.readFileSync(ruta));
    const rel = "/" + path.relative(OUT, ruta).split(path.sep).join("/");
    // Las páginas se guardan con la URL con la que se visitan: /cerebros/ y no /cerebros/index.html
    return rel.endsWith("/index.html") ? rel.slice(0, -"index.html".length) : rel;
  })
  .filter((u) => u !== "/404.html")
  .map((u) => BASE + u)
  .sort();

const version = hash.digest("hex").slice(0, 12);

const sw = `// Generado por scripts/build-sw.mjs. No editar a mano.
const VERSION = ${JSON.stringify(version)};
const BASE = ${JSON.stringify(BASE)};
const CACHE = "llqsh-" + VERSION;
const PRECACHE = ${JSON.stringify(urls)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("llqsh-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function conBarra(pathname) {
  return pathname.endsWith("/") || pathname.split("/").pop().includes(".") ? pathname : pathname + "/";
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Páginas: primero la red (contenido fresco); si falla, la copia guardada.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(conBarra(url.pathname), copia));
          }
          return res;
        })
        .catch(() =>
          caches.match(conBarra(url.pathname)).then((r) => r || caches.match(BASE + "/")),
        ),
    );
    return;
  }

  // Recursos (JS, CSS, fuentes, imágenes, datos de navegación): primero la caché.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (r) =>
        r ||
        fetch(req).then((res) => {
          if (res.ok && res.type === "basic") {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return res;
        }),
    ),
  );
});
`;

fs.writeFileSync(path.join(OUT, "sw.js"), sw);
const peso = archivos.reduce((s, r) => s + fs.statSync(r).size, 0);
console.log(`build-sw: ${urls.length} archivos (${(peso / 1024 / 1024).toFixed(1)} MB) en la caché sin conexión, versión ${version}.`);
