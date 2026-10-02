// Ajustes al sitio exportado en /out, después de `next build`.
//
// Next 16 escribe los segmentos de precarga como carpetas anidadas
// (`__next.cerebros/__PAGE__.txt`), pero el navegador los pide con puntos
// (`__next.cerebros.__PAGE__.txt`). Sin estas copias, un hosting estático
// responde 404 y la navegación pierde la precarga.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
let copias = 0;

function aplanar(dir, prefijo, destino) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, e.name);
    const nombre = `${prefijo}.${e.name}`;
    if (e.isDirectory()) aplanar(ruta, nombre, destino);
    else {
      fs.copyFileSync(ruta, path.join(destino, nombre));
      copias++;
    }
  }
}

function recorrer(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const ruta = path.join(dir, e.name);
    if (e.name.startsWith("__next.")) aplanar(ruta, e.name, dir);
    else recorrer(ruta);
  }
}

recorrer(OUT);
console.log(`postbuild: ${copias} archivos de precarga copiados con nombre plano.`);
