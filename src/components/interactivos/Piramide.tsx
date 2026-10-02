"use client";

import { ui } from "@/lib/sitio";
import { useMemo, useState } from "react";
import { btnSecundario } from "../ui/estilos";

type Datos = { intro: string; niveles: { texto: string; explicacion: string }[]; error: string; completo: string };

/** Orden mezclado pero fijo (evita diferencias entre servidor y navegador). */
const MEZCLA = [3, 0, 5, 2, 4, 1];

export function Piramide({ datos }: { datos: Datos }) {
  const [colocados, setColocados] = useState<number[]>([]);
  const [error, setError] = useState<number | null>(null);
  const disponibles = useMemo(() => MEZCLA.filter((i) => i < datos.niveles.length && !colocados.includes(i)), [colocados, datos.niveles.length]);
  const completo = colocados.length === datos.niveles.length;

  const elegir = (i: number) => {
    if (i === colocados.length) {
      setColocados((c) => [...c, i]);
      setError(null);
    } else setError(i);
  };

  return (
    <div>
      <p>{datos.intro}</p>

      <div className="mt-5 flex flex-col-reverse items-center gap-1.5" aria-label={ui.piramideAria}>
        {datos.niveles.map((n, i) => {
          const puesto = colocados.includes(i);
          const ancho = 100 - i * 12;
          return (
            <div
              key={n.texto}
              style={{ width: `${ancho}%` }}
              className={`flex min-h-12 items-center justify-center rounded-lg px-3 py-2 text-center text-sm transition-all ${
                puesto ? (i === 0 ? "aparecer bg-razon font-semibold text-white dark:text-[#10141c]" : "aparecer bg-brand font-semibold text-brand-ink") : "border-2 border-dashed border-line text-muted"
              }`}
            >
              {puesto ? n.texto : `${ui.piso} ${i + 1}`}
            </div>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-4 min-h-12">
        {colocados.length > 0 && !completo && error === null && (
          <p className="rounded-xl bg-surface-2 p-3 text-sm">
            <strong>{datos.niveles[colocados.length - 1].texto}:</strong> {datos.niveles[colocados.length - 1].explicacion}
          </p>
        )}
        {error !== null && <p className="rounded-xl bg-emocion-soft p-3 text-sm">{datos.error}</p>}
        {completo && <p className="rounded-xl bg-razon-soft p-3 font-semibold">{datos.completo}</p>}
      </div>

      {!completo ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {disponibles.map((i) => (
            <button key={i} type="button" onClick={() => elegir(i)} className="min-h-11 rounded-full border border-line bg-surface px-4 text-sm font-semibold hover:border-brand">
              {datos.niveles[i].texto}
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className={`${btnSecundario} mt-3`} onClick={() => setColocados([])}>
          {ui.armarDeNuevo}
        </button>
      )}
    </div>
  );
}
