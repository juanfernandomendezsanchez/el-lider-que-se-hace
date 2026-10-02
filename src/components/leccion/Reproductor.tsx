"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Pregunta } from "@/content/schema";
import { acciones, rachaGeneral, useProgreso } from "@/lib/progress";
import { S } from "@/lib/sitio";
import { Icon } from "../ui/Icon";

const t = S.leccionUI;

export type DatosLeccion = {
  id: string;
  orden: number;
  total: number;
  titulo: string;
  modulo: string;
  ideaClave: string;
  minutos: number;
  interactivoTitulo: string;
  ejemploMUN: { titulo: string; situacion: string; desarrollo: string; leccion: string };
  pruebaloHoy: { titulo: string; pasos: string[] };
};

/** Lo que llega ya renderizado desde el servidor: tarjetas de texto y el interactivo. */
export type Pieza = { tipo: "texto"; nodo: React.ReactNode } | { tipo: "interactivo" };

type Paso =
  | { tipo: "intro" }
  | { tipo: "texto"; nodo: React.ReactNode }
  | { tipo: "interactivo" }
  | { tipo: "ejemplo" }
  | { tipo: "pregunta"; pregunta: Pregunta; repetida: boolean }
  | { tipo: "reto" }
  | { tipo: "fin" };

const claveGuardado = (id: string) => `llqsh:paso:${id}`;

function leerGuardado(id: string) {
  try {
    return Number(localStorage.getItem(claveGuardado(id))) || 0;
  } catch {
    return 0;
  }
}
function escribirGuardado(id: string, paso: number | null) {
  try {
    if (paso === null) localStorage.removeItem(claveGuardado(id));
    else localStorage.setItem(claveGuardado(id), String(paso));
  } catch {
    /* sin almacenamiento: no se puede retomar, pero la lección funciona */
  }
}

/**
 * Lección paso a paso, al estilo de las apps de microaprendizaje:
 * una idea por pantalla, barra de progreso, preguntas de una en una con
 * retroalimentación inmediata, y las falladas vuelven al final para cerrar con un acierto.
 */
