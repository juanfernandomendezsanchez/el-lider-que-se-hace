import sitio from "@content/sitio.json";

/** Textos de interfaz. Viven en content/sitio.json. */
export const S = sitio;
export const ui = sitio.ui;

export type Insignia = (typeof sitio.insignias)[number];
export type PilotoNombre = keyof typeof sitio.pilotos;

export const clasesPiloto = {
  instinto: { texto: "text-instinto", fondo: "bg-instinto-soft", borde: "border-instinto", punto: "bg-instinto" },
  emocion: { texto: "text-emocion", fondo: "bg-emocion-soft", borde: "border-emocion", punto: "bg-emocion-fill" },
  razon: { texto: "text-razon", fondo: "bg-razon-soft", borde: "border-razon", punto: "bg-razon" },
} as const;
