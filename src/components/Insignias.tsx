"use client";

import { useEffect, useRef, useState } from "react";
import { acciones, almacenamientoDisponible, calcularRacha, useCargado, useProgreso, type Progreso } from "@/lib/progress";
import { S, ui, type Insignia } from "@/lib/sitio";
import { Icon } from "./ui/Icon";

export type Catalogo = { id: string; modulo: string }[];
export type ExtraInsignias = { checklistIds: string[] };

function ganadas(p: Progreso, catalogo: Catalogo, extra: ExtraInsignias): string[] {
  return S.insignias
    .filter((i) => {
      const r = i.regla as { tipo: string; valor?: string | number };
      if (r.tipo === "modulo") {
        const ids = catalogo.filter((l) => l.modulo === r.valor).map((l) => l.id);
        return ids.length > 0 && ids.every((id) => p.lecciones[id]?.completada);
      }
      if (r.tipo === "cerebros") return p.cerebros.completado;
      if (r.tipo === "escenarios") return Object.keys(p.escenarios).length >= Number(r.valor);
      if (r.tipo === "racha") return calcularRacha(p.gimnasio.dias) >= Number(r.valor);
      if (r.tipo === "mapa") return p.mapa.length > 0;
      if (r.tipo === "checklist") return extra.checklistIds.length > 0 && extra.checklistIds.every((id) => p.kit.checklist[id]);
      return false;
    })
    .map((i) => i.id);
}

/** Observa el progreso, otorga insignias nuevas y las anuncia con un aviso accesible. */
export function InsigniasWatcher({ catalogo, extra }: { catalogo: Catalogo; extra: ExtraInsignias }) {
  const p = useProgreso();
  const cargado = useCargado();
  const [aviso, setAviso] = useState<Insignia | null>(null);
  const [sinAlmacen, setSinAlmacen] = useState(false);

  useEffect(() => {
    if (!cargado) return;
    setSinAlmacen(!almacenamientoDisponible());
    const nuevas = ganadas(p, catalogo, extra).filter((id) => !p.insignias.includes(id));
    if (nuevas.length) {
      acciones.agregarInsignias(nuevas);
      setAviso(S.insignias.find((i) => i.id === nuevas[0]) ?? null);
    }
  }, [p, cargado, catalogo, extra]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(t);
  }, [aviso]);

  return (
    <>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 md:bottom-6">
        {aviso && (
          <div className="aparecer pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lg">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-brand-ink">
              <Icon name="insignia" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brass">{ui.nuevaInsignia}</p>
              <p className="font-display text-lg font-semibold">{aviso.titulo}</p>
              <p className="text-sm text-muted">{aviso.texto}</p>
            </div>
            <button type="button" onClick={() => setAviso(null)} className="ml-1 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2" aria-label={ui.cerrar}>
              <Icon name="cerrar" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {sinAlmacen && (
        <p role="status" className="bg-emocion-soft px-4 py-2 text-center text-sm text-ink">
          {ui.sinAlmacenamiento}
        </p>
      )}
    </>
  );
}

export function ListaInsignias() {
  const p = useProgreso();
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {S.insignias.map((i) => {
          const tiene = p.insignias.includes(i.id);
          return (
            <li key={i.id} className={`flex items-start gap-3 rounded-xl border p-3 ${tiene ? "border-brass bg-surface" : "border-dashed border-line opacity-70"}`}>
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tiene ? "bg-brand text-brand-ink" : "bg-surface-2 text-muted"}`}>
                <Icon name={tiene ? "insignia" : "candado"} className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">{i.titulo}</p>
                <p className="mt-0.5 text-xs text-muted">{tiene ? i.texto : i.pendiente}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-sm text-muted">{S.insigniasNota}</p>
    </div>
  );
}
