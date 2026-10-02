"use client";

import Link from "next/link";
import { useState } from "react";
import type { Antimodelo } from "@/content/schema";
import { acciones, useCargado, useProgreso } from "@/lib/progress";
import { S, ui } from "@/lib/sitio";
import { Icon } from "./ui/Icon";
import { btnPrimario, btnSecundario, opcion } from "./ui/estilos";

type Datos = {
  bajada: string;
  nota: string;
  empezar: string;
  situacion: string;
  resultadoTitulo: string;
  liderTitulo: string;
  liderTexto: string;
  habilidad: string;
  lecciones: string;
  practica: string;
  repetir: string;
  ultimo: string;
  respuestasLider: string;
  preguntas: { id: string; situacion: string; opciones: { texto: string; antimodelo: string | null }[] }[];
  practicaPorAntimodelo: Record<string, string[]>;
};
type LeccionRef = Record<string, { slug: string; titulo: string; orden: number }>;

/**
 * El antimodelo dominante es el más elegido. Si empatan, gana el que apareció
 * primero en las respuestas. Si casi todo fue de líder, igual se muestra el más frecuente.
 */
function calcular(respuestas: (string | null)[]) {
  const conteo: Record<string, number> = {};
  respuestas.forEach((r) => r && (conteo[r] = (conteo[r] ?? 0) + 1));
  const lider = respuestas.filter((r) => r === null).length;
  const orden = respuestas.filter((r): r is string => !!r);
  const dominante = Object.keys(conteo).sort((a, b) => conteo[b] - conteo[a] || orden.indexOf(a) - orden.indexOf(b))[0] ?? "automatico";
  return { conteo, lider, dominante };
}

function Resultado({ id, lider, total, datos, antimodelos, lecciones }: { id: string; lider: number; total: number; datos: Datos; antimodelos: Antimodelo[]; lecciones: LeccionRef }) {
  const a = antimodelos.find((x) => x.id === id);
  if (!a) return null;
  const mayoriaLider = lider > total / 2;
  return (
    <div className="aparecer grid gap-4">
      <div className="rounded-3xl border-2 border-brand bg-surface p-5 sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-brass">{mayoriaLider ? datos.liderTitulo : datos.resultadoTitulo}</p>
        {mayoriaLider && <p className="mt-1">{datos.liderTexto}</p>}
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{a.nombre}</h2>
        <p className="mt-2 text-lg">{a.frenoAmable}</p>
        <p className="mt-3 text-sm text-muted">
          {lider} / {total} {datos.respuestasLider}
        </p>
      </div>
      <div className="rounded-3xl border border-razon bg-razon-soft p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-razon">{datos.habilidad}</p>
        <p className="font-display text-2xl font-semibold">{a.habilidadQueFalta}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-line bg-surface p-5">
          <p className="font-semibold">{datos.lecciones}</p>
          <ul className="mt-2 grid gap-2">
            {a.leccionesRecomendadas.map((lid) => {
              const l = lecciones[lid];
              return l ? (
                <li key={lid}>
                  <Link href={`/recorrido/${l.slug}/`} className="inline-flex items-center gap-2 text-brand underline underline-offset-2">
                    {ui.leccion} {l.orden}: {l.titulo}
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-5">
          <p className="font-semibold">{datos.practica}</p>
          <ul className="mt-2 grid gap-2">
            {(datos.practicaPorAntimodelo[a.id] ?? []).map((href) => (
              <li key={href}>
                <Link href={href} className="inline-flex items-center gap-2 text-brand underline underline-offset-2">
                  {(S.rutas as Record<string, string>)[href] ?? href}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Diagnostico({ datos, antimodelos, lecciones }: { datos: Datos; antimodelos: Antimodelo[]; lecciones: LeccionRef }) {
  const p = useProgreso();
  const cargado = useCargado();
  const [fase, setFase] = useState<"inicio" | "jugando" | "fin">("inicio");
  const [respuestas, setRespuestas] = useState<(string | null)[]>([]);
  const i = respuestas.length;
  const total = datos.preguntas.length;

  const responder = (r: string | null) => {
    const nuevas = [...respuestas, r];
    setRespuestas(nuevas);
    if (nuevas.length === total) {
      const c = calcular(nuevas);
      acciones.guardarDiagnostico(c.dominante, c.conteo, c.lider);
      setFase("fin");
    }
  };

  if (fase === "inicio") {
    return (
      <div className="grid gap-6">
        <p className="text-lg text-muted">{datos.bajada}</p>
        <p className="rounded-2xl bg-surface-2 p-4 text-sm">{datos.nota}</p>
        <button type="button" className={`${btnPrimario} justify-self-start`} onClick={() => setFase("jugando")}>
          {datos.empezar} <Icon name="flecha" className="h-4 w-4" />
        </button>
        {cargado && p.diagnostico && (
          <section aria-labelledby="ultimo">
            <h2 id="ultimo" className="mb-3 text-2xl font-semibold">
              {datos.ultimo} <span className="text-base font-normal text-muted">({p.diagnostico.fecha})</span>
            </h2>
            <Resultado id={p.diagnostico.resultado} lider={p.diagnostico.lider} total={total} datos={datos} antimodelos={antimodelos} lecciones={lecciones} />
          </section>
        )}
      </div>
    );
  }

  if (fase === "fin") {
    const c = calcular(respuestas);
    return (
      <div className="grid gap-6">
        <Resultado id={c.dominante} lider={c.lider} total={total} datos={datos} antimodelos={antimodelos} lecciones={lecciones} />
        <button
          type="button"
          className={`${btnSecundario} justify-self-start`}
          onClick={() => {
            setRespuestas([]);
            setFase("jugando");
          }}
        >
          {datos.repetir}
        </button>
      </div>
    );
  }

  const q = datos.preguntas[i];
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-brass">
          {datos.situacion} {i + 1} / {total}
        </p>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(i / total) * 100}%` }} />
        </div>
      </div>
      <p key={q.id} className="aparecer mt-3 font-display text-2xl font-semibold">
        {q.situacion}
      </p>
      <div className="mt-4 grid gap-2">
        {q.opciones.map((o) => (
          <button key={o.texto} type="button" className={opcion} onClick={() => responder(o.antimodelo)}>
            {o.texto}
          </button>
        ))}
      </div>
      {i > 0 && (
        <button type="button" className="mt-4 text-sm font-semibold text-muted hover:text-ink" onClick={() => setRespuestas((r) => r.slice(0, -1))}>
          ← {ui.anterior}
        </button>
      )}
    </div>
  );
}
