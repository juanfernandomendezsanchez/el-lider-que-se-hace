"use client";

import { useId, useState } from "react";
import type { Pregunta } from "@/content/schema";
import { acciones } from "@/lib/progress";
import { ui } from "@/lib/sitio";
import { Icon } from "./ui/Icon";

/** Una pregunta con respuesta inmediata y explicación de cada opción. */
export function QuizItem({ pregunta, onRespondida, numero }: { pregunta: Pregunta; onRespondida?: (correcta: boolean) => void; numero?: number }) {
  const [elegida, setElegida] = useState<number | null>(null);
  const id = useId();
  const responder = (i: number) => {
    if (elegida !== null) return;
    setElegida(i);
    const correcta = pregunta.opciones[i].correcta;
    acciones.registrarRespuesta(pregunta.id, correcta);
    onRespondida?.(correcta);
  };
  const opcion = elegida !== null ? pregunta.opciones[elegida] : null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <p id={id} className="font-semibold">
        {numero !== undefined && <span className="mr-2 text-muted">{numero}.</span>}
        {pregunta.enunciado}
      </p>
      <div className="mt-3 grid gap-2" role="group" aria-labelledby={id}>
        {pregunta.opciones.map((o, i) => {
          const estado = elegida === null ? "neutro" : o.correcta ? "correcta" : elegida === i ? "incorrecta" : "neutro";
          return (
            <button
              key={i}
              type="button"
              onClick={() => responder(i)}
              disabled={elegida !== null}
              aria-pressed={elegida === i}
              className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors ${
                estado === "correcta"
                  ? "border-razon bg-razon-soft"
                  : estado === "incorrecta"
                    ? "border-instinto bg-instinto-soft"
                    : "border-line hover:border-brand hover:bg-surface-2 disabled:opacity-60 disabled:hover:border-line disabled:hover:bg-transparent"
              }`}
            >
              {estado === "correcta" && <Icon name="check" className="h-5 w-5 shrink-0 text-razon" label={ui.correcto} />}
              {estado === "incorrecta" && <Icon name="cerrar" className="h-5 w-5 shrink-0 text-instinto" label={ui.incorrecto} />}
              <span>{o.texto}</span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {opcion && (
          <p className="aparecer mt-3 rounded-xl bg-surface-2 px-4 py-3 text-[0.95rem]">
            <strong className={opcion.correcta ? "text-razon" : "text-instinto"}>{opcion.correcta ? ui.correcto : ui.incorrecto}.</strong>{" "}
            {opcion.explicacion}
            {!opcion.correcta && (
              <>
                {" "}
                <span className="text-muted">({pregunta.opciones.find((x) => x.correcta)?.explicacion})</span>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
