"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { S, clasesPiloto, ui, type PilotoNombre } from "@/lib/sitio";
import type { DatosPausa } from "./interactivos/CaminoPausa";
import { Icon } from "./ui/Icon";
import { btnPrimario } from "./ui/estilos";

type Diapositiva = {
  tipo: "titulo" | "barra" | "lista" | "comparar" | "piramide" | "pilotos" | "cerebros" | "pausa";
  antetitulo?: string;
  titulo: string;
  texto?: string;
  valor?: number;
  items?: string[];
  izquierda?: { titulo: string; items: string[] };
  derecha?: { titulo: string; items: string[] };
  notas: string;
};
type Datos = {
  bajada: string;
  empezar: string;
  atajos: { tecla: string; accion: string }[];
  notas: string;
  salir: string;
  diapositiva: string;
  abrirCerebros: string;
  diapositivas: Diapositiva[];
};

function Contenido({ d, pausa, abrirCerebros }: { d: Diapositiva; pausa: DatosPausa; abrirCerebros: string }) {
  switch (d.tipo) {
    case "barra":
      return (
        <div className="mx-auto mt-10 w-full max-w-4xl">
          <div className="flex h-20 overflow-hidden rounded-2xl text-2xl font-semibold">
            <div className="flex items-center justify-center bg-brand text-brand-ink" style={{ width: `${d.valor}%` }}>
              ~{d.valor}%
            </div>
            <div className="flex flex-1 items-center justify-center bg-razon-soft text-razon">~{100 - (d.valor ?? 0)}%</div>
          </div>
          {d.texto && <p className="mt-6 text-center text-2xl text-muted">{d.texto}</p>}
        </div>
      );
    case "lista":
      return (
        <ul className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {d.items?.map((x) => (
            <li key={x} className="rounded-2xl border border-line bg-surface p-5 text-center font-display text-2xl font-semibold">
              {x}
            </li>
          ))}
        </ul>
      );
    case "comparar":
      return (
        <div className="mx-auto mt-10 grid w-full max-w-5xl gap-6 md:grid-cols-2">
          {[d.izquierda, d.derecha].map((lado, i) => (
            <div key={i} className={`rounded-3xl border-2 p-8 ${i === 0 ? "border-line bg-surface-2" : "border-razon bg-razon-soft"}`}>
              <p className={`font-display text-4xl font-semibold ${i === 1 ? "text-razon" : ""}`}>{lado?.titulo}</p>
              <ul className="mt-4 grid gap-2 text-2xl">
                {lado?.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    case "piramide":
      return (
        <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col-reverse items-center gap-2">
          {d.items?.map((x, i) => (
            <div key={x} style={{ width: `${100 - i * 12}%` }} className={`rounded-xl py-3 text-center text-xl font-semibold ${i === 0 ? "bg-razon text-white dark:text-[#10141c]" : "bg-brand text-brand-ink"}`}>
              {x}
            </div>
          ))}
        </div>
      );
    case "pilotos":
      return (
        <ul className="mx-auto mt-10 grid w-full max-w-5xl gap-6 md:grid-cols-3">
          {(Object.keys(S.pilotos) as PilotoNombre[]).map((p) => (
            <li key={p} className={`rounded-3xl border-2 p-8 ${clasesPiloto[p].borde} ${clasesPiloto[p].fondo}`}>
              <p className={`font-display text-4xl font-semibold ${clasesPiloto[p].texto}`}>{S.pilotos[p].nombre}</p>
              <p className="mt-3 text-2xl">{S.pilotos[p].texto}</p>
            </li>
          ))}
        </ul>
      );
    case "cerebros":
      return (
        <div className="mt-10 text-center">
          {d.texto && <p className="mx-auto max-w-3xl text-2xl text-muted">{d.texto}</p>}
          <Link href="/cerebros/" className={`${btnPrimario} mt-8 !min-h-14 !px-8 !text-xl`}>
            {abrirCerebros} <Icon name="flecha" />
          </Link>
        </div>
      );
    case "pausa":
      return (
        <ol className="mx-auto mt-10 grid w-full max-w-6xl gap-4 md:grid-cols-5">
          {pausa.pasos.map((p, i) => (
            <li key={i} className="rounded-3xl border-2 border-razon bg-razon-soft p-6 text-center">
              <p className="font-display text-6xl font-bold text-razon">{p.letra}</p>
              <p className="mt-2 text-2xl font-semibold">{p.nombre}</p>
              <p className="mt-2 text-lg">{p.pregunta}</p>
            </li>
          ))}
        </ol>
      );
    default:
      return d.texto ? <p className="mx-auto mt-8 max-w-4xl text-center text-3xl text-muted">{d.texto}</p> : null;
  }
}

export function Instructor({ datos, pausa }: { datos: Datos; pausa: DatosPausa }) {
  const [activo, setActivo] = useState(false);
  const [i, setI] = useState(0);
  const [notas, setNotas] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const total = datos.diapositivas.length;
  const d = datos.diapositivas[i];

  const ir = useCallback((n: number) => setI(Math.max(0, Math.min(total - 1, n))), [total]);
  const pantallaCompleta = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await caja.current?.requestFullscreen();
    } catch {
      /* el navegador no lo permite; seguimos en ventana */
    }
  };
  const salir = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    setActivo(false);
  }, []);

  useEffect(() => {
    if (!activo) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") (e.preventDefault(), ir(i + 1));
      else if (e.key === "ArrowLeft" || e.key === "PageUp") (e.preventDefault(), ir(i - 1));
      else if (e.key.toLowerCase() === "n") setNotas((x) => !x);
      else if (e.key.toLowerCase() === "f") pantallaCompleta();
      else if (e.key === "Escape" && !document.fullscreenElement) salir();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [activo, i, ir, salir]);

  if (!activo) {
    return (
      <div className="grid gap-6">
        <p className="text-lg text-muted">{datos.bajada}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {datos.atajos.map((a) => (
            <li key={a.tecla} className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2">
              <kbd className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-sm">{a.tecla}</kbd>
              <span>{a.accion}</span>
            </li>
          ))}
        </ul>
        <ol className="grid gap-1 text-muted">
          {datos.diapositivas.map((x, n) => (
            <li key={n}>
              {n + 1}. {x.antetitulo ? `${x.antetitulo}: ` : ""}
              {x.titulo}
            </li>
          ))}
        </ol>
        <button
          type="button"
          className={`${btnPrimario} justify-self-start`}
          onClick={() => {
            setActivo(true);
            setTimeout(pantallaCompleta, 50);
          }}
        >
          {datos.empezar} <Icon name="expandir" className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={caja} className="fixed inset-0 z-50 flex flex-col overflow-auto bg-bg" role="region" aria-roledescription="presentación" aria-label={d.titulo}>
      <div className="flex items-center justify-between px-6 py-3 text-sm text-muted">
        <span>
          {datos.diapositiva} {i + 1} / {total}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setNotas((x) => !x)} className="rounded-full px-3 py-1.5 hover:bg-surface-2" aria-pressed={notas}>
            N · {datos.notas}
          </button>
          <button type="button" onClick={salir} className="rounded-full px-3 py-1.5 hover:bg-surface-2">
            {datos.salir}
          </button>
        </div>
      </div>
      <div key={i} className="aparecer flex flex-1 flex-col justify-center px-6 py-6 sm:px-16" aria-live="polite">
        {d.antetitulo && <p className="text-center text-lg font-semibold uppercase tracking-[0.15em] text-brass sm:text-xl">{d.antetitulo}</p>}
        <h2 className="mt-3 text-center text-5xl font-semibold sm:text-7xl">{d.titulo}</h2>
        <Contenido d={d} pausa={pausa} abrirCerebros={datos.abrirCerebros} />
      </div>
      {notas && (
        <aside className="border-t border-line bg-surface-2 px-6 py-4 text-lg sm:px-16" aria-label={datos.notas}>
          <p className="text-sm font-semibold uppercase tracking-wide text-brass">{datos.notas}</p>
          <p className="mt-1">{d.notas}</p>
        </aside>
      )}
      <div className="flex items-center justify-between gap-3 px-6 pb-4">
        <button type="button" onClick={() => ir(i - 1)} disabled={i === 0} className="grid h-12 w-12 place-items-center rounded-full border border-line disabled:opacity-30" aria-label={ui.anterior}>
          <Icon name="flechaIzq" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${((i + 1) / total) * 100}%` }} />
        </div>
        <button type="button" onClick={() => ir(i + 1)} disabled={i === total - 1} className="grid h-12 w-12 place-items-center rounded-full border border-line disabled:opacity-30" aria-label={ui.siguiente}>
          <Icon name="flecha" />
        </button>
      </div>
    </div>
  );
}