export function Reproductor({
  leccion,
  piezas,
  interactivo,
  preguntas,
  siguiente,
}: {
  leccion: DatosLeccion;
  piezas: Pieza[];
  interactivo: React.ReactNode;
  preguntas: Pregunta[];
  siguiente?: { slug: string; titulo: string };
}) {
  const p = useProgreso();

  // Parte fija: intro, texto (con el interactivo en su lugar) y ejemplo.
  const inicio = useMemo<Paso[]>(() => {
    const texto: Paso[] = piezas.map((x) => (x.tipo === "texto" ? { tipo: "texto", nodo: x.nodo } : { tipo: "interactivo" }));
    if (!piezas.some((x) => x.tipo === "interactivo")) texto.push({ tipo: "interactivo" });
    return [{ tipo: "intro" }, ...texto, { tipo: "ejemplo" }];
  }, [piezas]);

  // Cola de preguntas: crece si el delegado falla (la pregunta vuelve una vez al final).
  const [cola, setCola] = useState<{ pregunta: Pregunta; repetida: boolean }[]>(() => preguntas.map((q) => ({ pregunta: q, repetida: false })));
  const pasos = useMemo<Paso[]>(
    () => [...inicio, ...cola.map((c) => ({ tipo: "pregunta" as const, ...c })), { tipo: "reto" }, { tipo: "fin" }],
    [inicio, cola],
  );

  const [i, setI] = useState(0);
  const [guardado, setGuardado] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [elegida, setElegida] = useState<number | null>(null);
  const [comprobada, setComprobada] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [hechos, setHechos] = useState<Record<number, boolean>>({});
  const scroller = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLDivElement>(null);
  const inicioReloj = useRef(0);

  const paso = pasos[i];
  const primeraPregunta = inicio.length;

  useEffect(() => {
    setGuardado(leerGuardado(leccion.id));
    inicioReloj.current = Date.now();
    const previo = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previo;
    };
  }, [leccion.id]);

  // Al cambiar de paso: arriba del todo y foco en el contenido (lectores de pantalla).
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    if (i > 0) titulo.current?.focus({ preventScroll: true });
    if (i > 0 && i < primeraPregunta) escribirGuardado(leccion.id, i);
  }, [i, leccion.id, primeraPregunta]);

  const ir = useCallback((n: number) => {
    setRevelado(false);
    setElegida(null);
    setComprobada(false);
    setI(n);
  }, []);

  const comprobar = useCallback(() => {
    if (paso.tipo !== "pregunta" || elegida === null) return;
    const correcta = paso.pregunta.opciones[elegida].correcta;
    setComprobada(true);
    if (!paso.repetida) {
      acciones.registrarRespuesta(paso.pregunta.id, correcta);
      if (correcta) setAciertos((n) => n + 1);
    }
    if (!correcta && !paso.repetida) setCola((c) => [...c, { pregunta: paso.pregunta, repetida: true }]);
  }, [paso, elegida]);

  const avanzar = useCallback(() => {
    if (paso.tipo === "ejemplo" && !revelado) return setRevelado(true);
    if (paso.tipo === "pregunta" && !comprobada) return comprobar();
    if (paso.tipo === "reto") {
      acciones.completarLeccion(leccion.id);
      escribirGuardado(leccion.id, null);
    }
    if (i < pasos.length - 1) ir(i + 1);
  }, [paso, revelado, comprobada, comprobar, i, pasos.length, ir, leccion.id]);

  const puedeAvanzar = paso.tipo !== "pregunta" || comprobada || elegida !== null;

  // Teclado: Enter avanza; 1-9 elige opción. No interfiere con botones o campos enfocados.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("button, a, input, textarea, select, [contenteditable]")) return;
      if (e.key === "Enter" && puedeAvanzar && paso.tipo !== "fin") {
        e.preventDefault();
        avanzar();
      }
      if (paso.tipo === "pregunta" && !comprobada && /^[1-9]$/.test(e.key)) {
        const n = Number(e.key) - 1;
        if (n < paso.pregunta.opciones.length) setElegida(n);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [avanzar, puedeAvanzar, paso, comprobada]);

  const progreso = paso.tipo === "fin" ? 1 : i / (pasos.length - 1);
  const puedeVolver = i > 1 && i < primeraPregunta;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg" role="dialog" aria-modal="true" aria-label={`${S.ui.leccion} ${leccion.orden}: ${leccion.titulo}`}>
      {/* Barra superior: salir + progreso */}
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pt-3 pb-2 sm:pt-5">
        <Link href="/recorrido/" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink" aria-label={t.salir} title={t.salir}>
          <Icon name="cerrar" className="h-6 w-6" />
        </Link>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={pasos.length}
          aria-valuenow={i + 1}
          aria-valuetext={t.pasoDe.replace("{n}", String(i + 1)).replace("{t}", String(pasos.length))}
        >
          <div className="relative h-full rounded-full bg-razon transition-[width] duration-500 ease-out" style={{ width: `${Math.max(progreso * 100, 4)}%` }}>
            <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" aria-hidden="true" />
          </div>
        </div>
        <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted" aria-hidden="true">
          {Math.min(i + 1, pasos.length)}/{pasos.length}
        </span>
      </div>

      {/* Contenido del paso */}
      <div ref={scroller} className="flex-1 overflow-y-auto overscroll-contain">
        <div key={i} ref={titulo} tabIndex={-1} className="aparecer mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-5 py-8 outline-none" aria-live="polite">
          {paso.tipo === "intro" && <Intro leccion={leccion} pantallas={pasos.length - 1} />}
          {paso.tipo === "texto" && (
            <div>
              <Etiqueta className="text-muted">{leccion.titulo}</Etiqueta>
              <div className="prose-leccion prose-tarjeta mt-4">{paso.nodo}</div>
            </div>
          )}
          {paso.tipo === "interactivo" && (
            <div>
              <Etiqueta>{t.probar}</Etiqueta>
              <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{leccion.interactivoTitulo}</h2>
              <div className="mt-5 rounded-3xl border border-line bg-surface p-4 sm:p-6">{interactivo}</div>
            </div>
          )}
          {paso.tipo === "ejemplo" && <Ejemplo e={leccion.ejemploMUN} revelado={revelado} />}
          {paso.tipo === "pregunta" && (
            <PreguntaPaso
              pregunta={paso.pregunta}
              repetida={paso.repetida}
              elegida={elegida}
              comprobada={comprobada}
              onElegir={(n) => !comprobada && setElegida(n)}
            />
          )}
          {paso.tipo === "reto" && (
            <Reto reto={leccion.pruebaloHoy} hechos={hechos} onMarcar={(n) => setHechos((h) => ({ ...h, [n]: !h[n] }))} />
          )}
          {paso.tipo === "fin" && (
            <Fin
              orden={leccion.orden}
              aciertos={aciertos}
              total={preguntas.length}
              racha={rachaGeneral(p)}
              minutos={Math.max(1, Math.round((Date.now() - inicioReloj.current) / 60000))}
            />
          )}
        </div>
      </div>

      {/* Barra inferior: acción principal y, en las preguntas, la retroalimentación */}
      <Pie
        paso={paso}
        elegida={elegida}
        comprobada={comprobada}
        revelado={revelado}
        puedeAvanzar={puedeAvanzar}
        onAvanzar={avanzar}
        onVolver={puedeVolver ? () => ir(i - 1) : undefined}
        retomar={paso.tipo === "intro" && guardado > 1 && guardado < primeraPregunta ? () => ir(guardado) : undefined}
        siguiente={siguiente}
      />
    </div>
  );
}

