"use client";

import { useState } from "react";
import { S, clasesPiloto, ui, type PilotoNombre } from "@/lib/sitio";

type Datos = { intro: string; items: { texto: string; piloto: PilotoNombre; explicacion: string }[] };

export function TresPilotos({ datos }: { datos: Datos }) {
  const [resp, setResp] = useState<Record<number, PilotoNombre>>({});
  const pilotos = Object.keys(S.pilotos) as PilotoNombre[];
  const aciertos = datos.items.filter((it, i) => resp[i] === it.piloto).length;
  const total = Object.keys(resp).length;

  return (
    <div>
      <p>{datos.intro}</p>
      <ul className="mt-4 grid gap-3">
        {datos.items.map((it, i) => {
          const r = resp[i];
          return (
            <li key={it.texto} className="rounded-xl border border-line p-4">
              <p className="font-medium">{it.texto}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pilotos.map((p) => {
                  const c = clasesPiloto[p];
                  const marcado = r !== undefined && (p === it.piloto || p === r);
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={r !== undefined}
                      aria-pressed={r === p}
                      onClick={() => setResp((x) => ({ ...x, [i]: p }))}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${c.borde} ${marcado ? c.fondo : ""} ${r !== undefined && !marcado ? "opacity-40" : ""}`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${c.punto}`} aria-hidden="true" />
                      <span className={c.texto}>{S.pilotos[p].nombre}</span>
                      {r === p && <span>{p === it.piloto ? "✓" : "✗"}</span>}
                    </button>
                  );
                })}
              </div>
              {r !== undefined && (
                <p className="aparecer mt-2 text-sm" aria-live="polite">
                  <strong>{r === it.piloto ? `${ui.correcto}` : `${ui.era} ${S.pilotos[it.piloto].nombre.toLowerCase()}.`}</strong> {it.explicacion}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {total === datos.items.length && (
        <p className="aparecer mt-4 rounded-xl bg-surface-2 p-4 font-semibold" role="status">
          {aciertos} {ui.aciertosDe} {total}. {aciertos === total ? ui.pilotosTodos : ui.pilotosAlgunos}
        </p>
      )}
    </div>
  );
}
