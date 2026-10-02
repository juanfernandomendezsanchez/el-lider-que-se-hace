"use client";

import Link from "next/link";
import { useState } from "react";
import { acciones, useCargado, useProgreso } from "@/lib/progress";
import { ui } from "@/lib/sitio";
import { Icon } from "./ui/Icon";
import { btnPrimario, btnSecundario } from "./ui/estilos";

type Habilidad = { id: string; nombre: string; pregunta: string; ejercicios: { texto: string; href: string }[] };
type Datos = {
  nucleo: string;
  centro: string;
  nucleoTexto: string;
  escala: string[];
  evaluar: string;
  guardar: string;
  guardado: string;
  volverEvaluar: string;
  consejoRepetir: string;
  faltan: string;
  actual: string;
  anterior: string;
  historial: string;
  planTitulo: string;
  planTexto: string;
  sinEvaluacion: string;
  habilidades: Habilidad[];
};

const C = 200; // centro del SVG
const R = 120; // radio máximo

function punto(i: number, total: number, valor: number) {
  const ang = (Math.PI * 2 * i) / total - Math.PI / 2;
  const r = (valor / 5) * R;
  return [C + Math.cos(ang) * r, C + Math.sin(ang) * r] as const;
}

/** Radar de 8 ejes con la seguridad como núcleo. Muestra la evaluación anterior punteada. */
function Radar({ habilidades, actual, anterior, textos }: { habilidades: Habilidad[]; actual?: Record<string, number>; anterior?: Record<string, number>; textos: Datos }) {
  const n = habilidades.length;
  const poligono = (v: Record<string, number>) => habilidades.map((h, i) => punto(i, n, v[h.id] ?? 0).join(",")).join(" ");
  const promedio = actual ? habilidades.reduce((s, h) => s + (actual[h.id] ?? 0), 0) / n : 0;

  return (
    <svg viewBox="-50 -10 500 420" className="mx-auto h-auto w-full max-w-md" role="img" aria-label={`${textos.centro}: ${habilidades.map((h) => `${h.nombre} ${actual?.[h.id] ?? "-"} de 5`).join(", ")}`}>
      {[1, 2, 3, 4, 5].map((nivel) => (
        <polygon key={nivel} points={habilidades.map((_, i) => punto(i, n, nivel).join(",")).join(" ")} fill="none" stroke="var(--line)" strokeWidth={1} />
      ))}
      {habilidades.map((h, i) => {
        const [x, y] = punto(i, n, 5);
        const [lx, ly] = punto(i, n, 6.25);
        const anchor = Math.abs(lx - C) < 10 ? "middle" : lx > C ? "start" : "end";
        const palabras = h.nombre.split(" ");
        return (
          <g key={h.id}>
            <line x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" />
            <text x={lx} y={ly} textAnchor={anchor} fontSize={12} fill="var(--ink)" fontWeight={600}>
              {palabras.length > 1 ? (
                <>
                  <tspan x={lx} dy={-3}>
                    {palabras[0]}
                  </tspan>
                  <tspan x={lx} dy={14}>
                    {palabras.slice(1).join(" ")}
                  </tspan>
                </>
              ) : (
                h.nombre
              )}
            </text>
          </g>
        );
      })}
      {anterior && <polygon points={poligono(anterior)} fill="none" stroke="var(--muted)" strokeWidth={2} strokeDasharray="5 4" />}
      {actual && <polygon points={poligono(actual)} fill="var(--razon)" fillOpacity={0.22} stroke="var(--razon)" strokeWidth={2.5} className="aparecer" />}
      {actual && habilidades.map((h, i) => {
        const [x, y] = punto(i, n, actual[h.id] ?? 0);
        return <circle key={h.id} cx={x} cy={y} r={4} fill="var(--razon)" />;
      })}
      <circle cx={C} cy={C} r={10 + promedio * 5} fill="var(--razon-soft)" stroke="var(--razon)" strokeWidth={2} />
      <text x={C} y={C - 2} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--razon)">
        {textos.nucleo}
      </text>
      <text x={C} y={C + 11} textAnchor="middle" fontSize={9} fill="var(--muted)">
        {textos.centro}
      </text>
    </svg>
  );
}

