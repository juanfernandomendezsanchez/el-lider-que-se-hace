import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { Antimodelo, Cerebros, Diagnostico, Escenario, Leccion, LeccionMeta, MapaLider, Pregunta } from "./schema";

const CONTENT = path.join(process.cwd(), "content");
export const MAX_MINUTOS = 8;

/** Valida un archivo de /content y, si algo falla, explica qué archivo y qué campo revisar. */
function validar<T>(schema: z.ZodType<T>, data: unknown, archivo: string): T {
  const r = schema.safeParse(data);
  if (!r.success) {
    throw new Error(`\n\n✖ Error en content/${archivo}\n${z.prettifyError(r.error)}\n`);
  }
  return r.data;
}

function leerJSON<T>(schema: z.ZodType<T>, archivo: string): T {
  const texto = fs.readFileSync(path.join(CONTENT, archivo), "utf8");
  let data: unknown;
  try {
    data = JSON.parse(texto);
  } catch (e) {
    throw new Error(`\n\n✖ content/${archivo} no es JSON válido (¿falta una coma o unas comillas?)\n${(e as Error).message}\n`);
  }
  return validar(schema, data, archivo);
}

const contarPalabras = (s: string) => s.split(/\s+/).filter(Boolean).length;

/**
 * Minutos estimados de una lección: lectura a 180 palabras por minuto,
 * 2 minutos para el elemento interactivo y medio minuto por pregunta de repaso.
 */
function estimarMinutos(meta: LeccionMeta, cuerpo: string, numPreguntas: number) {
  const texto = [
    meta.ideaClave,
    cuerpo,
    ...Object.values(meta.ejemploMUN),
    meta.pruebaloHoy.titulo,
    ...meta.pruebaloHoy.pasos,
  ].join(" ");
  return Math.ceil(contarPalabras(texto) / 180 + 2 + numPreguntas * 0.5);
}

let cacheLecciones: Leccion[] | null = null;

export function getLecciones(): Leccion[] {
  if (cacheLecciones) return cacheLecciones;
  const dir = path.join(CONTENT, "lecciones");
  const preguntas = getPreguntas();
  const lecciones = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      const meta = validar(LeccionMeta, data, `lecciones/${f}`);
      const num = preguntas.filter((p) => p.leccionId === meta.id).length;
      if (num < 2 || num > 3) {
        throw new Error(`\n\n✖ La lección ${meta.id} tiene ${num} preguntas de repaso; deben ser 2 o 3 (content/preguntas/repaso.json)\n`);
      }
      const minutos = estimarMinutos(meta, content, num);
      if (minutos > MAX_MINUTOS) {
        throw new Error(`\n\n✖ La lección "${meta.titulo}" dura ~${minutos} min; el máximo es ${MAX_MINUTOS}. Acorta el texto en content/lecciones/${f}\n`);
      }
      return { ...meta, cuerpo: content, minutos };
    })
    .sort((a, b) => a.orden - b.orden);
  cacheLecciones = lecciones;
  return lecciones;
}

export function getLeccion(slug: string) {
  return getLecciones().find((l) => l.slug === slug);
}

export function getPreguntas() {
  return leerJSON(z.array(Pregunta), "preguntas/repaso.json");
}

export function getAntimodelos() {
  return leerJSON(z.array(Antimodelo), "antimodelos.json");
}

export function getDiagnostico() {
  return leerJSON(Diagnostico, "diagnostico.json");
}

export function validarMapa() {
  return leerJSON(MapaLider, "mapa-lider.json");
}

export function getCerebros() {
  return leerJSON(Cerebros, "cerebros.json");
}

export function getEscenarios(): Escenario[] {
  const dir = path.join(CONTENT, "escenarios");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const e = leerJSON(Escenario, `escenarios/${f}`);
      for (const [id, nodo] of Object.entries(e.nodos)) {
        for (const o of nodo.opciones) {
          if (o.siguiente && !e.nodos[o.siguiente]) {
            throw new Error(`\n\n✖ content/escenarios/${f}: la opción "${o.id}" del nodo "${id}" apunta a "${o.siguiente}", que no existe\n`);
          }
        }
      }
      if (!e.nodos[e.inicio]) throw new Error(`\n\n✖ content/escenarios/${f}: el nodo de inicio "${e.inicio}" no existe\n`);
      return e;
    })
    .sort((a, b) => a.orden - b.orden);
}

/** Datos sin esquema estricto (textos de interfaz y de cada interactivo). */
export function getJSON<T = unknown>(archivo: string): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, archivo), "utf8")) as T;
}
