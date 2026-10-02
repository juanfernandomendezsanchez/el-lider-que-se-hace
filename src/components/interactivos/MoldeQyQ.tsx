"use client";

import { useState } from "react";
import { ui } from "@/lib/sitio";
import { btnSecundario, opcion } from "../ui/estilos";

type Datos = {
  pregunta: string;
  intro: string;
  partes: { nombre: string; ayuda: string; opciones: { texto: string; correcta: boolean; explicacion: string }[] }[];
  resultadoTitulo: string;
  resultadoTexto: string;
};

export function MoldeQyQ({ datos }: { datos: Datos }) {
  const [elegidas, setElegidas] = useState<(number | null)[]>(datos.partes.map(() => null));
  const completas = datos.partes.every((p, i) => elegidas[i] !== null && p.opciones[elegidas[i]!].correcta);

  return (
    <div>
      <p className="rounded-xl bg-surface-2 p-4 font-semibold">{datos.pregunta}</p>
      <p className="mt-3">{datos.intro}</p>
      <ol className="mt-4 grid gap-5">
        {datos.partes.map((p, i) => {
          const e = elegidas[i];
          const acerto = e !== null && p.opciones[e].correcta;
          return (
            <li key={p.nombre}>
              <p>
                <span className="font-display text-xl font-semibold">{p.nombre}</span> <span className="text-muted">{p.ayuda}</span>
              </p>
              <div className="mt-2 grid gap-2">
                {p.opciones.map((o, j) => (
                  <button
                    key={o.texto}
                    type="button"
                    disabled={acerto}
                    onClick={() => setElegidas((x) => x.map((v, k) => (k === i ? j : v)))}
                    className={`${opcion} ${e === j ? (o.correcta ? "!border-razon !bg-razon-soft" : "!border-instinto !bg-instinto-soft") : ""}`}
                  >
                    {o.texto}
                  </button>
                ))}
              </div>
              {e !== null && (
                <p className="aparecer mt-2 text-sm" aria-live="polite">
                  <strong>{p.opciones[e].correcta ? ui.correcto : `${ui.incorrecto}, ${ui.pruebaOtra}`}.</strong> {p.opciones[e].explicacion}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {completas && (
        <div className="aparecer mt-6 rounded-2xl border border-razon bg-razon-soft p-5" role="status">
          <p className="text-sm font-semibold uppercase tracking-wide text-razon">{datos.resultadoTitulo}</p>
          <p className="mt-2 font-display text-lg leading-snug">{datos.partes.map((p, i) => p.opciones[elegidas[i]!].texto.replace(/[«»]/g, "")).join(" ")}</p>
          <p className="mt-2 text-sm">{datos.resultadoTexto}</p>
          <button type="button" className={`${btnSecundario} mt-3`} onClick={() => setElegidas(datos.partes.map(() => null))}>
            {ui.reiniciar}
          </button>
        </div>
      )}
    </div>
  );
}