function Etiqueta({ children, className = "text-brass" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.14em] ${className}`}>{children}</p>;
}

function Intro({ leccion, pantallas }: { leccion: DatosLeccion; pantallas: number }) {
  return (
    <div className="text-center">
      <Etiqueta>
        {S.ui.leccion} {leccion.orden} {S.ui.de} {leccion.total} · {leccion.modulo}
      </Etiqueta>
      <h1 className="mx-auto mt-3 max-w-xl text-4xl font-semibold sm:text-5xl">{leccion.titulo}</h1>
      <div className="mx-auto mt-8 max-w-lg rounded-3xl border-2 border-brand/30 bg-surface p-6 text-left">
        <Etiqueta className="text-muted">{S.ui.ideaClave}</Etiqueta>
        <p className="mt-2 font-display text-xl leading-snug sm:text-2xl">{leccion.ideaClave}</p>
      </div>
      <p className="mt-6 flex items-center justify-center gap-4 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="reloj" className="h-4 w-4" /> ~{leccion.minutos} {S.ui.minutos}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {pantallas} {pantallas === 1 ? "pantalla" : "pantallas"}
        </span>
      </p>
    </div>
  );
}

function Ejemplo({ e, revelado }: { e: DatosLeccion["ejemploMUN"]; revelado: boolean }) {
  return (
    <div>
      <Etiqueta>{S.ui.ejemplo}</Etiqueta>
      <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{e.titulo}</h2>
      <div className="mt-5 rounded-3xl rounded-tl-md bg-surface-2 p-5 text-lg">{e.situacion}</div>
      {revelado && (
        <div className="aparecer mt-4 space-y-4">
          <p className="text-lg leading-relaxed">{e.desarrollo}</p>
          <p className="flex gap-3 rounded-2xl border-l-4 border-razon bg-razon-soft p-4 font-semibold">
            <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-razon" />
            <span>{e.leccion}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function PreguntaPaso({
  pregunta,
  repetida,
  elegida,
  comprobada,
  onElegir,
}: {
  pregunta: Pregunta;
  repetida: boolean;
  elegida: number | null;
  comprobada: boolean;
  onElegir: (n: number) => void;
}) {
  return (
    <div>
      <Etiqueta className={repetida ? "text-emocion" : "text-brass"}>{repetida ? t.repetida : t.pregunta}</Etiqueta>
      <h2 id="enunciado" className="mt-2 text-2xl font-semibold leading-snug sm:text-3xl">
        {pregunta.enunciado}
      </h2>
      <div className="mt-6 grid gap-3" role="radiogroup" aria-labelledby="enunciado">
        {pregunta.opciones.map((o, n) => {
          const marcada = elegida === n;
          const estado = !comprobada ? (marcada ? "marcada" : "neutra") : o.correcta ? "correcta" : marcada ? "incorrecta" : "apagada";
          const clases = {
            neutra: "border-line bg-surface hover:border-brand/60 hover:bg-surface-2",
            marcada: "border-brand bg-brand/10 ring-2 ring-brand/30",
            correcta: "border-razon bg-razon-soft",
            incorrecta: "border-instinto bg-instinto-soft",
            apagada: "border-line bg-surface opacity-50",
          }[estado];
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={marcada}
              disabled={comprobada}
              onClick={() => onElegir(n)}
              className={`flex min-h-14 w-full items-center gap-4 rounded-2xl border-2 border-b-4 px-4 py-3 text-left text-lg transition-colors active:translate-y-px ${clases}`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 text-sm font-bold ${
                  estado === "marcada" ? "border-brand text-brand" : "border-line text-muted"
                }`}
                aria-hidden="true"
              >
                {estado === "correcta" ? <Icon name="check" className="h-4 w-4 text-razon" /> : estado === "incorrecta" ? <Icon name="cerrar" className="h-4 w-4 text-instinto" /> : n + 1}
              </span>
              <span>{o.texto}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Reto({ reto, hechos, onMarcar }: { reto: DatosLeccion["pruebaloHoy"]; hechos: Record<number, boolean>; onMarcar: (n: number) => void }) {
  return (
    <div>
      <Etiqueta className="text-razon">{t.reto}</Etiqueta>
      <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{reto.titulo}</h2>
      <ul className="mt-5 grid gap-3">
        {reto.pasos.map((texto, n) => (
          <li key={n}>
            <button
              type="button"
              role="checkbox"
              aria-checked={!!hechos[n]}
              onClick={() => onMarcar(n)}
              className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                hechos[n] ? "border-razon bg-razon-soft" : "border-dashed border-line bg-surface hover:border-razon"
              }`}
            >
              <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${hechos[n] ? "border-razon bg-razon text-white" : "border-line"}`}>
                {hechos[n] && <Icon name="check" className="h-4 w-4" />}
              </span>
              <span className={hechos[n] ? "text-muted line-through decoration-razon/50" : ""}>{texto}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">{t.retoNota}</p>
    </div>
  );
}

function Fin({ orden, aciertos, total, racha, minutos }: { orden: number; aciertos: number; total: number; racha: number; minutos: number }) {
  const frase = t.felicitacion[orden % t.felicitacion.length];
  const stats = [
    { titulo: t.aciertos, valor: `${Math.round((aciertos / Math.max(total, 1)) * 100)}%`, icono: "check", color: "text-razon border-razon" },
    { titulo: t.racha, valor: `${racha} ${racha === 1 ? t.dia : t.dias}`, icono: "fuego", color: "text-emocion border-emocion-fill" },
    { titulo: t.minutos, valor: String(minutos), icono: "reloj", color: "text-brand border-brand" },
  ];
  return (
    <div className="text-center">
      <div className="relative mx-auto grid h-28 w-28 place-items-center">
        {["bg-instinto", "bg-emocion-fill", "bg-razon", "bg-brass", "bg-brand", "bg-razon"].map((c, n) => (
          <span key={n} className={`chispa absolute h-2.5 w-2.5 rounded-full ${c}`} style={{ "--a": `${n * 60}deg` } as React.CSSProperties} aria-hidden="true" />
        ))}
        <span className="pop grid h-24 w-24 place-items-center rounded-full bg-brass text-white shadow-lg">
          <Icon name="insignia" className="h-12 w-12" />
        </span>
      </div>
      <h1 className="mt-6 text-4xl font-semibold sm:text-5xl">{frase}</h1>
      <ul className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-3">
        {stats.map((s) => (
          <li key={s.titulo} className={`overflow-hidden rounded-2xl border-2 ${s.color}`}>
            <p className="px-2 py-1 text-xs font-bold uppercase tracking-wide">{s.titulo}</p>
            <p className="flex items-center justify-center gap-1 bg-surface px-2 py-3 font-display text-xl font-semibold text-ink">
              <Icon name={s.icono} className="h-5 w-5" /> {s.valor}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pie({
  paso,
  elegida,
  comprobada,
  revelado,
  puedeAvanzar,
  onAvanzar,
  onVolver,
  retomar,
  siguiente,
}: {
  paso: Paso;
  elegida: number | null;
  comprobada: boolean;
  revelado: boolean;
  puedeAvanzar: boolean;
  onAvanzar: () => void;
  onVolver?: () => void;
  retomar?: () => void;
  siguiente?: { slug: string; titulo: string };
}) {
  const boton = "inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border-b-4 px-6 py-3 text-lg font-bold transition active:translate-y-px active:border-b-2 disabled:cursor-not-allowed sm:w-auto sm:min-w-48";
  const primario = `${boton} border-black/20 bg-brand text-brand-ink hover:brightness-110 disabled:border-transparent disabled:bg-surface-2 disabled:text-muted`;

  if (paso.tipo === "fin") {
    return (
      <div className="border-t border-line bg-bg">
        <div className="mx-auto flex max-w-2xl flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:justify-between">
          <Link href="/recorrido/" className={`${boton} border-line bg-surface text-ink`}>
            {t.ruta}
          </Link>
          {siguiente && (
            <Link href={`/recorrido/${siguiente.slug}/`} className={primario}>
              {t.siguiente} <Icon name="flecha" className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  const opcion = paso.tipo === "pregunta" && comprobada && elegida !== null ? paso.pregunta.opciones[elegida] : null;
  const correcta = paso.tipo === "pregunta" ? paso.pregunta.opciones.find((o) => o.correcta) : undefined;
  const fondo = opcion ? (opcion.correcta ? "bg-razon-soft border-razon/40" : "bg-instinto-soft border-instinto/40") : "bg-bg border-line";

  const texto =
    paso.tipo === "intro"
      ? t.empezar
      : paso.tipo === "ejemplo" && !revelado
        ? t.verQuePaso
        : paso.tipo === "pregunta" && !comprobada
          ? t.comprobar
          : paso.tipo === "reto"
            ? t.terminar
            : t.continuar;

  const colorBoton = opcion ? (opcion.correcta ? "bg-razon text-white" : "bg-instinto text-white") : "";

  return (
    <div className={`border-t-2 transition-colors ${fondo}`}>
      <div className="mx-auto max-w-2xl px-4 py-4">
        {opcion && (
          <div className="aparecer mb-4 flex gap-3" role="status">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface ${opcion.correcta ? "text-razon" : "text-instinto"}`}>
              <Icon name={opcion.correcta ? "check" : "cerrar"} className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className={`font-display text-xl font-semibold ${opcion.correcta ? "text-razon" : "text-instinto"}`}>
                {opcion.correcta ? S.ui.correcto : S.ui.incorrecto}
              </p>
              <p className="mt-0.5">{opcion.explicacion}</p>
              {!opcion.correcta && correcta && (
                <p className="mt-1 text-sm">
                  <strong>{t.respuestaCorrecta}:</strong> {correcta.texto}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {onVolver ? (
            <button type="button" onClick={onVolver} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 font-semibold text-muted hover:bg-surface-2 hover:text-ink">
              <Icon name="flechaIzq" className="h-4 w-4" /> {S.ui.anterior}
            </button>
          ) : retomar ? (
            <button type="button" onClick={retomar} className={`${boton} border-line bg-surface text-ink`}>
              {t.seguirDonde}
            </button>
          ) : (
            <span className="hidden text-xs text-muted sm:block">{t.teclado}</span>
          )}
          <button type="button" onClick={onAvanzar} disabled={!puedeAvanzar} className={`${primario} ${colorBoton}`}>
            {texto}
          </button>
        </div>
      </div>
    </div>
  );
}
