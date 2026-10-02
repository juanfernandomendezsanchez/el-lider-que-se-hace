"use client";

import { useSyncExternalStore } from "react";

/**
 * Progreso del delegado, guardado en localStorage. Si el almacenamiento no está
 * disponible (modo privado, bloqueado), la plataforma sigue funcionando en memoria.
 */
export interface Progreso {
  version: 1;
  lecciones: Record<string, { completada: boolean; fecha: string }>;
  respuestas: Record<string, { aciertos: number; fallos: number; ultima: string }>;
  insignias: string[];
  escenarios: Record<string, { decisiones: { opcion: string; piloto: string }[]; fecha: string }>;
  cerebros: { completado: boolean };
  habito?: { id: string; fecha: string };
  repaso: { ultimoDia?: string };
  diagnostico?: { fecha: string; resultado: string; conteo: Record<string, number>; lider: number };
  gimnasio: { dias: string[] };
  mapa: { fecha: string; puntajes: Record<string, number> }[];
  kit: { checklist: Record<string, boolean>; notas: Record<string, string>; reflexiones: Reflexion[] };
}

export interface Reflexion {
  id: string;
  fecha: string;
  modelo: string;
  respuestas: string[];
}

const CLAVE = "llqsh:v1";

const VACIO: Progreso = {
  version: 1,
  lecciones: {},
  respuestas: {},
  insignias: [],
  escenarios: {},
  cerebros: { completado: false },
  repaso: {},
  gimnasio: { dias: [] },
  mapa: [],
  kit: { checklist: {}, notas: {}, reflexiones: [] },
};

let estado: Progreso = VACIO;
let cargado = false;
let disponible = true;
const oyentes = new Set<() => void>();

/** Fecha local (no UTC), para que "hoy" cambie a medianoche del delegado. */
export const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function leer(): Progreso {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return VACIO;
    const datos = JSON.parse(crudo);
    if (datos?.version !== 1) return VACIO;
    return { ...VACIO, ...datos, kit: { ...VACIO.kit, ...datos.kit }, gimnasio: { ...VACIO.gimnasio, ...datos.gimnasio } };
  } catch {
    disponible = false;
    return VACIO;
  }
}

function guardar() {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(estado));
    disponible = true;
  } catch {
    disponible = false;
  }
}

function asegurarCarga() {
  if (cargado || typeof window === "undefined") return;
  estado = leer();
  cargado = true;
  window.addEventListener("storage", (e) => {
    if (e.key === CLAVE) {
      estado = leer();
      oyentes.forEach((f) => f());
    }
  });
}

function actualizar(cambio: (p: Progreso) => Progreso) {
  asegurarCarga();
  estado = cambio(estado);
  guardar();
  oyentes.forEach((f) => f());
}

function suscribir(f: () => void) {
  asegurarCarga();
  oyentes.add(f);
  return () => oyentes.delete(f);
}

const obtener = () => {
  asegurarCarga();
  return estado;
};

/** Devuelve el progreso; en el servidor (y en el primer render) devuelve un progreso vacío. */
export function useProgreso() {
  return useSyncExternalStore(suscribir, obtener, () => VACIO);
}

/** true cuando ya se leyó el progreso del navegador (evita mostrar "vacío" por un instante). */
export function useCargado() {
  return useSyncExternalStore(
    suscribir,
    () => cargado,
    () => false,
  );
}

export const almacenamientoDisponible = () => disponible;

export const acciones = {
  completarLeccion(id: string) {
    actualizar((p) =>
      p.lecciones[id]?.completada ? p : { ...p, lecciones: { ...p.lecciones, [id]: { completada: true, fecha: hoy() } } },
    );
  },
  registrarRespuesta(preguntaId: string, correcta: boolean) {
    actualizar((p) => {
      const previa = p.respuestas[preguntaId] ?? { aciertos: 0, fallos: 0, ultima: "" };
      return {
        ...p,
        respuestas: {
          ...p.respuestas,
          [preguntaId]: {
            aciertos: previa.aciertos + (correcta ? 1 : 0),
            fallos: previa.fallos + (correcta ? 0 : 1),
            ultima: hoy(),
          },
        },
      };
    });
  },
  registrarEscenario(id: string, decisiones: { opcion: string; piloto: string }[]) {
    actualizar((p) => ({ ...p, escenarios: { ...p.escenarios, [id]: { decisiones, fecha: hoy() } } }));
  },
  completarCerebros() {
    actualizar((p) => (p.cerebros.completado ? p : { ...p, cerebros: { completado: true } }));
  },
  elegirHabito(id: string) {
    actualizar((p) => ({ ...p, habito: { id, fecha: hoy() } }));
  },
  terminarRepasoDelDia() {
    actualizar((p) => ({ ...p, repaso: { ultimoDia: hoy() } }));
  },
  guardarDiagnostico(resultado: string, conteo: Record<string, number>, lider: number) {
    actualizar((p) => ({ ...p, diagnostico: { fecha: hoy(), resultado, conteo, lider } }));
  },
  marcarPractica() {
    actualizar((p) => (p.gimnasio.dias.includes(hoy()) ? p : { ...p, gimnasio: { dias: [...p.gimnasio.dias, hoy()].slice(-120) } }));
  },
  guardarMapa(puntajes: Record<string, number>) {
    actualizar((p) => ({ ...p, mapa: [...p.mapa, { fecha: hoy(), puntajes }].slice(-20) }));
  },
  marcarChecklist(id: string, valor: boolean) {
    actualizar((p) => ({ ...p, kit: { ...p.kit, checklist: { ...p.kit.checklist, [id]: valor } } }));
  },
  guardarNota(id: string, texto: string) {
    actualizar((p) => ({ ...p, kit: { ...p.kit, notas: { ...p.kit.notas, [id]: texto } } }));
  },
  reiniciarChecklist() {
    actualizar((p) => ({ ...p, kit: { ...p.kit, checklist: {} } }));
  },
  guardarReflexion(r: Omit<Reflexion, "id" | "fecha">) {
    actualizar((p) => ({
      ...p,
      kit: { ...p.kit, reflexiones: [{ ...r, id: String(Date.now()), fecha: hoy() }, ...p.kit.reflexiones] },
    }));
  },
  borrarReflexion(id: string) {
    actualizar((p) => ({ ...p, kit: { ...p.kit, reflexiones: p.kit.reflexiones.filter((r) => r.id !== id) } }));
  },
  agregarInsignias(ids: string[]) {
    actualizar((p) => ({ ...p, insignias: [...new Set([...p.insignias, ...ids])] }));
  },
};

/** Días seguidos practicando, contando hasta hoy (o hasta ayer si hoy aún no practica). */
export function calcularRacha(dias: string[]) {
  const set = new Set(dias);
  const d = new Date();
  const fmt = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  if (!set.has(fmt(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(fmt(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
