"use client";

import { ui } from "@/lib/sitio";
import { useState } from "react";
import { btnPrimario } from "../ui/estilos";

type Datos = {
  pregunta: string;
  respuesta: number;
  boton: string;
  etiquetaHeredado: string;
  etiquetaEntrenado: string;
  revelado: string;
  historiaTitulo: string;
  momentos: string[];
  delegados: { nombre: string; momentos: string[] }[];
};

export function HeredadoVsEntrenado({ datos }: { datos: Datos }) {
  const [valor, setValor] = useState(70);
  const [revelado, setRevelado] = useState(false);
  const [momento, setMomento] = useState(0);
  const mostrado = revelado ? datos.respuesta : valor;

  return (
    <div className="grid gap-6">
      <div>
        <label htmlFor="heredado" className="block font-semibold">
          {datos.pregunta}
        </label>
        <div className="mt-4 flex h-12 overflow-hidden rounded-xl text-sm font-semibold" aria-hidden="true">
          <div className="flex items-center justify-center bg-brand text-brand-ink transition-all duration-500" style={{ width: `${mostrado}%` }}>
            {mostrado >= 18 && `${datos.etiquetaHeredado} ${mostrado}%`}
          </div>
          <div className="flex flex-1 items-center justify-center bg-razon-soft text-razon">
            {100 - mostrado >= 18 && `${datos.etiquetaEntrenado} ${100 - mostrado}%`}
          </div>
        </div>
        <input
          id="heredado"
          type="range"
          min={0}
          max={100}
          step={5}
          value={valor}
          disabled={revelado}
          onChange={(e) => setValor(Number(e.target.value))}
          aria-valuetext={`${valor} ${ui.porcentajeHeredado}`}
          className="mt-3 w-full accent-[var(--brand)]"
        />
        {!revelado ? (
          <button type="button" className={`${btnPrimario} mt-3`} onClick={() => setRevelado(true)}>
            {datos.boton}
          </button>
        ) : (
          <p className="aparecer mt-3 rounded-xl bg-surface-2 p-4" role="status">
            {datos.revelado}
          </p>
        )}
      </div>

      {revelado && (
        <div className="aparecer">
          <p className="font-semibold">{datos.historiaTitulo}</p>
          <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label={datos.historiaTitulo}>
            {datos.momentos.map((m, i) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={momento === i}
                onClick={() => setMomento(i)}
                className="min-h-10 rounded-full border border-line px-4 text-sm aria-selected:border-brand aria-selected:bg-brand aria-selected:font-semibold aria-selected:text-brand-ink"
              >
                {i + 1}. {m}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2" role="tabpanel">
            {datos.delegados.map((d) => (
              <div key={d.nombre} className="rounded-xl border border-line p-4">
                <p className="text-sm font-semibold text-muted">{d.nombre}</p>
                <p key={momento} className="aparecer mt-1">
                  {d.momentos[momento]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
