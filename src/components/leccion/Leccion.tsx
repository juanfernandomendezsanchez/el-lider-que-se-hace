"use client";

import Link from "next/link";
import { useState } from "react";
import type { Pregunta } from "@/content/schema";
import { acciones, useProgreso } from "@/lib/progress";
import { ui } from "@/lib/sitio";
import { QuizItem } from "../Quiz";
import { Icon } from "../ui/Icon";

/** Repaso final: al responder todas las preguntas, la lección queda completada. */
export function RepasoLeccion({
  leccionId,
  preguntas,
  siguiente,
}: {
  leccionId: string;
  preguntas: Pregunta[];
  siguiente?: { slug: string; titulo: string };
}) {
  const p = useProgreso();
  const [respondidas, setRespondidas] = useState(0);
  const terminada = respondidas >= preguntas.length;
  const yaCompletada = p.lecciones[leccionId]?.completada;

  return (
    <section aria-labelledby="repaso" className="mt-10">
      <h2 id="repaso" className="text-2xl font-semibold">
        {ui.repaso}
      </h2>
      <p className="mt-1 text-muted">{ui.repasoTexto}</p>
      <div className="mt-4 grid gap-3">
        {preguntas.map((q, i) => (
          <QuizItem
            key={q.id}
            pregunta={q}
            numero={i + 1}
            onRespondida={() =>
              setRespondidas((n) => {
                if (n + 1 >= preguntas.length) acciones.completarLeccion(leccionId);
                return n + 1;
              })
            }
          />
        ))}
      </div>
      <div aria-live="polite">
        {(terminada || yaCompletada) && (
          <div className="aparecer mt-6 flex flex-col gap-3 rounded-2xl border border-razon bg-razon-soft p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 font-semibold text-razon">
              <Icon name="check" /> {ui.leccionCompletada}
            </p>
            {siguiente ? (
              <Link href={`/recorrido/${siguiente.slug}/`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 font-semibold text-brand-ink">
                {ui.siguienteLeccion}: {siguiente.titulo} <Icon name="flecha" className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/recorrido/" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 font-semibold text-brand-ink">
                {ui.volverRecorrido}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function EstadoLeccion({ id }: { id: string }) {
  const p = useProgreso();
  if (!p.lecciones[id]?.completada) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-razon-soft px-2 py-0.5 text-xs font-semibold text-razon">
      <Icon name="check" className="h-3.5 w-3.5" /> {ui.completada}
    </span>
  );
}

export function ProgresoRecorrido({ ids }: { ids: string[] }) {
  const p = useProgreso();
  const n = ids.filter((id) => p.lecciones[id]?.completada).length;
  return (
    <div className="mt-6 max-w-md">
      <p className="text-sm text-muted">
        {n} {ui.deLecciones}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={n} aria-label={ui.progreso}>
        <div className="h-full rounded-full bg-razon transition-all" style={{ width: `${(n / ids.length) * 100}%` }} />
      </div>
    </div>
  );
}
