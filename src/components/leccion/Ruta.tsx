"use client";

import Link from "next/link";
import { useCargado, useProgreso } from "@/lib/progress";
import { S } from "@/lib/sitio";
import { Icon } from "../ui/Icon";

type Item = { id: string; slug: string; titulo: string; orden: number; minutos: number; modulo: string };

/** Desplazamiento horizontal de cada nodo: dibuja el zigzag de la ruta. */
const ZIGZAG = [0, 40, 60, 40, 0, -40, -60, -40];

/**
 * Ruta del recorrido: una unidad por módulo y un nodo por lección.
 * Ninguna lección queda bloqueada (el instructor puede saltar), pero la ruta deja claro cuál sigue.
 */
export function Ruta({ lecciones }: { lecciones: Item[] }) {
  const p = useProgreso();
  const cargado = useCargado();
  const hecha = (id: string) => cargado && !!p.lecciones[id]?.completada;
  const actual = lecciones.find((l) => !hecha(l.id))?.id;
  let n = 0;

  return (
    <div className="mt-8 grid gap-10">
      {S.modulos.map((m, u) => {
        const items = lecciones.filter((l) => l.modulo === m.id);
        const listas = items.filter((l) => hecha(l.id)).length;
        return (
          <section key={m.id} aria-labelledby={`u-${m.id}`}>
            <header className={`rounded-3xl p-5 ${listas === items.length && cargado ? "bg-razon text-white" : "bg-brand text-brand-ink"}`}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">
                {S.rutaUI.unidad} {u + 1} · {listas}/{items.length} {S.rutaUI.terminadas}
              </p>
              <h2 id={`u-${m.id}`} className="mt-1 text-2xl font-semibold">
                {m.titulo}
              </h2>
              <p className="mt-0.5 opacity-90">{m.texto}</p>
            </header>

            <ol className="mt-14 flex flex-col items-center gap-8">
              {items.map((l) => {
                const x = ZIGZAG[n++ % ZIGZAG.length];
                const esActual = l.id === actual;
                const lista = hecha(l.id);
                return (
                  <li key={l.id} className="relative flex flex-col items-center" style={{ transform: `translateX(${x}px)` }}>
                    {esActual && (
                      <span className="flotar absolute -top-11 left-1/2 whitespace-nowrap rounded-xl border-2 border-line bg-surface px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-brand shadow-sm">
                        {lista ? S.rutaUI.repasar : n === 1 ? S.rutaUI.empezar : S.rutaUI.seguir}
                      </span>
                    )}
                    <Link
                      href={`/recorrido/${l.slug}/`}
                      aria-label={`${S.ui.leccion} ${l.orden}: ${l.titulo}${lista ? ` (${S.ui.completada})` : ""}`}
                      className={`grid place-items-center rounded-full border-b-[6px] font-display text-2xl font-semibold transition active:translate-y-1 active:border-b-2 ${
                        esActual
                          ? "anillo h-20 w-20 border-black/25 bg-brand text-brand-ink"
                          : lista
                            ? "h-16 w-16 border-black/20 bg-razon text-white"
                            : "h-16 w-16 border-line bg-surface-2 text-muted hover:text-ink"
                      }`}
                    >
                      {lista ? <Icon name="check" className="h-8 w-8" /> : l.orden}
                    </Link>
                    <p className={`mt-2 max-w-36 text-center text-sm leading-tight ${esActual ? "font-semibold" : "text-muted"}`}>{l.titulo}</p>
                    <p className="text-xs text-muted">
                      ~{l.minutos} {S.ui.minutos}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
