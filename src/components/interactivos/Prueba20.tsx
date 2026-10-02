"use client";

import { ui } from "@/lib/sitio";
import { useEffect, useState } from "react";
import { btnPrimario, btnSecundario, opcion } from "../ui/estilos";

type Datos = {
  intro: string;
  rondas: { situacion: string; opciones: { texto: string; lider: boolean }[] }[];
  boton: string;
  tiempo: string;
  resultados: Record<"protagonista" | "mixto" | "lider", { titulo: string; texto: string }>;
};

export function Prueba20({ datos }: { datos: Datos }) {
  const [elecciones, setElecciones] = useState<boolean[]>([]);
  const [minuto, setMinuto] = useState<number | null>(null);
  const ronda = datos.rondas[elecciones.length];
  const listo = elecciones.length === datos.rondas.length;

  useEffect(() => {
    if (minuto === null || minuto >= 20) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setMinuto(reducido ? 20 : minuto + 1), 90);
    return () => clearTimeout(t);
  }, [minuto]);

  const lideres = elecciones.filter(Boolean).length;
  const tipo = lideres === datos.rondas.length ? "lider" : lideres === 0 ? "protagonista" : "mixto";
  const resultado = datos.resultados[tipo];

  return (
    <div>
      <p>{datos.intro}</p>
      <ol className="mt-4 flex gap-2" aria-label={ui.rondas}>
        {datos.rondas.map((_, i) => (
          <li key={i} className={`h-1.5 flex-1 rounded-full ${i < elecciones.length ? "bg-brand" : "bg-surface-2"}`} />
        ))}
      </ol>

      {ronda && (
        <div key={elecciones.length} className="aparecer mt-4">
          <p className="font-semibold">{ronda.situacion}</p>
          <div className="mt-3 grid gap-2">
            {ronda.opciones.map((o) => (
              <button key={o.texto} type="button" className={opcion} onClick={() => setElecciones((e) => [...e, o.lider])}>
                {o.texto}
              </button>
            ))}
          </div>
        </div>
      )}

      {listo && minuto === null && (
        <button type="button" className={`${btnPrimario} mt-5`} onClick={() => setMinuto(0)}>
          {datos.boton}
        </button>
      )}

      {minuto !== null && (
        <div className="mt-5" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="w-24 text-sm font-semibold tabular-nums">
              {datos.tiempo} {minuto}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(minuto / 20) * 100}%` }} />
            </div>
          </div>
          {minuto >= 20 && (
            <div className={`aparecer mt-4 rounded-2xl border p-5 ${tipo === "lider" ? "border-razon bg-razon-soft" : tipo === "mixto" ? "border-line bg-surface-2" : "border-line bg-surface-2"}`}>
              <p className="font-display text-2xl font-semibold">{resultado.titulo}</p>
              <p className="mt-1">{resultado.texto}</p>
              <button
                type="button"
                className={`${btnSecundario} mt-4`}
                onClick={() => {
                  setElecciones([]);
                  setMinuto(null);
                }}
              >
                {ui.probarOtraVez}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
