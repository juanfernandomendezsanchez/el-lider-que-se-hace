"use client";

import Link from "next/link";
import { useState } from "react";
import { ui } from "@/lib/sitio";
import { Icon } from "../ui/Icon";

export type DatosPausa = {
  titulo: string;
  bajada: string;
  caminoRojo: { titulo: string; pasos: string[]; resultado: string };
  caminoVerde: { titulo: string; previos: string[]; resultado: string };
  pasos: { letra: string; nombre: string; accion: string; pregunta: string }[];
};

export function CaminoPausa({ datos }: { datos: DatosPausa }) {
  const [camino, setCamino] = useState<"rojo" | "verde">("rojo");
  const [paso, setPaso] = useState(0);

  return (
    <div>
      <div className="flex gap-2" role="tablist" aria-label={ui.caminos}>
        <button
          type="button"
          role="tab"
          aria-selected={camino === "rojo"}
          onClick={() => setCamino("rojo")}
          className="min-h-11 flex-1 rounded-full border-2 border-instinto px-3 text-sm font-semibold text-instinto aria-selected:bg-instinto-soft"
        >
          {datos.caminoRojo.titulo}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={camino === "verde"}
          onClick={() => setCamino("verde")}
          className="min-h-11 flex-1 rounded-full border-2 border-razon px-3 text-sm font-semibold text-razon aria-selected:bg-razon-soft"
        >
          {datos.caminoVerde.titulo}
        </button>
      </div>

      {camino === "rojo" ? (
        <div className="aparecer mt-5" role="tabpanel">
          <ol className="flex flex-wrap items-center gap-2">
            {datos.caminoRojo.pasos.map((p, i) => (
              <li key={p} className="flex items-center gap-2">
                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${i >= 2 ? "bg-instinto-soft text-instinto" : i === 1 ? "bg-emocion-soft text-emocion" : "bg-surface-2"}`}>{p}</span>
                {i < datos.caminoRojo.pasos.length - 1 && <Icon name="flecha" className="h-4 w-4 text-muted" />}
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-xl bg-instinto-soft p-4 font-semibold">{datos.caminoRojo.resultado}</p>
        </div>
      ) : (
        <div className="aparecer mt-5" role="tabpanel">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            {datos.caminoVerde.previos.map((p, i) => (
              <li key={p} className="flex items-center gap-2">
                <span className={`rounded-full px-4 py-2 font-semibold ${i === 1 ? "bg-emocion-soft text-emocion" : "bg-surface-2"}`}>{p}</span>
                <Icon name="flecha" className="h-4 w-4 text-muted" />
              </li>
            ))}
            <li className="font-semibold text-razon">PAUSA</li>
          </ol>
          <div className="mt-4 flex gap-1.5" role="group" aria-label={ui.pasosPausa}>
            {datos.pasos.map((p, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={paso === i}
                aria-label={p.nombre}
                onClick={() => setPaso(i)}
                className="grid h-14 flex-1 place-items-center rounded-xl border-2 border-razon font-display text-2xl font-bold text-razon aria-pressed:bg-razon aria-pressed:text-white dark:aria-pressed:text-[#10141c]"
              >
                {p.letra}
              </button>
            ))}
          </div>
          <div key={paso} className="aparecer mt-3 rounded-xl border border-razon bg-razon-soft p-4" aria-live="polite">
            <p className="font-display text-xl font-semibold">{datos.pasos[paso].nombre}</p>
            <p>{datos.pasos[paso].accion}</p>
            <p className="mt-2 text-sm">
              <strong>{ui.preguntaClave}:</strong> {datos.pasos[paso].pregunta}
            </p>
          </div>
          <p className="mt-4 rounded-xl bg-surface-2 p-4 font-semibold">{datos.caminoVerde.resultado}</p>
          <p className="mt-3 text-sm">
            <Link href="/cerebros/" className="font-semibold text-brand underline underline-offset-2">
              {ui.verCerebros}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
