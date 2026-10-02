"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { Pregunta } from "@/content/schema";
import { acciones, hoy, useCargado, useProgreso, type Progreso } from "@/lib/progress";
import { S, ui } from "@/lib/sitio";
import { QuizItem } from "./Quiz";
import { Icon } from "./ui/Icon";

type LeccionResumen = { id: string; slug: string; titulo: string; orden: number };

/**
 * Repaso espaciado ligero: elige 3 preguntas de lecciones completadas,
 * priorizando las falladas y las que llevan más tiempo sin verse.
 */
function elegirRepaso(p: Progreso, preguntas: Pregunta[]) {
  const vistas = preguntas.filter((q) => p.lecciones[q.leccionId]?.completada);
  return [...vistas]
    .sort((a, b) => {
      const ra = p.respuestas[a.id];
      const rb = p.respuestas[b.id];
      const pa = (ra?.fallos ?? 0) - (ra?.aciertos ?? 0);
      const pb = (rb?.fallos ?? 0) - (rb?.aciertos ?? 0);
      if (pa !== pb) return pb - pa;
      return (ra?.ultima ?? "").localeCompare(rb?.ultima ?? "");
    })
    .slice(0, 3);
}

export function RepasaHoy({ preguntas }: { preguntas: Pregunta[] }) {
  const p = useProgreso();
  const cargado = useCargado();
  const congeladas = useRef<Pregunta[] | null>(null);
  const [respondidas, setRespondidas] = useState(0);

  if (cargado && congeladas.current === null) congeladas.current = elegirRepaso(p, preguntas);
  const lista = congeladas.current ?? [];
  if (!cargado || lista.length === 0) return null;

  const listo = p.repaso.ultimoDia === hoy() && respondidas === 0;

  return (
    <section aria-labelledby="repasa" className="rounded-3xl border border-line bg-surface-2 p-5 sm:p-7">
      <h2 id="repasa" className="text-2xl font-semibold">
        {S.portada.repasaHoyTitulo}
      </h2>
      {listo ? (
        <p className="mt-2 text-muted">{S.portada.repasaHoyListo}</p>
      ) : (
        <>
          <p className="mt-1 text-muted">{S.portada.repasaHoyTexto}</p>
          <div className="mt-4 grid gap-3">
            {lista.map((q, i) => (
              <QuizItem
                key={q.id}
                pregunta={q}
                numero={i + 1}
                onRespondida={() =>
                  setRespondidas((n) => {
                    if (n + 1 === lista.length) acciones.terminarRepasoDelDia();
                    return n + 1;
                  })
                }
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function Continuar({ lecciones, habitos }: { lecciones: LeccionResumen[]; habitos: { id: string; habilidad: string; entrenar: string }[] }) {
  const p = useProgreso();
  const cargado = useCargado();
  const completadas = lecciones.filter((l) => p.lecciones[l.id]?.completada).length;
  const siguiente = useMemo(() => lecciones.find((l) => !p.lecciones[l.id]?.completada), [lecciones, p]);
  const habito = habitos.find((h) => h.id === p.habito?.id);
  if (!cargado || completadas === 0) return null;

  return (
    <section className="grid gap-4 sm:grid-cols-2" aria-label={ui.progreso}>
      <div className="rounded-3xl border border-line bg-surface p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-brass">{S.portada.continuarTitulo}</p>
        <p className="mt-1 text-muted">
          {completadas} {ui.deLecciones}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={12} aria-valuenow={completadas} aria-label={ui.progreso}>
          <div className="h-full rounded-full bg-razon" style={{ width: `${(completadas / lecciones.length) * 100}%` }} />
        </div>
        {siguiente && (
          <Link href={`/recorrido/${siguiente.slug}/`} className="mt-4 inline-flex items-center gap-2 font-semibold text-brand hover:underline">
            {ui.leccion} {siguiente.orden}: {siguiente.titulo} <Icon name="flecha" className="h-4 w-4" />
          </Link>
        )}
      </div>
      {habito && (
        <div className="rounded-3xl border border-line bg-surface p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-brass">{S.portada.habitoTitulo}</p>
          <p className="mt-1 font-display text-xl font-semibold">{habito.habilidad}</p>
          <p className="mt-1 text-muted">{habito.entrenar}</p>
        </div>
      )}
    </section>
  );
}

export function BloqueDiagnostico({ nombres }: { nombres: Record<string, string> }) {
  const p = useProgreso();
  const cargado = useCargado();
  const t = S.portada.diagnostico;
  const res = cargado && p.diagnostico ? nombres[p.diagnostico.resultado] : null;
  return (
    <Link href="/diagnostico/" className="group flex h-full flex-col justify-between rounded-3xl border border-line bg-surface p-5 hover:border-brand">
      <span>
        <span className="block font-display text-2xl font-semibold">{t.titulo}</span>
        <span className="mt-1 block text-muted">{res ? `${t.resultado}: ${res}` : t.texto}</span>
      </span>
      <span className="mt-4 inline-flex items-center gap-2 font-semibold text-brand">
        {t.boton} <Icon name="flecha" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
