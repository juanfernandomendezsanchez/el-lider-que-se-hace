"use client";

import { useState } from "react";
import { ui } from "@/lib/sitio";
import { Respiracion } from "../Respiracion";
import { opcion } from "../ui/estilos";

type Opcion = { texto: string; correcta: boolean; explicacion: string };
type Datos = {
  notar: { titulo: string; texto: string; senales: string[]; cierre: string };
  frenar: { titulo: string; texto: string; inhala: string; exhala: string; boton: string; listo: string; cierre: string };
  reencuadrar: { titulo: string; texto: string; casos: { amenaza: string; opciones: Opcion[] }[] };
};

export function Reencuadre({ datos }: { datos: Datos }) {
  const [senales, setSenales] = useState<string[]>([]);
  const [respiro, setRespiro] = useState(false);
  const [elegidas, setElegidas] = useState<Record<number, number>>({});

  return (
    <div className="grid gap-8">
      <div>
        <h3 className="text-lg font-semibold">{datos.notar.titulo}</h3>
        <p className="mt-1">{datos.notar.texto}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {datos.notar.senales.map((s) => {
            const on = senales.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setSenales((x) => (on ? x.filter((y) => y !== s) : [...x, s]))}
                className="min-h-10 rounded-full border border-line px-4 text-sm aria-pressed:border-emocion aria-pressed:bg-emocion-soft aria-pressed:font-semibold"
              >
                {s}
              </button>
            );
          })}
        </div>
        {senales.length > 0 && <p className="aparecer mt-3 text-sm text-muted">{datos.notar.cierre}</p>}
      </div>

      <div>
        <h3 className="text-lg font-semibold">{datos.frenar.titulo}</h3>
        <p className="mt-1">{datos.frenar.texto}</p>
        <div className="mt-4">
          <Respiracion ciclos={3} textos={datos.frenar} onTerminar={() => setRespiro(true)} />
        </div>
        {respiro && <p className="aparecer mt-3 text-center text-sm text-muted">{datos.frenar.cierre}</p>}
      </div>

      <div>
        <h3 className="text-lg font-semibold">{datos.reencuadrar.titulo}</h3>
        <p className="mt-1">{datos.reencuadrar.texto}</p>
        <div className="mt-3 grid gap-4">
          {datos.reencuadrar.casos.map((c, i) => {
            const e = elegidas[i];
            return (
              <div key={c.amenaza} className="rounded-xl border border-line p-4">
                <p className="font-semibold text-instinto">{c.amenaza}</p>
                <div className="mt-2 grid gap-2">
                  {c.opciones.map((o, j) => (
                    <button
                      key={o.texto}
                      type="button"
                      disabled={e !== undefined}
                      onClick={() => setElegidas((x) => ({ ...x, [i]: j }))}
                      className={`${opcion} ${e !== undefined && o.correcta ? "!border-razon !bg-razon-soft" : ""} ${e === j && !o.correcta ? "!border-instinto !bg-instinto-soft" : ""}`}
                    >
                      {o.texto}
                    </button>
                  ))}
                </div>
                {e !== undefined && (
                  <p className="aparecer mt-2 text-sm" aria-live="polite">
                    <strong>{c.opciones[e].correcta ? ui.correcto : ui.incorrecto}.</strong> {c.opciones[e].explicacion}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
