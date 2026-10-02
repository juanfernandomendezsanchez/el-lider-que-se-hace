"use client";

import { useMemo, useState } from "react";
import { acciones } from "@/lib/progress";
import { Icon } from "../ui/Icon";
import { btnPrimario, btnSecundario } from "../ui/estilos";

type Principio = { id: string; nombre: string };

type Clasificar = {
  intro: string;
  principio: string;
  elige: string;
  etica: string;
  honesta: string;
  manipulacion: string;
  comprobar: string;
  siguiente: string;
  principioOk: string;
  principioMal: string;
  eticaOk: string;
  eticaMal: string;
  resultado: string;
  repetir: string;
  items: { frase: string; principio: string; honesta: boolean; explicacion: string }[];
};

export function JuegoClasificar({ datos, principios }: { datos: Clasificar; principios: Principio[] }) {
  const [i, setI] = useState(0);
  const [principio, setPrincipio] = useState("");
  const [honesta, setHonesta] = useState<boolean | null>(null);
  const [comprobado, setComprobado] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const fin = i >= datos.items.length;
  const item = datos.items[i];
  const nombre = (id: string) => principios.find((p) => p.id === id)?.nombre ?? id;

  const comprobar = () => {
    setComprobado(true);
    setPuntos((p) => p + (principio === item.principio ? 1 : 0) + (honesta === item.honesta ? 1 : 0));
  };
  const siguiente = () => {
    setPrincipio("");
    setHonesta(null);
    setComprobado(false);
    if (i + 1 >= datos.items.length) acciones.marcarPractica();
    setI((x) => x + 1);
  };

  if (fin) {
    return (
      <div className="rounded-2xl border border-razon bg-razon-soft p-5" role="status">
        <p className="font-display text-2xl font-semibold">
          {datos.resultado}: {puntos} / {datos.items.length * 2}
        </p>
        <button
          type="button"
          className={`${btnSecundario} mt-3`}
          onClick={() => {
            setI(0);
            setPuntos(0);
          }}
        >
          {datos.repetir}
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>{datos.intro}</p>
      <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm text-muted">
          {i + 1} / {datos.items.length}
        </p>
        <p key={i} className="aparecer mt-1 text-lg font-medium italic">
          {item.frase}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="principio" className="text-sm font-semibold">
              {datos.principio}
            </label>
            <select id="principio" value={principio} disabled={comprobado} onChange={(e) => setPrincipio(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3">
              <option value="" disabled>
                {datos.elige}
              </option>
              {principios.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm font-semibold" id="etica-l">
              {datos.etica}
            </p>
            <div className="mt-1 flex gap-2" role="radiogroup" aria-labelledby="etica-l">
              {[
                { v: true, t: datos.honesta },
                { v: false, t: datos.manipulacion },
              ].map((o) => (
                <button
                  key={String(o.v)}
                  type="button"
                  role="radio"
                  aria-checked={honesta === o.v}
                  disabled={comprobado}
                  onClick={() => setHonesta(o.v)}
                  className="min-h-11 flex-1 rounded-xl border border-line px-3 text-sm aria-checked:border-brand aria-checked:bg-brand aria-checked:font-semibold aria-checked:text-brand-ink"
                >
                  {o.t}
                </button>
              ))}
            </div>
          </div>
        </div>
        {!comprobado ? (
          <button type="button" className={`${btnPrimario} mt-4`} disabled={!principio || honesta === null} onClick={comprobar}>
            {datos.comprobar}
          </button>
        ) : (
          <div className="aparecer mt-4 grid gap-1" aria-live="polite">
            <p>
              <strong className={principio === item.principio ? "text-razon" : "text-instinto"}>{principio === item.principio ? datos.principioOk : `${datos.principioMal}: ${nombre(item.principio)}`}.</strong>
            </p>
            <p>
              <strong className={honesta === item.honesta ? "text-razon" : "text-instinto"}>{honesta === item.honesta ? datos.eticaOk : datos.eticaMal}:</strong> {item.honesta ? datos.honesta : datos.manipulacion}. {item.explicacion}
            </p>
            <button type="button" className={`${btnPrimario} mt-3 justify-self-start`} onClick={siguiente}>
              {datos.siguiente} <Icon name="flecha" className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type Clave = { id: string; nombre: string; consejo: string; palabras: string[]; numeros?: boolean };
type Constructor = { intro: string; etiqueta: string; ejemplo: string; usarEjemplo: string; borrar: string; usando: string; faltan: string; nota: string; contador: string; claves: Clave[] };

/** Revisión aproximada por palabras clave: guía, no calificación. */
function detectar(texto: string, claves: Clave[]) {
  const t = ` ${texto.toLowerCase()} `;
  const frases = texto
    .split(/[.!?]+/)
    .map((f) => f.trim().toLowerCase())
    .filter(Boolean);
  const r: Record<string, boolean> = {};
  for (const c of claves) {
    if (c.id === "principioFin") {
      const tiene = (f: string) => c.palabras.some((p) => f.includes(p));
      r[c.id] = frases.length >= 2 && tiene(frases[0]) && tiene(frases[frases.length - 1]);
    } else {
      r[c.id] = c.palabras.some((p) => t.includes(p)) || (!!c.numeros && /\d/.test(t));
    }
  }
  return r;
}

export function ConstructorPropuesta({ datos }: { datos: Constructor }) {
  const [texto, setTexto] = useState("");
  const usadas = useMemo(() => detectar(texto, datos.claves), [texto, datos.claves]);
  const n = Object.values(usadas).filter(Boolean).length;

  return (
    <div>
      <p>{datos.intro}</p>
      <label htmlFor="propuesta" className="mt-4 block text-sm font-semibold">
        {datos.etiqueta}
      </label>
      <textarea id="propuesta" rows={6} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={datos.ejemplo} className="mt-1 w-full rounded-xl border border-line bg-surface p-3" aria-describedby="nota-constructor" />
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className={btnSecundario} onClick={() => setTexto(datos.ejemplo.replace(/^Ejemplo:\s*/, ""))}>
          {datos.usarEjemplo}
        </button>
        {texto && (
          <button type="button" className={btnSecundario} onClick={() => setTexto("")}>
            {datos.borrar}
          </button>
        )}
      </div>
      <p className="mt-4 font-semibold" aria-live="polite">
        {n} {datos.contador}
      </p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {datos.claves.map((c) => (
          <li key={c.id} className={`flex gap-3 rounded-xl border p-3 ${usadas[c.id] ? "border-razon bg-razon-soft" : "border-line"}`}>
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${usadas[c.id] ? "bg-razon text-white dark:text-[#10141c]" : "border border-line"}`} aria-hidden="true">
              {usadas[c.id] && <Icon name="check" className="h-4 w-4" />}
            </span>
            <span>
              <span className="block font-semibold">
                {c.nombre}
                <span className="sr-only">: {usadas[c.id] ? datos.usando : datos.faltan}</span>
              </span>
              {!usadas[c.id] && <span className="block text-sm text-muted">{c.consejo}</span>}
            </span>
          </li>
        ))}
      </ul>
      <p id="nota-constructor" className="mt-3 text-sm text-muted">
        {datos.nota}
      </p>
    </div>
  );
}

export function Principios({ intro, principios, porQue, enMUN }: { intro: string; principios: { id: string; nombre: string; porQue: string; enMUN: string }[]; porQue: string; enMUN: string }) {
  return (
    <div>
      <p>{intro}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {principios.map((p, i) => (
          <li key={p.id} className="rounded-2xl border border-line bg-surface p-4">
            <p className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand font-sans text-sm text-brand-ink">{i + 1}</span>
              {p.nombre}
            </p>
            <p className="mt-2 text-[0.95rem]">
              <strong>{porQue}:</strong> {p.porQue}
            </p>
            <p className="mt-1 text-[0.95rem]">
              <strong>{enMUN}:</strong> {p.enMUN}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
