"use client";

import { acciones, useProgreso } from "@/lib/progress";
import { Icon } from "../ui/Icon";

type Datos = {
  intro: string;
  automatico: string;
  entrenar: string;
  elegir: string;
  elegido: string;
  elegidoTexto: string;
  habitos: { id: string; habilidad: string; automatico: string; entrenar: string }[];
};

export function HabitoSemana({ datos }: { datos: Datos }) {
  const p = useProgreso();
  const actual = p.habito?.id;

  return (
    <div>
      <p>{datos.intro}</p>
      <ul className="mt-4 grid gap-3">
        {datos.habitos.map((h) => {
          const on = actual === h.id;
          return (
            <li key={h.id} className={`rounded-xl border p-4 ${on ? "border-razon bg-razon-soft" : "border-line"}`}>
              <p className="font-display text-lg font-semibold">{h.habilidad}</p>
              <dl className="mt-1 grid gap-1 text-[0.95rem] sm:grid-cols-2 sm:gap-4">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{datos.automatico}</dt>
                  <dd>{h.automatico}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{datos.entrenar}</dt>
                  <dd>{h.entrenar}</dd>
                </div>
              </dl>
              {on ? (
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-razon" role="status">
                  <Icon name="check" className="h-4 w-4" /> {datos.elegido}. {datos.elegidoTexto}
                </p>
              ) : (
                <button type="button" onClick={() => acciones.elegirHabito(h.id)} className="mt-3 min-h-10 rounded-full border border-line px-4 text-sm font-semibold hover:border-brand">
                  {datos.elegir}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
