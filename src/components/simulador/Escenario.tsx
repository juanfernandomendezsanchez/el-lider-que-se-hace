"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Escenario as TEscenario, OpcionEscenario, Piloto } from "@/content/schema";
import { acciones, useProgreso } from "@/lib/progress";
import { S, clasesPiloto } from "@/lib/sitio";
import { Icon } from "../ui/Icon";
import { btnPrimario, btnSecundario, opcion } from "../ui/estilos";

const t = S.simuladorUI;

type Decision = { situacion: string; texto: string; piloto: Piloto; consecuencia: string; explicacion: string; opcion: string };

function ChipPiloto({ piloto }: { piloto: Piloto }) {
  const c = clasesPiloto[piloto];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${c.borde} ${c.fondo} ${c.texto}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${c.punto}`} aria-hidden="true" />
      {S.pilotos[piloto].nombre}
    </span>
  );
}

export function EscenarioPlayer({ escenario }: { escenario: TEscenario }) {
  const [fase, setFase] = useState<"intro" | "jugando" | "resumen">("intro");
  const [conReloj, setConReloj] = useState(false);
  const [nodoId, setNodoId] = useState(escenario.inicio);
  const [elegida, setElegida] = useState<OpcionEscenario | "tiempo" | null>(null);
  const [decisiones, setDecisiones] = useState<Decision[]>([]);
  const [restante, setRestante] = useState(escenario.temporizadorSeg ?? 30);
  const nodo = escenario.nodos[nodoId];

  useEffect(() => {
    if (fase !== "jugando" || !conReloj || elegida) return;
    if (restante <= 0) {
      setElegida("tiempo");
      setDecisiones((d) => [...d, { situacion: nodo.situacion, texto: t.seAcaboElTiempo, piloto: "instinto", opcion: "tiempo", ...escenario.siSeAcabaElTiempo }]);
      return;
    }
    const id = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [fase, conReloj, elegida, restante, nodo, escenario.siSeAcabaElTiempo]);

  const empezar = () => {
    setNodoId(escenario.inicio);
    setDecisiones([]);
    setElegida(null);
    setRestante(escenario.temporizadorSeg ?? 30);
    setFase("jugando");
  };

  const elegir = (o: OpcionEscenario) => {
    setElegida(o);
    setDecisiones((d) => [...d, { situacion: nodo.situacion, texto: o.texto, piloto: o.piloto, consecuencia: o.consecuencia, explicacion: o.explicacion, opcion: o.id }]);
  };

  const continuar = () => {
    if (elegida && elegida !== "tiempo" && elegida.siguiente) {
      setNodoId(elegida.siguiente);
      setElegida(null);
      setRestante(escenario.temporizadorSeg ?? 30);
    } else {
      acciones.registrarEscenario(
        escenario.id,
        decisiones.map((d) => ({ opcion: d.opcion, piloto: d.piloto })),
      );
      setFase("resumen");
    }
  };

  if (fase === "intro") {
    return (
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-brass">{t.contexto}</p>
        <p className="mt-1 text-lg">{escenario.contexto}</p>
        <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3">
          <input type="checkbox" checked={conReloj} onChange={(e) => setConReloj(e.target.checked)} className="h-5 w-5 accent-[var(--brand)]" />
          <span>{t.conReloj}</span>
        </label>
        <button type="button" className={`${btnPrimario} mt-4`} onClick={empezar}>
          {t.empezar} <Icon name="flecha" className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (fase === "resumen") {
    const conteo = decisiones.reduce<Record<string, number>>((c, d) => ({ ...c, [d.piloto]: (c[d.piloto] ?? 0) + 1 }), {});
    return (
      <div className="grid gap-6">
        <section className="rounded-3xl border border-line bg-surface p-5 sm:p-7" aria-labelledby="resumen">
          <h2 id="resumen" className="text-2xl font-semibold">
            {t.resumen}
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(conteo) as Piloto[]).map((p) => (
              <li key={p} className="flex items-center gap-1">
                <ChipPiloto piloto={p} /> <span className="text-sm text-muted">× {conteo[p]}</span>
              </li>
            ))}
          </ul>
          <ol className="mt-4 grid gap-3">
            {decisiones.map((d, i) => (
              <li key={i} className="rounded-xl border border-line p-4">
                <p className="text-sm text-muted">
                  {t.decision} {i + 1}
                </p>
                <p className="font-medium">{d.texto}</p>
                <div className="mt-2">
                  <ChipPiloto piloto={d.piloto} />
                </div>
                <p className="mt-2 text-[0.95rem]">{d.consecuencia}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl border-2 border-razon bg-razon-soft p-5 sm:p-7" aria-labelledby="modelo">
          <h2 id="modelo" className="text-2xl font-semibold text-razon">
            {t.respuestaModelo}
          </h2>
          <ol className="mt-4 grid gap-3">
            {escenario.respuestaModelo.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-razon font-display text-xl font-bold text-white dark:text-[#10141c]">{p.paso[0]}</span>
                <p>
                  <strong>{p.paso}.</strong> {p.accion}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnPrimario} onClick={empezar}>
            {t.repetir}
          </button>
          <Link href="/simulador/" className={btnSecundario}>
            {t.otros}
          </Link>
        </div>
      </div>
    );
  }

  const pct = ((escenario.temporizadorSeg ?? 30) - restante) / (escenario.temporizadorSeg ?? 30);
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <p className="text-sm font-semibold uppercase tracking-wide text-brass">
        {t.decision} {decisiones.length + (elegida ? 0 : 1)}
      </p>
      {conReloj && !elegida && (
        <div className="mt-2 flex items-center gap-3" aria-label={`${restante} ${t.segundos}`}>
          <Icon name="reloj" className="h-5 w-5 text-muted" />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div className={`h-full rounded-full transition-all duration-1000 ${restante <= 10 ? "bg-instinto" : "bg-emocion-fill"}`} style={{ width: `${pct * 100}%` }} />
          </div>
          <span className="w-10 text-right font-semibold tabular-nums" aria-live={restante <= 10 ? "polite" : "off"}>
            {restante}
            {t.segundos}
          </span>
        </div>
      )}
      <p key={nodoId} className="aparecer mt-3 text-lg font-medium sm:text-xl">
        {nodo.situacion}
      </p>

      <div className="mt-4 grid gap-2">
        {nodo.opciones.map((o) => {
          const esta = elegida !== null && elegida !== "tiempo" && elegida.id === o.id;
          return (
            <button key={o.id} type="button" disabled={elegida !== null} onClick={() => elegir(o)} aria-pressed={esta} className={`${opcion} ${esta ? "!border-brand !bg-surface-2 font-semibold" : ""} disabled:opacity-60 ${esta ? "!opacity-100" : ""}`}>
              {o.texto}
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        {elegida && (
          <div className="aparecer mt-5 rounded-2xl border border-line bg-surface-2 p-5">
            {elegida === "tiempo" ? (
              <>
                <p className="font-display text-xl font-semibold">{t.seAcaboElTiempo}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {t.pilotoTomo}: <ChipPiloto piloto="instinto" />
                </div>
                <p className="mt-3">
                  <strong>{t.consecuencia}:</strong> {escenario.siSeAcabaElTiempo.consecuencia}
                </p>
                <p className="mt-1">
                  <strong>{t.porQue}:</strong> {escenario.siSeAcabaElTiempo.explicacion}
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {t.pilotoTomo}: <ChipPiloto piloto={elegida.piloto} />
                </div>
                <p className="mt-3">
                  <strong>{t.consecuencia}:</strong> {elegida.consecuencia}
                </p>
                <p className="mt-1">
                  <strong>{t.porQue}:</strong> {elegida.explicacion}
                </p>
              </>
            )}
            <button type="button" onClick={continuar} className={`${btnPrimario} mt-4`}>
              {elegida !== "tiempo" && elegida.siguiente ? t.continuar : t.verResumen} <Icon name="flecha" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function EstadoEscenario({ id }: { id: string }) {
  const p = useProgreso();
  const e = p.escenarios[id];
  if (!e) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted">
      <Icon name="check" className="h-3.5 w-3.5" /> {t.jugado}
    </span>
  );
}
