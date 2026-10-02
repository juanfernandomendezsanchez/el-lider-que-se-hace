"use client";

import { ui } from "@/lib/sitio";
import { useState } from "react";

type Datos = {
  presupuestoTitulo: string;
  presupuestoIntro: string;
  gastos: { texto: string; costo: number }[];
  enAutomatico: string;
  libreTitulo: string;
  libreBajo: string;
  libreMedio: string;
  libreAlto: string;
  clasificarTitulo: string;
  sistema1: string;
  sistema2: string;
  items: { texto: string; sistema: 1 | 2; explicacion: string }[];
};

export function Sistema1vs2({ datos }: { datos: Datos }) {
  const [auto, setAuto] = useState<boolean[]>(datos.gastos.map(() => false));
  const [respuestas, setRespuestas] = useState<Record<number, 1 | 2>>({});
  const gastado = datos.gastos.reduce((s, g, i) => s + (auto[i] ? 0 : g.costo), 0);
  const libre = 100 - gastado;
  const mensaje = libre < 40 ? datos.libreBajo : libre < 80 ? datos.libreMedio : datos.libreAlto;

  return (
    <div className="grid gap-8">
      <div>
        <h3 className="text-lg font-semibold">{datos.presupuestoTitulo}</h3>
        <p className="mt-1">{datos.presupuestoIntro}</p>
        <ul className="mt-3 grid gap-2">
          {datos.gastos.map((g, i) => (
            <li key={g.texto}>
              <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-2">
                <span>
                  {g.texto} <span className="text-sm text-muted">(−{g.costo}%)</span>
                </span>
                <span className="flex items-center gap-2 text-sm">
                  {datos.enAutomatico}
                  <input type="checkbox" className="h-5 w-5 accent-[var(--razon)]" checked={auto[i]} onChange={() => setAuto((a) => a.map((x, j) => (j === i ? !x : x)))} />
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <p className="text-sm font-semibold">
            {datos.libreTitulo}: <span className="tabular-nums">{libre}%</span>
          </p>
          <div className="mt-2 flex h-4 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
            <div className="bg-emocion-fill transition-all duration-500" style={{ width: `${gastado}%` }} />
            <div className="bg-razon transition-all duration-500" style={{ width: `${libre}%` }} />
          </div>
          <p className="mt-2" aria-live="polite">
            {mensaje}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">{datos.clasificarTitulo}</h3>
        <ul className="mt-3 grid gap-3">
          {datos.items.map((it, i) => {
            const r = respuestas[i];
            return (
              <li key={it.texto} className="rounded-xl border border-line p-4">
                <p>{it.texto}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {([1, 2] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={r !== undefined}
                      aria-pressed={r === s}
                      onClick={() => setRespuestas((x) => ({ ...x, [i]: s }))}
                      className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
                        r === undefined ? "border-line hover:border-brand" : s === it.sistema ? "border-razon bg-razon-soft text-razon" : r === s ? "border-instinto bg-instinto-soft text-instinto" : "border-line opacity-50"
                      }`}
                    >
                      {s === 1 ? datos.sistema1 : datos.sistema2}
                    </button>
                  ))}
                </div>
                {r !== undefined && (
                  <p className="aparecer mt-2 text-sm" aria-live="polite">
                    <strong>{r === it.sistema ? ui.correcto : ui.incorrecto}.</strong> {it.explicacion}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
