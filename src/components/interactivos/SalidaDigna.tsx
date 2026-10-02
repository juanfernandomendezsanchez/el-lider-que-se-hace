"use client";

import { useState } from "react";
import { ui } from "@/lib/sitio";
import { opcion } from "../ui/estilos";

type Datos = {
  situacion: string;
  pregunta: string;
  opciones: { texto: string; correcta: boolean; resultado: string; explicacion: string }[];
  clavesTitulo: string;
  claves: { nombre: string; texto: string; ejemplo: string }[];
};

export function SalidaDigna({ datos }: { datos: Datos }) {
  const [elegida, setElegida] = useState<number | null>(null);
  const o = elegida !== null ? datos.opciones[elegida] : null;

  return (
    <div className="grid gap-8">
      <div>
        <p className="rounded-xl bg-surface-2 p-4">{datos.situacion}</p>
        <p className="mt-3 font-semibold">{datos.pregunta}</p>
        <div className="mt-2 grid gap-2">
          {datos.opciones.map((op, i) => (
            <button
              key={op.texto}
              type="button"
              onClick={() => setElegida(i)}
              aria-pressed={elegida === i}
              className={`${opcion} ${elegida === i ? (op.correcta ? "!border-razon !bg-razon-soft" : "!border-instinto !bg-instinto-soft") : ""}`}
            >
              {op.texto}
            </button>
          ))}
        </div>
        {o && (
          <div className="aparecer mt-3 rounded-xl border border-line p-4" aria-live="polite">
            <p>
              <strong>{ui.queOcurre}:</strong> {o.resultado}
            </p>
            <p className="mt-1 text-sm">
              <strong className={o.correcta ? "text-razon" : "text-instinto"}>{o.correcta ? ui.correcto : ui.incorrecto}.</strong> {o.explicacion}
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold">{datos.clavesTitulo}</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {datos.claves.map((c) => (
            <li key={c.nombre} className="rounded-xl border border-line p-4">
              <p className="font-semibold">{c.nombre}</p>
              <p className="text-sm text-muted">{c.texto}</p>
              <p className="mt-1 text-sm italic">{c.ejemplo}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
