"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Pregunta } from "@/content/schema";
import { acciones, hoy, rachaGeneral, useCargado, useProgreso, type Progreso } from "@/lib/progress";
import { S, ui } from "@/lib/sitio";
import { QuizItem } from "./Quiz";
import { Icon } from "./ui/Icon";

type LeccionResumen = { id: string; slug: string; titulo: string; orden: number; minutos: number };
const t = S.inicioUI;

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

/** El único paso que importa hoy: la siguiente lección, con racha y avance. */
export function Hoy({ lecciones, habitos }: { lecciones: LeccionResumen[]; habitos: { id: string; habilidad: string; entrenar: string }[] }) {
  const p = useProgreso();
  const cargado = useCargado();
  if (!cargado) return <div className="min-h-64 rounded-[2rem] bg-surface" aria-hidden="true" />;

  const completadas = lecciones.filter((l) => p.lecciones[l.id]?.completada).length;
  const siguiente = lecciones.find((l) => !p.lecciones[l.id]?.completada);
  const racha = rachaGeneral(p);
  const habito = habitos.find((h) => h.id === p.habito?.id);
  const hizoHoy = [...p.actividad, ...p.gimnasio.dias].includes(hoy());

  const titulo = !siguiente ? t.terminasteTitulo : completadas === 0 ? t.empezarTitulo : t.seguirTitulo;
  const href = siguiente ? `/recorrido/${siguiente.slug}/` : "/practica/";
  const boton = !siguiente ? t.terminasteBoton : completadas === 0 ? t.empezarBoton : t.seguirBoton;

  return (
    <section aria-label={ui.progreso} className="overflow-hidden rounded-[2rem] border border-line bg-surface">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brass">{titulo}</p>
          <p
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
              hizoHoy ? "bg-emocion-soft text-emocion" : "bg-surface-2 text-muted"
            }`}
            title={racha ? `${racha} ${racha === 1 ? t.rachaUno : t.racha}` : t.rachaCero}
          >
            <Icon name="fuego" className="h-4 w-4" /> {racha}
            <span className="sr-only">{racha === 1 ? t.rachaUno : t.racha}</span>
          </p>
        </div>

        {siguiente ? (
          <>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              <span className="text-muted">{siguiente.orden}.</span> {siguiente.titulo}
            </h2>
            <p className="mt-2 text-muted">{completadas === 0 ? t.empezarTexto : `~${siguiente.minutos} ${ui.minutos}`}</p>
          </>
        ) : (
          <p className="mt-3 text-lg text-muted">{t.terminasteTexto}</p>
        )}

        <Link
          href={href}
          className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-black/20 bg-brand px-8 text-lg font-bold text-brand-ink transition hover:brightness-110 active:translate-y-px active:border-b-2 sm:w-auto"
        >
          {boton} <Icon name="flecha" className="h-5 w-5" />
        </Link>
      </div>

      <div className="border-t border-line bg-surface-2/60 px-6 py-4 sm:px-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            {completadas}/{lecciones.length} {t.lecciones}
          </span>
          {!racha && <span className="text-muted">{t.rachaCero}</span>}
        </div>
        <div className="mt-2 flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={lecciones.length} aria-valuenow={completadas} aria-label={ui.progreso}>
          {lecciones.map((l) => (
            <span key={l.id} className={`h-2 flex-1 rounded-full ${p.lecciones[l.id]?.completada ? "bg-razon" : "bg-line"}`} />
          ))}
        </div>
        {habito && (
          <p className="mt-3 text-sm">
            <span className="font-semibold text-brass">{S.portada.habitoTitulo}:</span> {habito.habilidad}. <span className="text-muted">{habito.entrenar}</span>
          </p>
        )}
      </div>
    </section>
  );
}

/** Repaso del día: tres preguntas, de una en una. */
export function RepasaHoy({ preguntas }: { preguntas: Pregunta[] }) {
  const p = useProgreso();
  const cargado = useCargado();
  const congeladas = useRef<Pregunta[] | null>(null);
  const [actual, setActual] = useState(0);
  const [respondida, setRespondida] = useState(false);
  const [empezado, setEmpezado] = useState(false);

  if (cargado && congeladas.current === null) congeladas.current = elegirRepaso(p, preguntas);
  const lista = congeladas.current ?? [];
  if (!cargado || lista.length === 0) return null;

  const listo = p.repaso.ultimoDia === hoy() && !empezado;
  const ultima = actual === lista.length - 1;

  return (
    <section aria-labelledby="repasa" className="rounded-[2rem] border border-line bg-surface-2 p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="repasa" className="text-2xl font-semibold">
          {S.portada.repasaHoyTitulo}
        </h2>
        {!listo && (
          <span className="text-sm text-muted">
            {t.repasoPregunta.replace("{n}", String(actual + 1)).replace("{t}", String(lista.length))}
          </span>
        )}
      </div>
      {listo ? (
        <p className="mt-2 flex items-center gap-2 text-muted">
          <Icon name="check" className="h-5 w-5 text-razon" /> {S.portada.repasaHoyListo}
        </p>
      ) : (
        <>
          <p className="mt-1 text-muted">{S.portada.repasaHoyTexto}</p>
          <div className="mt-4">
            <QuizItem
              key={lista[actual].id}
              pregunta={lista[actual]}
              onRespondida={() => {
                setEmpezado(true);
                setRespondida(true);
                if (ultima) acciones.terminarRepasoDelDia();
              }}
            />
          </div>
          {respondida && !ultima && (
            <button
              type="button"
              onClick={() => {
                setActual((n) => n + 1);
                setRespondida(false);
              }}
              className="aparecer mt-4 inline-flex min-h-11 items-center gap-2 rounded-2xl border-b-4 border-black/20 bg-brand px-5 font-bold text-brand-ink"
            >
              {ui.siguiente} <Icon name="flecha" className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </section>
  );
}
