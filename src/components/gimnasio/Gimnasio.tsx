"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { acciones, calcularRacha, hoy, useCargado, useProgreso } from "@/lib/progress";
import { S, clasesPiloto, ui, type PilotoNombre } from "@/lib/sitio";
import { Respiracion as Circulo } from "../Respiracion";
import { Icon } from "../ui/Icon";
import { btnPrimario, btnSecundario, opcion } from "../ui/estilos";

type Textos = { rachaTitulo: string; rachaDias: string; rachaDia: string; rachaCero: string; rachaNota: string; hoyListo: string };

export function Racha({ textos }: { textos: Textos }) {
  const p = useProgreso();
  const cargado = useCargado();
  const n = calcularRacha(p.gimnasio.dias);
  const hoyHecho = p.gimnasio.dias.includes(hoy());
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-5">
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${n > 0 ? "bg-emocion-soft text-emocion" : "bg-surface-2 text-muted"}`}>
        <Icon name="fuego" className="h-7 w-7" />
      </span>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brass">{textos.rachaTitulo}</p>
        {cargado && (
          <p className="font-display text-2xl font-semibold">
            {n > 0 ? `${n} ${n === 1 ? textos.rachaDia : textos.rachaDias}` : textos.rachaCero}
          </p>
        )}
        <p className="text-sm text-muted">
          {hoyHecho && <strong className="text-razon">{textos.hoyListo}. </strong>}
          {textos.rachaNota}
        </p>
      </div>
    </div>
  );
}

function Volver() {
  return (
    <Link href="/gimnasio/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
      <Icon name="flechaIzq" className="h-4 w-4" /> {ui.volverGimnasio}
    </Link>
  );
}

/* ---------- ¿Qué? ¿Y qué? ¿Y ahora qué? ---------- */

type QyQ = {
  bajada: string;
  molde: { parte: string; ayuda: string }[];
  empezar: string;
  otra: string;
  listo: string;
  escribir: string;
  segundos: string;
  tiempo: string;
  rubricaTitulo: string;
  rubrica: { id: string; criterio: string; pregunta: string }[];
  si: string;
  masOMenos: string;
  no: string;
  guardar: string;
  guardado: string;
  feedback: { alto: string; medio: string; bajo: string };
  preguntas: string[];
};

export function EntrenadorQyQ({ datos }: { datos: QyQ }) {
  const [indice, setIndice] = useState<number | null>(null);
  const [restante, setRestante] = useState(30);
  const [corriendo, setCorriendo] = useState(false);
  const [notas, setNotas] = useState("");
  const [puntos, setPuntos] = useState<Record<string, number>>({});
  const [guardado, setGuardado] = useState(false);
  const usadas = useRef<number[]>([]);

  useEffect(() => {
    if (!corriendo) return;
    if (restante <= 0) {
      setCorriendo(false);
      return;
    }
    const t = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [corriendo, restante]);

  const nueva = () => {
    const libres = datos.preguntas.map((_, i) => i).filter((i) => !usadas.current.includes(i));
    const pool = libres.length ? libres : datos.preguntas.map((_, i) => i);
    const i = pool[Math.floor(Math.random() * pool.length)];
    usadas.current = libres.length ? [...usadas.current, i] : [i];
    setIndice(i);
    setRestante(30);
    setCorriendo(true);
    setNotas("");
    setPuntos({});
    setGuardado(false);
  };

  const evaluado = datos.rubrica.every((r) => puntos[r.id] !== undefined);
  const total = Object.values(puntos).reduce((a, b) => a + b, 0);
  const max = datos.rubrica.length * 2;
  const fb = total >= max - 1 ? datos.feedback.alto : total >= max / 2 ? datos.feedback.medio : datos.feedback.bajo;

  return (
    <div className="grid gap-6">
      <Volver />
      <p className="text-lg text-muted">{datos.bajada}</p>
      <ol className="grid gap-2 sm:grid-cols-3">
        {datos.molde.map((m) => (
          <li key={m.parte} className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-display text-xl font-semibold">{m.parte}</p>
            <p className="text-sm text-muted">{m.ayuda}</p>
          </li>
        ))}
      </ol>

      {indice === null ? (
        <button type="button" className={btnPrimario} onClick={nueva}>
          {datos.empezar}
        </button>
      ) : (
        <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <p key={indice} className="aparecer font-display text-2xl font-semibold sm:text-3xl">
            {datos.preguntas[indice]}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div className={`h-full rounded-full transition-all duration-1000 ${restante <= 10 ? "bg-instinto" : "bg-razon"}`} style={{ width: `${(restante / 30) * 100}%` }} />
            </div>
            <span className="w-28 text-right font-semibold tabular-nums" aria-live={restante <= 5 || restante === 0 ? "polite" : "off"}>
              {restante > 0 ? `${restante} ${datos.segundos}` : datos.tiempo}
            </span>
          </div>
          <label htmlFor="resp" className="mt-4 block text-sm font-semibold text-muted">
            {datos.escribir}
          </label>
          <textarea id="resp" value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-line bg-surface p-3" />
          <div className="mt-3 flex flex-wrap gap-2">
            {corriendo && (
              <button type="button" className={btnPrimario} onClick={() => setCorriendo(false)}>
                {datos.listo}
              </button>
            )}
            <button type="button" className={btnSecundario} onClick={nueva}>
              {datos.otra}
            </button>
          </div>

          {!corriendo && (
            <div className="aparecer mt-6">
              <h2 className="text-xl font-semibold">{datos.rubricaTitulo}</h2>
              <ul className="mt-3 grid gap-3">
                {datos.rubrica.map((r) => (
                  <li key={r.id} className="rounded-xl border border-line p-4">
                    <p className="font-semibold">{r.criterio}</p>
                    <p className="text-sm text-muted">{r.pregunta}</p>
                    <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={r.criterio}>
                      {[
                        { v: 2, t: datos.si },
                        { v: 1, t: datos.masOMenos },
                        { v: 0, t: datos.no },
                      ].map((o) => (
                        <button
                          key={o.v}
                          type="button"
                          role="radio"
                          aria-checked={puntos[r.id] === o.v}
                          onClick={() => setPuntos((x) => ({ ...x, [r.id]: o.v }))}
                          className="min-h-10 rounded-full border border-line px-4 text-sm aria-checked:border-brand aria-checked:bg-brand aria-checked:font-semibold aria-checked:text-brand-ink"
                        >
                          {o.t}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              {evaluado && (
                <div className="aparecer mt-4 rounded-xl bg-surface-2 p-4" aria-live="polite">
                  <p className="font-semibold">
                    {total} / {max}. {fb}
                  </p>
                  {guardado ? (
                    <p className="mt-2 flex items-center gap-2 font-semibold text-razon">
                      <Icon name="check" className="h-4 w-4" /> {datos.guardado}
                    </p>
                  ) : (
                    <button
                      type="button"
                      className={`${btnPrimario} mt-3`}
                      onClick={() => {
                        acciones.marcarPractica();
                        setGuardado(true);
                      }}
                    >
                      {datos.guardar}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Respiración ---------- */

export function RespiracionGuiada({ datos }: { datos: { bajada: string; inhala: string; exhala: string; boton: string; listo: string; ciclos: number; nota: string } }) {
  return (
    <div className="grid gap-6">
      <Volver />
      <p className="text-lg text-muted">{datos.bajada}</p>
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-10">
        <Circulo ciclos={datos.ciclos} textos={datos} onTerminar={() => acciones.marcarPractica()} />
      </div>
      <p className="text-sm text-muted">{datos.nota}</p>
    </div>
  );
}

/* ---------- Sí, y… ---------- */

type SiY = {
  bajada: string;
  otro: string;
  resultado: string;
  de: string;
  repetir: string;
  items: { frase: string; opciones: { texto: string; construye: boolean; explicacion: string }[] }[];
};

export function JuegoSiY({ datos }: { datos: SiY }) {
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const fin = i >= datos.items.length;
  const item = datos.items[i];

  const elegir = (j: number) => {
    setElegida(j);
    if (item.opciones[j].construye) setAciertos((a) => a + 1);
  };
  const siguiente = () => {
    setElegida(null);
    if (i + 1 >= datos.items.length) acciones.marcarPractica();
    setI((x) => x + 1);
  };

  return (
    <div className="grid gap-6">
      <Volver />
      <p className="text-lg text-muted">{datos.bajada}</p>
      {fin ? (
        <div className="rounded-3xl border border-razon bg-razon-soft p-6" role="status">
          <p className="font-display text-2xl font-semibold">
            {datos.resultado} {aciertos} {datos.de} {datos.items.length}
          </p>
          <button
            type="button"
            className={`${btnSecundario} mt-4`}
            onClick={() => {
              setI(0);
              setAciertos(0);
            }}
          >
            {datos.repetir}
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <p className="text-sm text-muted">
            {i + 1} / {datos.items.length} · {datos.otro}:
          </p>
          <p key={i} className="aparecer mt-1 font-display text-2xl font-semibold">
            {item.frase}
          </p>
          <div className="mt-4 grid gap-2">
            {item.opciones.map((o, j) => (
              <button
                key={o.texto}
                type="button"
                disabled={elegida !== null}
                onClick={() => elegir(j)}
                className={`${opcion} ${elegida !== null && o.construye ? "!border-razon !bg-razon-soft" : ""} ${elegida === j && !o.construye ? "!border-instinto !bg-instinto-soft" : ""}`}
              >
                {o.texto}
              </button>
            ))}
          </div>
          {elegida !== null && (
            <div className="aparecer mt-4" aria-live="polite">
              <p>
                <strong className={item.opciones[elegida].construye ? "text-razon" : "text-instinto"}>{item.opciones[elegida].construye ? ui.correcto : ui.incorrecto}.</strong> {item.opciones[elegida].explicacion}
              </p>
              <button type="button" className={`${btnPrimario} mt-3`} onClick={siguiente}>
                {ui.siguiente} <Icon name="flecha" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Detecta el secuestro ---------- */

type Secuestro = {
  bajada: string;
  resultado: string;
  de: string;
  repetir: string;
  siguiente: string;
  items: { frase: string; piloto: PilotoNombre; explicacion: string }[];
};

export function DetectaSecuestro({ datos }: { datos: Secuestro }) {
  const [i, setI] = useState(0);
  const [resp, setResp] = useState<PilotoNombre | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const pilotos = Object.keys(S.pilotos) as PilotoNombre[];
  const fin = i >= datos.items.length;
  const item = datos.items[i];

  return (
    <div className="grid gap-6">
      <Volver />
      <p className="text-lg text-muted">{datos.bajada}</p>
      {fin ? (
        <div className="rounded-3xl border border-razon bg-razon-soft p-6" role="status">
          <p className="font-display text-2xl font-semibold">
            {datos.resultado} {aciertos} {datos.de} {datos.items.length}
          </p>
          <button
            type="button"
            className={`${btnSecundario} mt-4`}
            onClick={() => {
              setI(0);
              setAciertos(0);
            }}
          >
            {datos.repetir}
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <p className="text-sm text-muted">
            {i + 1} / {datos.items.length}
          </p>
          <p key={i} className="aparecer mt-1 font-display text-2xl font-semibold">
            {item.frase}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {pilotos.map((p) => {
              const c = clasesPiloto[p];
              const marcar = resp !== null && (p === item.piloto || p === resp);
              return (
                <button
                  key={p}
                  type="button"
                  disabled={resp !== null}
                  onClick={() => {
                    setResp(p);
                    if (p === item.piloto) setAciertos((a) => a + 1);
                  }}
                  className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 font-semibold ${c.borde} ${marcar ? c.fondo : ""} ${resp !== null && !marcar ? "opacity-40" : ""}`}
                >
                  <span className={`h-3 w-3 rounded-full ${c.punto}`} aria-hidden="true" />
                  <span className={c.texto}>{S.pilotos[p].nombre}</span>
                </button>
              );
            })}
          </div>
          {resp !== null && (
            <div className="aparecer mt-4" aria-live="polite">
              <p>
                <strong className={resp === item.piloto ? "text-razon" : "text-instinto"}>{resp === item.piloto ? ui.correcto : `${ui.era} ${S.pilotos[item.piloto].nombre.toLowerCase()}`}.</strong> {item.explicacion}
              </p>
              <button
                type="button"
                className={`${btnPrimario} mt-3`}
                onClick={() => {
                  setResp(null);
                  if (i + 1 >= datos.items.length) acciones.marcarPractica();
                  setI((x) => x + 1);
                }}
              >
                {datos.siguiente} <Icon name="flecha" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
