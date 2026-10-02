"use client";

import { ui } from "@/lib/sitio";
import Link from "next/link";
import { useState } from "react";
import type { Antimodelo } from "@/content/schema";

type Datos = { antimodelos: Antimodelo[]; lecciones: Record<string, { slug: string; titulo: string; orden: number }> };

export function FlipAntimodelos({ datos }: { datos: Datos }) {
  const [volteadas, setVolteadas] = useState<Record<string, boolean>>({});
  const voltear = (id: string) => setVolteadas((v) => ({ ...v, [id]: !v[id] }));

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {datos.antimodelos.map((a) => {
        const v = !!volteadas[a.id];
        return (
          <li key={a.id} className="flip" data-volteada={v}>
            <div className="flip-inner relative min-h-48">
              <button
                type="button"
                onClick={() => voltear(a.id)}
                aria-expanded={v}
                aria-label={`${a.nombre}. ${v ? ui.verQueHace : ui.verQueFalta}`}
                className="flip-cara absolute inset-0 flex flex-col justify-between rounded-2xl border border-line bg-surface-2 p-4 text-left"
                tabIndex={v ? -1 : 0}
              >
                <span>
                  <span className="block font-display text-xl font-semibold">{a.nombre}</span>
                  <span className="mt-1 block text-[0.95rem]">{a.queHace}</span>
                </span>
                <span className="text-sm font-semibold text-brand">{ui.voltear}</span>
              </button>
              <div className="flip-cara flip-atras absolute inset-0 flex flex-col justify-between rounded-2xl border border-razon bg-razon-soft p-4" aria-hidden={!v}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-razon">{ui.leFalta}</p>
                  <p className="font-display text-xl font-semibold">{a.habilidadQueFalta}</p>
                  <p className="mt-1 text-sm">
                    {ui.loTrabajasEn}{" "}
                    {a.leccionesRecomendadas.map((id, i) => {
                      const l = datos.lecciones[id];
                      return l ? (
                        <span key={id}>
                          {i > 0 && ", "}
                          <Link href={`/recorrido/${l.slug}/`} tabIndex={v ? 0 : -1} className="underline underline-offset-2">
                            {ui.leccionMin} {l.orden}
                          </Link>
                        </span>
                      ) : null;
                    })}
                  </p>
                </div>
                <button type="button" onClick={() => voltear(a.id)} tabIndex={v ? 0 : -1} className="self-start text-sm font-semibold text-razon">
                  {ui.volver}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