export function MiMapa({ datos }: { datos: Datos }) {
  const p = useProgreso();
  const cargado = useCargado();
  const ultima = p.mapa[p.mapa.length - 1];
  const previa = p.mapa[p.mapa.length - 2];
  const [evaluando, setEvaluando] = useState(false);
  const [puntajes, setPuntajes] = useState<Record<string, number>>({});
  const completos = datos.habilidades.every((h) => puntajes[h.id]);

  const guardar = () => {
    acciones.guardarMapa(puntajes);
    setEvaluando(false);
  };
  const empezar = () => {
    setPuntajes(ultima?.puntajes ?? {});
    setEvaluando(true);
  };

  if (!cargado) return null;

  if (evaluando || !ultima) {
    return (
      <div className="grid gap-6">
        {!evaluando && !ultima ? (
          <div className="rounded-3xl border border-line bg-surface p-6">
            <Radar habilidades={datos.habilidades} textos={datos} />
            <p className="mt-4 text-center">{datos.sinEvaluacion}</p>
            <div className="mt-4 text-center">
              <button type="button" className={btnPrimario} onClick={empezar}>
                {datos.evaluar}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <ol className="grid gap-3">
                {datos.habilidades.map((h, i) => (
                  <li key={h.id} className="rounded-2xl border border-line bg-surface p-4">
                    <p className="font-display text-lg font-semibold">
                      {i + 1}. {h.nombre}
                    </p>
                    <p className="text-[0.95rem] text-muted" id={`p-${h.id}`}>
                      {h.pregunta}
                    </p>
                    <div className="mt-3 grid grid-cols-5 gap-1.5" role="radiogroup" aria-labelledby={`p-${h.id}`}>
                      {datos.escala.map((etq, j) => (
                        <button
                          key={j}
                          type="button"
                          role="radio"
                          aria-checked={puntajes[h.id] === j + 1}
                          aria-label={`${j + 1}: ${etq}`}
                          onClick={() => setPuntajes((x) => ({ ...x, [h.id]: j + 1 }))}
                          className="flex min-h-14 flex-col items-center justify-center rounded-xl border border-line px-1 text-center aria-checked:border-razon aria-checked:bg-razon-soft"
                        >
                          <span className="text-lg font-semibold">{j + 1}</span>
                          <span className="text-[0.65rem] leading-tight text-muted">{etq}</span>
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="lg:sticky lg:top-20 lg:self-start">
                <div className="rounded-3xl border border-line bg-surface p-4">
                  <Radar habilidades={datos.habilidades} actual={puntajes} anterior={ultima?.puntajes} textos={datos} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={btnPrimario} disabled={!completos} onClick={guardar}>
                {datos.guardar}
              </button>
              {!completos && <p className="text-sm text-muted">{datos.faltan}</p>}
              {ultima && (
                <button type="button" className={btnSecundario} onClick={() => setEvaluando(false)}>
                  ← {ui.anterior}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  const bajas = [...datos.habilidades].sort((a, b) => (ultima.puntajes[a.id] ?? 0) - (ultima.puntajes[b.id] ?? 0)).slice(0, 2);

  return (
    <div className="grid gap-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-line bg-surface p-4">
          <Radar habilidades={datos.habilidades} actual={ultima.puntajes} anterior={previa?.puntajes} textos={datos} />
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-1 w-6 rounded bg-razon" aria-hidden="true" /> {datos.actual} ({ultima.fecha})
            </span>
            {previa && (
              <span className="flex items-center gap-2">
                <span className="h-0 w-6 border-t-2 border-dashed border-muted" aria-hidden="true" /> {datos.anterior} ({previa.fecha})
              </span>
            )}
          </div>
        </div>
        <div className="grid content-start gap-3">
          <p className="rounded-2xl bg-razon-soft p-4">{datos.nucleoTexto}</p>
          <button type="button" className={`${btnSecundario} justify-self-start`} onClick={empezar}>
            {datos.volverEvaluar}
          </button>
          <p className="text-sm text-muted">{datos.consejoRepetir}</p>
          {p.mapa.length > 1 && (
            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-semibold">{datos.historial}</p>
              <ul className="mt-2 grid gap-1 text-sm">
                {datos.habilidades.map((h) => {
                  const a = previa?.puntajes[h.id] ?? 0;
                  const b = ultima.puntajes[h.id] ?? 0;
                  return (
                    <li key={h.id} className="flex justify-between gap-3">
                      <span>{h.nombre}</span>
                      <span className={`tabular-nums ${b > a ? "font-semibold text-razon" : "text-muted"}`}>
                        {a} → {b}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      <section aria-labelledby="plan">
        <h2 id="plan" className="text-3xl font-semibold">
          {datos.planTitulo}
        </h2>
        <p className="mt-1 text-muted">{datos.planTexto}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {bajas.map((h) => (
            <div key={h.id} className="rounded-3xl border border-line bg-surface p-5">
              <p className="font-display text-xl font-semibold">
                {h.nombre} <span className="text-base font-normal text-muted">({ultima.puntajes[h.id]}/5)</span>
              </p>
              <ol className="mt-3 grid gap-2">
                {h.ejercicios.map((e) => (
                  <li key={e.texto}>
                    <Link href={e.href} className="group flex items-start gap-2 rounded-xl p-2 hover:bg-surface-2">
                      <Icon name="flecha" className="mt-1 h-4 w-4 shrink-0 text-brand" />
                      <span>{e.texto}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
