"use client";

import { useState } from "react";
import { acciones, useCargado, useProgreso } from "@/lib/progress";
import { ui } from "@/lib/sitio";
import type { DatosPausa } from "./interactivos/CaminoPausa";
import { Icon } from "./ui/Icon";
import { btnPrimario, btnSecundario } from "./ui/estilos";

type Checklist = { intro: string; completo: string; reiniciar: string; notas: string; items: { id: string; texto: string; placeholder: string }[] };

export function ChecklistPrevio({ datos }: { datos: Checklist }) {
  const p = useProgreso();
  const cargado = useCargado();
  const hechos = datos.items.filter((i) => p.kit.checklist[i.id]).length;
  const completo = hechos === datos.items.length;

  return (
    <div>
      <p>{datos.intro}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-label={ui.progreso} aria-valuemin={0} aria-valuemax={datos.items.length} aria-valuenow={hechos}>
        <div className="h-full rounded-full bg-razon transition-all" style={{ width: `${(hechos / datos.items.length) * 100}%` }} />
      </div>
      <ul className="mt-4 grid gap-3">
        {datos.items.map((i) => (
          <li key={i.id} className={`rounded-2xl border p-4 ${p.kit.checklist[i.id] ? "border-razon bg-razon-soft" : "border-line bg-surface"}`}>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--razon)]" checked={!!p.kit.checklist[i.id]} onChange={(e) => acciones.marcarChecklist(i.id, e.target.checked)} />
              <span className="font-medium">{i.texto}</span>
            </label>
            {cargado && (
              <textarea
                aria-label={`${datos.notas}: ${i.texto}`}
                defaultValue={p.kit.notas[i.id] ?? ""}
                onBlur={(e) => acciones.guardarNota(i.id, e.target.value)}
                placeholder={i.placeholder}
                rows={2}
                className="mt-2 w-full rounded-xl border border-line bg-surface p-2 text-[0.95rem]"
              />
            )}
          </li>
        ))}
      </ul>
      {completo && (
        <div className="aparecer mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-razon-soft p-4" role="status">
          <p className="font-semibold text-razon">{datos.completo}</p>
          <button type="button" className={btnSecundario} onClick={() => acciones.reiniciarChecklist()}>
            {datos.reiniciar}
          </button>
        </div>
      )}
    </div>
  );
}

type Tarjeta = { intro: string; titulo: string; pie: string; imprimir: string; fondo: string; generando: string };

/** Dibuja la tarjeta PAUSA en un canvas del tamaño de una pantalla de teléfono y la descarga. */
function generarFondo(pausa: DatosPausa, t: Tarjeta) {
  const W = 1080;
  const H = 2340;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return;
  g.fillStyle = "#10141c";
  g.fillRect(0, 0, W, H);
  const serif = getComputedStyle(document.documentElement).getPropertyValue("--font-fraunces") || "Georgia";
  const sans = getComputedStyle(document.documentElement).getPropertyValue("--font-source") || "sans-serif";
  g.textAlign = "center";
  g.fillStyle = "#ece9e2";
  g.font = `600 78px ${serif}, Georgia, serif`;
  g.fillText(t.titulo, W / 2, 560);
  g.fillStyle = "#5ad39a";
  g.font = `700 64px ${sans}, sans-serif`;
  g.fillText("PAUSA", W / 2, 660);

  let y = 800;
  for (const p of pausa.pasos) {
    g.fillStyle = "#1f293b";
    g.beginPath();
    g.roundRect(90, y, W - 180, 230, 36);
    g.fill();
    g.fillStyle = "#5ad39a";
    g.beginPath();
    g.roundRect(130, y + 45, 140, 140, 28);
    g.fill();
    g.fillStyle = "#10141c";
    g.font = `700 96px ${serif}, Georgia, serif`;
    g.fillText(p.letra, 200, y + 150);
    g.textAlign = "left";
    g.fillStyle = "#ece9e2";
    g.font = `700 54px ${sans}, sans-serif`;
    g.fillText(p.nombre, 310, y + 100);
    g.fillStyle = "#a7afbf";
    g.font = `400 38px ${sans}, sans-serif`;
    const palabras = p.pregunta.split(" ");
    let linea = "";
    let ly = y + 160;
    for (const w of palabras) {
      if (g.measureText(linea + w).width > W - 450) {
        g.fillText(linea.trim(), 310, ly);
        linea = "";
        ly += 46;
      }
      linea += w + " ";
    }
    g.fillText(linea.trim(), 310, ly);
    g.textAlign = "center";
    y += 270;
  }
  g.fillStyle = "#d6b673";
  g.font = `italic 44px ${serif}, Georgia, serif`;
  g.fillText(t.pie, W / 2, y + 80);

  const a = document.createElement("a");
  a.download = "pausa-fondo-de-pantalla.png";
  a.href = c.toDataURL("image/png");
  a.click();
}

