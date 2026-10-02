import { z } from "zod";

/** Rojo = instinto, ámbar = emoción, verde = razón. El significado es fijo en toda la plataforma. */
export const Piloto = z.enum(["instinto", "emocion", "razon"]);
export type Piloto = z.infer<typeof Piloto>;

export const Habilidad = z.enum([
  "comunicacion",
  "escucha",
  "conocimiento",
  "experiencia",
  "persuasion",
  "influencia",
  "empatia",
  "proposito",
  "seguridad",
  "dominio",
]);
export type Habilidad = z.infer<typeof Habilidad>;

export const AntimodeloId = z.enum([
  "el-que-mas-habla",
  "explosivo",
  "congelado",
  "aficionado",
  "veleta",
  "dueno-del-documento",
  "cazador-de-premios",
  "automatico",
]);
export type AntimodeloId = z.infer<typeof AntimodeloId>;

export const InteractivoId = z.enum([
  "heredado-vs-entrenado",
  "flip-antimodelos",
  "prueba-20",
  "piramide",
  "sistema1vs2",
  "tres-pilotos",
  "reencuadre",
  "molde-qyq",
  "principios-cialdini",
  "salida-digna",
  "habito-semana",
  "camino-pausa",
]);
export type InteractivoId = z.infer<typeof InteractivoId>;

/* ---------- Lecciones (frontmatter de cada .mdx) ---------- */

export const LeccionMeta = z.object({
  id: z.string(),
  orden: z.number().int().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "solo minúsculas, números y guiones"),
  titulo: z.string(),
  modulo: z.string(),
  ideaClave: z.string(),
  interactivo: InteractivoId,
  interactivoTitulo: z.string(),
  habilidades: z.array(Habilidad),
  antimodelos: z.array(AntimodeloId).optional(),
  ejemploMUN: z.object({
    titulo: z.string(),
    situacion: z.string(),
    desarrollo: z.string(),
    leccion: z.string(),
  }),
  pruebaloHoy: z.object({
    titulo: z.string(),
    pasos: z.array(z.string()).min(1),
  }),
});
export type LeccionMeta = z.infer<typeof LeccionMeta>;
export type Leccion = LeccionMeta & { cuerpo: string; minutos: number };

/* ---------- Preguntas de repaso ---------- */

export const Pregunta = z.object({
  id: z.string(),
  leccionId: z.string(),
  enunciado: z.string(),
  opciones: z
    .array(z.object({ texto: z.string(), correcta: z.boolean(), explicacion: z.string() }))
    .min(2)
    .refine((o) => o.filter((x) => x.correcta).length === 1, "cada pregunta necesita exactamente una opción correcta"),
});
export type Pregunta = z.infer<typeof Pregunta>;

/* ---------- Antimodelos ---------- */

export const Antimodelo = z.object({
  id: AntimodeloId,
  nombre: z.string(),
  queHace: z.string(),
  frenoAmable: z.string(),
  habilidadQueFalta: z.string(),
  habilidades: z.array(Habilidad),
  leccionesRecomendadas: z.array(z.string()),
});
export type Antimodelo = z.infer<typeof Antimodelo>;

/* ---------- Escenarios del simulador ---------- */

export const OpcionEscenario = z.object({
  id: z.string(),
  texto: z.string(),
  piloto: Piloto,
  consecuencia: z.string(),
  explicacion: z.string(),
  siguiente: z.string().optional(),
});

export const Escenario = z.object({
  id: z.string(),
  slug: z.string(),
  orden: z.number(),
  titulo: z.string(),
  resumen: z.string(),
  contexto: z.string(),
  temporizadorSeg: z.number().optional(),
  siSeAcabaElTiempo: z.object({ consecuencia: z.string(), explicacion: z.string() }),
  inicio: z.string(),
  nodos: z.record(z.string(), z.object({ situacion: z.string(), opciones: z.array(OpcionEscenario).min(2).max(4) })),
  respuestaModelo: z.array(z.object({ paso: z.string(), accion: z.string() })).length(5),
});
export type Escenario = z.infer<typeof Escenario>;
export type OpcionEscenario = z.infer<typeof OpcionEscenario>;

/* ---------- Los dos cerebros ---------- */

export const CerebroNodo = z.object({
  id: z.string(),
  etiqueta: z.string(),
  tipo: z.enum(["instinto", "emocion", "razon", "neutro", "nucleo", "salida"]),
  x: z.number(),
  y: z.number(),
  funcion: z.string(),
  enLider: z.string(),
  enNoLider: z.string(),
});

export const Cerebros = z.object({
  titulo: z.string(),
  intro: z.string(),
  leyenda: z.array(z.object({ piloto: Piloto, nombre: z.string(), texto: z.string() })),
  nodos: z.array(CerebroNodo),
  aristas: z.array(z.tuple([z.string(), z.string()])),
  cruzadas: z.array(z.object({ id: z.string(), de: z.string(), a: z.string(), etiqueta: z.string() })),
  pasos: z.array(
    z.object({
      camino: z.enum(["no-lider", "lider"]),
      activos: z.array(z.string()),
      aristas: z.array(z.tuple([z.string(), z.string()])),
      cruzadas: z.array(z.string()).default([]),
      titulo: z.string(),
      texto: z.string(),
      seguridad: z.boolean().default(false),
    }),
  ),
  resultados: z.object({ "no-lider": z.string(), lider: z.string() }),
  escenarios: z.array(
    z.object({
      id: z.string(),
      titulo: z.string(),
      noLider: z.string(),
      lider: z.string(),
      porNodo: z.record(z.string(), z.string()),
    }),
  ),
  saberMas: z.array(z.string()),
});
export type Cerebros = z.infer<typeof Cerebros>;

/* ---------- Diagnóstico ---------- */

export const Diagnostico = z.object({
  titulo: z.string(),
  bajada: z.string(),
  nota: z.string(),
  empezar: z.string(),
  situacion: z.string(),
  resultadoTitulo: z.string(),
  liderTitulo: z.string(),
  liderTexto: z.string(),
  habilidad: z.string(),
  lecciones: z.string(),
  practica: z.string(),
  repetir: z.string(),
  ultimo: z.string(),
  respuestasLider: z.string(),
  preguntas: z
    .array(
      z.object({
        id: z.string(),
        situacion: z.string(),
        opciones: z.array(z.object({ texto: z.string(), antimodelo: AntimodeloId.nullable() })).length(4, "cada situación necesita 4 opciones"),
      }),
    )
    .length(10, "el diagnóstico necesita 10 situaciones"),
  practicaPorAntimodelo: z.record(AntimodeloId, z.array(z.string())),
});

/* ---------- Mi mapa de líder ---------- */

export const MapaLider = z.object({
  habilidades: z
    .array(
      z.object({
        id: z.string(),
        nombre: z.string(),
        pregunta: z.string(),
        ejercicios: z.array(z.object({ texto: z.string(), href: z.string() })).length(3, "cada habilidad necesita 3 ejercicios"),
      }),
    )
    .length(8, "el mapa necesita 8 habilidades"),
}).passthrough();
