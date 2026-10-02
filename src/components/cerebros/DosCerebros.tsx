"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Cerebros } from "@/content/schema";
import { acciones } from "@/lib/progress";
import { clasesPiloto, ui } from "@/lib/sitio";
import { Icon } from "../ui/Icon";
import { btnPrimario, btnSecundario } from "../ui/estilos";

type Nodo = Cerebros["nodos"][number];
type Paso = Cerebros["pasos"][number];
type Camino = "no-lider" | "lider";
type Textos = { noLider: string; lider: string; paso: string; escenario: string; proyeccion: string; salirProyeccion: string; tocaNodo: string; funcion: string; enLider: string; enNoLider: string; resultado: string; respuesta: string; reiniciar: string; saberMas: string };

const COLOR: Record<Nodo["tipo"], string> = {
  instinto: "var(--instinto)",
  emocion: "var(--emocion-fill)",
  razon: "var(--razon)",
  neutro: "var(--neutro)",
  nucleo: "var(--razon)",
  salida: "var(--brand)",
};

const clave = (a: string, b: string) => `${a}>${b}`;

function anchoPastilla(n: Nodo) {
  return Math.max(64, n.etiqueta.length * 7.6 + 22);
}

/** Una red: mismos nodos y aristas siempre; el paso decide qué se enciende. */
function Red({
  datos,
  camino,
  paso,
  pasoPrevio,
  atenuada,
  onNodo,
  titulo,
}: {
  datos: Cerebros;
  camino: Camino;
  paso: Paso | null;
  pasoPrevio: Paso | null;
  atenuada: boolean;
  onNodo: (n: Nodo) => void;
  titulo: string;
}) {
  const nodos = Object.fromEntries(datos.nodos.map((n) => [n.id, n]));
  const activos = new Set(paso?.activos ?? []);
  const aristasActivas = new Set((paso?.aristas ?? []).map(([a, b]) => clave(a, b)));
  const previas = new Set((pasoPrevio?.aristas ?? []).map(([a, b]) => clave(a, b)));
  const cruzadas = datos.cruzadas.filter((c) => paso?.cruzadas?.includes(c.id));
  const colorCamino = camino === "lider" ? "var(--razon)" : "var(--instinto)";

  return (
    <svg viewBox="0 0 420 470" className={`h-auto w-full transition-opacity duration-500 ${atenuada ? "opacity-35" : ""}`} role="group" aria-label={titulo}>
      <defs>
        <filter id={`brillo-${camino}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {datos.aristas.map(([a, b]) => {
        const A = nodos[a];
        const B = nodos[b];
        const on = aristasActivas.has(clave(a, b));
        const nueva = on && !previas.has(clave(a, b));
        return (
          <g key={clave(a, b)}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--line)" strokeWidth={2} />
            {on && (
              <line
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke={a === "orgullo" || b === "instinto" || (camino === "no-lider" && b === "voz") ? "var(--instinto)" : colorCamino}
                strokeWidth={4}
                strokeLinecap="round"
                pathLength={1}
                className={nueva ? "senal" : undefined}
              />
            )}
          </g>
        );
      })}

      {cruzadas.map((c) => {
        const A = nodos[c.de];
        const B = nodos[c.a];
        const mx = (A.x + B.x) / 2;
        const my = (A.y + B.y) / 2;
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const len = Math.hypot(dx, dy) || 1;
        const cx = mx + (-dy / len) * 40;
        const cy = my + (dx / len) * 40;
        const lx = (mx + cx) / 2;
        const ly = (my + cy) / 2;
        const ancho = Math.min(200, c.etiqueta.length * 5.6 + 14);
        return (
          <g key={c.id} className="aparecer">
            <path d={`M${A.x},${A.y} Q${cx},${cy} ${B.x},${B.y}`} fill="none" stroke="var(--brass)" strokeWidth={2} strokeDasharray="5 5" />
            <rect x={Math.min(Math.max(lx - ancho / 2, 2), 418 - ancho)} y={ly - 11} width={ancho} height={22} rx={11} fill="var(--surface)" stroke="var(--brass)" />
            <text x={Math.min(Math.max(lx, ancho / 2 + 2), 418 - ancho / 2)} y={ly + 4} textAnchor="middle" fontSize={10.5} fill="var(--ink)">
              {c.etiqueta}
            </text>
          </g>
        );
      })}

      {datos.nodos.map((n) => {
        const on = activos.has(n.id);
        const color = COLOR[n.tipo];
        const seguridadOn = n.id === "seguridad" && paso?.seguridad;
        if (n.tipo === "nucleo") {
          return (
            <g key={n.id} role="button" tabIndex={0} aria-label={`${n.etiqueta}: ${n.funcion}`} onClick={() => onNodo(n)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onNodo(n))} className="cursor-pointer focus:outline-none">
              <circle cx={n.x} cy={n.y} r={38} fill={seguridadOn ? "var(--razon-soft)" : "var(--surface)"} stroke={seguridadOn ? color : "var(--line)"} strokeWidth={seguridadOn ? 4 : 2} filter={seguridadOn ? `url(#brillo-${camino})` : undefined} className={seguridadOn ? "latido" : undefined} />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={seguridadOn ? "var(--razon)" : "var(--muted)"}>
                {n.etiqueta}
              </text>
            </g>
          );
        }
        const w = anchoPastilla(n);
        return (
          <g
            key={n.id}
            role="button"
            tabIndex={0}
            aria-label={`${n.etiqueta}: ${n.funcion}${on ? " (activo)" : ""}`}
            onClick={() => onNodo(n)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onNodo(n))}
            className="cursor-pointer focus:outline-none [&:focus-visible>rect]:stroke-[var(--focus)] [&:focus-visible>rect]:stroke-[4]"
          >
            <rect
              x={n.x - w / 2}
              y={n.y - 15}
              width={w}
              height={30}
              rx={15}
              fill={on ? color : "var(--surface)"}
              stroke={on ? color : n.tipo === "neutro" || n.tipo === "salida" ? "var(--neutro)" : color}
              strokeWidth={2}
              strokeOpacity={on ? 1 : 0.45}
              filter={on ? `url(#brillo-${camino})` : undefined}
            />
            <text x={n.x} y={n.y + 4.5} textAnchor="middle" fontSize={12.5} fontWeight={on ? 700 : 500} fill={on ? (n.tipo === "emocion" ? "#1b2333" : "var(--surface)") : "var(--muted)"}>
              {n.etiqueta}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DosCerebros({ datos, textos }: { datos: Cerebros; textos: Textos }) {
  const [i, setI] = useState(0);
  const [escenarioId, setEscenarioId] = useState(datos.escenarios[0]?.id ?? "");
  const [nodo, setNodo] = useState<Nodo | null>(null);
  const [proyeccion, setProyeccion] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  const total = datos.pasos.length;
  const paso = datos.pasos[i];
  const camino = paso.camino;
  const escenario = datos.escenarios.find((e) => e.id === escenarioId);
  const ultimoNoLider = datos.pasos.findLastIndex((p) => p.camino === "no-lider");
  const primerLider = datos.pasos.findIndex((p) => p.camino === "lider");
  const esFinal = i === total - 1 || i === ultimoNoLider;

  const ir = useCallback((n: number) => setI(Math.max(0, Math.min(total - 1, n))), [total]);

  useEffect(() => {
    if (i === total - 1) acciones.completarCerebros();
  }, [i, total]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, select, textarea")) return;
      if (e.key === "ArrowRight") ir(i + 1);
      if (e.key === "ArrowLeft") ir(i - 1);
      if (e.key === "Escape") setNodo(null);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [i, ir]);

  useEffect(() => {
    const cambio = () => setProyeccion(document.fullscreenElement === contenedor.current);
    document.addEventListener("fullscreenchange", cambio);
    return () => document.removeEventListener("fullscreenchange", cambio);
  }, []);

  const alternarProyeccion = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await contenedor.current?.requestFullscreen();
    } catch {
      setProyeccion((p) => !p);
    }
  };

  // Ejemplo del escenario para el nodo que se acaba de encender
  const nuevoNodo = paso.activos.find((id) => !(datos.pasos[i - 1]?.camino === camino ? datos.pasos[i - 1].activos : []).includes(id) && id !== "seguridad");
  const ejemplo = esFinal ? (camino === "lider" ? escenario?.lider : escenario?.noLider) : camino === "lider" && nuevoNodo ? escenario?.porNodo[nuevoNodo] : undefined;

  const pasoNoLider = camino === "no-lider" ? paso : datos.pasos[ultimoNoLider];
  const pasoLider = camino === "lider" ? paso : null;

  return (
    <div ref={contenedor} className={`${proyeccion ? "fixed inset-0 z-50 overflow-auto bg-bg p-6" : ""}`}>
      <div className="flex flex-wrap items-end justify-between gap-3 no-print">
        <div className="min-w-0">
          <label htmlFor="escenario" className="block text-sm font-semibold text-muted">
            {textos.escenario}
          </label>
          <select id="escenario" value={escenarioId} onChange={(e) => setEscenarioId(e.target.value)} className="mt-1 min-h-11 w-full max-w-md rounded-xl border border-line bg-surface px-3">
            {datos.escenarios.map((e) => (
              <option key={e.id} value={e.id}>
                {e.titulo}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={alternarProyeccion} className={btnSecundario}>
          <Icon name="expandir" className="h-4 w-4" /> {proyeccion ? textos.salirProyeccion : textos.proyeccion}
        </button>
      </div>

      <div className="mt-4 flex gap-2 md:hidden" role="tablist" aria-label="Cerebros">
        <button type="button" role="tab" aria-selected={camino === "no-lider"} onClick={() => ir(0)} className="min-h-11 flex-1 rounded-full border-2 border-instinto text-sm font-semibold text-instinto aria-selected:bg-instinto-soft">
          {textos.noLider}
        </button>
        <button type="button" role="tab" aria-selected={camino === "lider"} onClick={() => ir(primerLider)} className="min-h-11 flex-1 rounded-full border-2 border-razon text-sm font-semibold text-razon aria-selected:bg-razon-soft">
          {textos.lider}
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <figure className={`rounded-3xl border bg-surface p-3 ${camino === "no-lider" ? "border-instinto" : "hidden border-line md:block"}`}>
          <figcaption className="px-2 pt-1 text-center font-display text-lg font-semibold text-instinto">{textos.noLider}</figcaption>
          <Red datos={datos} camino="no-lider" paso={pasoNoLider} pasoPrevio={camino === "no-lider" ? (datos.pasos[i - 1] ?? null) : pasoNoLider} atenuada={camino !== "no-lider"} onNodo={setNodo} titulo={textos.noLider} />
        </figure>
        <figure className={`rounded-3xl border bg-surface p-3 ${camino === "lider" ? "border-razon" : "hidden border-line md:block"}`}>
          <figcaption className="px-2 pt-1 text-center font-display text-lg font-semibold text-razon">{textos.lider}</figcaption>
          <Red datos={datos} camino="lider" paso={pasoLider} pasoPrevio={camino === "lider" && datos.pasos[i - 1]?.camino === "lider" ? datos.pasos[i - 1] : null} atenuada={camino !== "lider"} onNodo={setNodo} titulo={textos.lider} />
        </figure>
      </div>

      <div className={`mt-4 rounded-3xl border-2 bg-surface p-5 sm:p-6 ${camino === "lider" ? "border-razon" : "border-instinto"}`} aria-live="polite">
        <p className={`text-sm font-semibold uppercase tracking-wide ${camino === "lider" ? "text-razon" : "text-instinto"}`}>
          {camino === "lider" ? textos.lider : textos.noLider} · {textos.paso} {i + 1} / {total}
        </p>
        <p className={`mt-1 font-display font-semibold ${proyeccion ? "text-5xl" : "text-3xl sm:text-4xl"}`}>{paso.titulo}</p>
        <p className={`mt-2 ${proyeccion ? "text-2xl" : "text-lg"}`}>{paso.texto}</p>
        {esFinal && (
          <p className={`mt-3 font-semibold ${camino === "lider" ? "text-razon" : "text-instinto"} ${proyeccion ? "text-2xl" : ""}`}>
            {textos.resultado}: {datos.resultados[camino]}
          </p>
        )}
        {ejemplo && (
          <p className={`mt-3 rounded-xl bg-surface-2 px-4 py-3 ${proyeccion ? "text-2xl" : ""}`}>
            <span className="text-sm font-semibold text-muted">{esFinal ? textos.respuesta : escenario?.titulo}: </span>
            {ejemplo}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2 no-print">
          <button type="button" onClick={() => ir(i - 1)} disabled={i === 0} className={btnSecundario}>
            <Icon name="flechaIzq" className="h-4 w-4" /> {ui.anterior}
          </button>
          {i < total - 1 ? (
            <button type="button" onClick={() => ir(i + 1)} className={btnPrimario}>
              {ui.siguiente} <Icon name="flecha" className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={() => ir(0)} className={btnPrimario}>
              {textos.reiniciar}
            </button>
          )}
          <p className="ml-auto hidden text-sm text-muted sm:block">← → · {textos.tocaNodo}</p>
        </div>
      </div>

      {nodo && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setNodo(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="nodo-titulo" className="aparecer w-full max-w-md rounded-3xl bg-surface p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h2 id="nodo-titulo" className="flex items-center gap-2 text-2xl font-semibold">
                <span className="h-3 w-3 rounded-full" style={{ background: COLOR[nodo.tipo] }} aria-hidden="true" />
                {nodo.etiqueta}
              </h2>
              <button type="button" autoFocus onClick={() => setNodo(null)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface-2" aria-label={ui.cerrar}>
                <Icon name="cerrar" />
              </button>
            </div>
            <dl className="mt-3 grid gap-3">
              <div>
                <dt className="text-sm font-semibold text-muted">{textos.funcion}</dt>
                <dd>{nodo.funcion}</dd>
              </div>
              <div className={`rounded-xl p-3 ${clasesPiloto.razon.fondo}`}>
                <dt className="text-sm font-semibold text-razon">{textos.enLider}</dt>
                <dd>{nodo.enLider}</dd>
              </div>
              <div className={`rounded-xl p-3 ${clasesPiloto.instinto.fondo}`}>
                <dt className="text-sm font-semibold text-instinto">{textos.enNoLider}</dt>
                <dd>{nodo.enNoLider}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