export function TarjetaPausa({ pausa, datos }: { pausa: DatosPausa; datos: Tarjeta }) {
  const [generando, setGenerando] = useState(false);
  return (
    <div>
      <p className="no-print">{datos.intro}</p>
      <div id="tarjeta-pausa" className="mx-auto mt-4 max-w-sm rounded-3xl border-2 border-razon bg-surface p-6 print:max-w-none print:border-black">
        <p className="text-center font-display text-2xl font-semibold">{datos.titulo}</p>
        <ol className="mt-4 grid gap-2">
          {pausa.pasos.map((p, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-razon font-display text-2xl font-bold text-white dark:text-[#10141c] print:border print:border-black print:bg-white print:text-black">{p.letra}</span>
              <span>
                <span className="block font-semibold">{p.nombre}</span>
                <span className="block text-sm text-muted print:text-black">{p.pregunta}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-center text-sm italic text-brass print:text-black">{datos.pie}</p>
      </div>
      <div className="no-print mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className={btnSecundario}
          onClick={() => {
            document.body.classList.add("imprimir-tarjeta");
            window.print();
            setTimeout(() => document.body.classList.remove("imprimir-tarjeta"), 500);
          }}
        >
          <Icon name="imprimir" className="h-4 w-4" /> {datos.imprimir}
        </button>
        <button
          type="button"
          className={btnPrimario}
          disabled={generando}
          onClick={async () => {
            setGenerando(true);
            await document.fonts?.ready;
            generarFondo(pausa, datos);
            setGenerando(false);
          }}
        >
          <Icon name="descargar" className="h-4 w-4" /> {generando ? datos.generando : datos.fondo}
        </button>
      </div>
    </div>
  );
}

type Reflex = { intro: string; modelo: string; preguntas: string[]; guardar: string; guardada: string; anteriores: string; sinAnteriores: string; borrar: string; confirmarBorrar: string };

export function ReflexionPosterior({ datos }: { datos: Reflex }) {
  const p = useProgreso();
  const [modelo, setModelo] = useState("");
  const [resp, setResp] = useState<string[]>(datos.preguntas.map(() => ""));
  const [ok, setOk] = useState(false);
  const algo = modelo.trim() || resp.some((r) => r.trim());

  return (
    <div>
      <p>{datos.intro}</p>
      <form
        className="mt-4 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          acciones.guardarReflexion({ modelo, respuestas: resp });
          setModelo("");
          setResp(datos.preguntas.map(() => ""));
          setOk(true);
        }}
      >
        <div>
          <label htmlFor="modelo" className="text-sm font-semibold">
            {datos.modelo}
          </label>
          <input id="modelo" value={modelo} onChange={(e) => (setModelo(e.target.value), setOk(false))} className="mt-1 min-h-11 w-full rounded-xl border border-line bg-surface px-3" />
        </div>
        {datos.preguntas.map((q, i) => (
          <div key={q}>
            <label htmlFor={`r-${i}`} className="font-semibold">
              {i + 1}. {q}
            </label>
            <textarea id={`r-${i}`} rows={3} value={resp[i]} onChange={(e) => (setResp((r) => r.map((x, j) => (j === i ? e.target.value : x))), setOk(false))} className="mt-1 w-full rounded-xl border border-line bg-surface p-3" />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button type="submit" className={btnPrimario} disabled={!algo}>
            {datos.guardar}
          </button>
          {ok && (
            <p className="flex items-center gap-2 font-semibold text-razon" role="status">
              <Icon name="check" className="h-4 w-4" /> {datos.guardada}
            </p>
          )}
        </div>
      </form>

      <h3 className="mt-8 text-xl font-semibold">{datos.anteriores}</h3>
      {p.kit.reflexiones.length === 0 ? (
        <p className="mt-2 text-muted">{datos.sinAnteriores}</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {p.kit.reflexiones.map((r) => (
            <li key={r.id}>
              <details className="rounded-2xl border border-line bg-surface p-4">
                <summary className="cursor-pointer font-semibold">
                  {r.modelo || "—"} <span className="font-normal text-muted">· {r.fecha}</span>
                </summary>
                <dl className="mt-3 grid gap-2 text-[0.95rem]">
                  {datos.preguntas.map((q, i) =>
                    r.respuestas[i] ? (
                      <div key={q}>
                        <dt className="font-semibold">{q}</dt>
                        <dd className="whitespace-pre-line text-muted">{r.respuestas[i]}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
                <button type="button" className="mt-3 text-sm font-semibold text-instinto" onClick={() => window.confirm(datos.confirmarBorrar) && acciones.borrarReflexion(r.id)}>
                  {datos.borrar}
                </button>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
