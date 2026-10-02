"use client";

import { useState } from "react";
import { ui } from "@/lib/sitio";

type Principio = { id: string; nombre: string; porQue: string; enMUN: string };
type Datos = {
  intro: string;
  porQue: string;
  enMUN: string;
  principios: Principio[];
  quizTitulo: string;
  quiz: { frase: string; respuesta: string; explicacion: string }[];
};

export function PrincipiosCialdini({ datos }: { datos: Datos }) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const [resp, setResp] = useState<Record<number, string>>({});
  const nombre = (id: string) => datos.principios.find((p) => p.id === id)?.nombre ?? id;

  return (
    <div className="grid gap-8">
      <div>
        <p>{datos.intro}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {datos.principios.map((p, i) => {
            const on = abierto === p.id;
            return (
              <li key={p.id} className={`rounded-xl border ${on ? "border-brand bg-surface-2" : "border-line"}`}>
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`pr-${p.id}`}
                  onClick={() => setAbierto(on ? null : p.id)}
                  className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left font-semibold"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm text-brand-ink">{i + 1}</span>
                  {p.nombre}
                </button>
                {on && (
                  <div id={`pr-${p.id}`} className="aparecer px-4 pb-4 text-[0.95rem]">
                    <p>
                      <strong>{datos.porQue}:</strong> {p.porQue}
                    </p>
                    <p className="mt-1">
                      <strong>{datos.enMUN}:</strong> {p.enMUN}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold">{datos.quizTitulo}</h3>
        <ul className="mt-3 grid gap-3">
          {datos.quiz.map((q, i) => {
            const r = resp[i];
            return (
              <li key={q.frase} className="rounded-xl border border-line p-4">
                <p className="italic">{q.frase}</p>
                <label className="mt-3 block text-sm font-semibold" htmlFor={`q-${i}`}>
                  {ui.principio}
                </label>
                <select
                  id={`q-${i}`}
                  value={r ?? ""}
                  disabled={r !== undefined}
                  onChange={(e) => setResp((x) => ({ ...x, [i]: e.target.value }))}
                  className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3"
                >
                  <option value="" disabled>
                    {ui.elige}
                  </option>
                  {datos.principios.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                {r !== undefined && (
                  <p className="aparecer mt-2 text-sm" aria-live="polite">
                    <strong className={r === q.respuesta ? "text-razon" : "text-instinto"}>{r === q.respuesta ? ui.correcto : `${ui.incorrecto}: ${nombre(q.respuesta)}`}.</strong> {q.explicacion}
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
