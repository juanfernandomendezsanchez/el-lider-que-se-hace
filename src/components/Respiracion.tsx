"use client";

import { useEffect, useState } from "react";
import { btnPrimario } from "./ui/estilos";

/** Respiración guiada: inhala 3 s, exhala 6 s. Sin animación si el usuario prefiere menos movimiento. */
export function Respiracion({
  ciclos,
  textos,
  onTerminar,
}: {
  ciclos: number;
  textos: { inhala: string; exhala: string; boton: string; listo: string };
  onTerminar?: () => void;
}) {
  const [fase, setFase] = useState<"quieto" | "inhala" | "exhala" | "listo">("quieto");
  const [ciclo, setCiclo] = useState(0);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (fase !== "inhala" && fase !== "exhala") return;
    const duracion = fase === "inhala" ? 3 : 6;
    if (segundos >= duracion) {
      if (fase === "inhala") {
        setFase("exhala");
        setSegundos(0);
      } else if (ciclo + 1 >= ciclos) {
        setFase("listo");
        onTerminar?.();
      } else {
        setCiclo((c) => c + 1);
        setFase("inhala");
        setSegundos(0);
      }
      return;
    }
    const t = setTimeout(() => setSegundos((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [fase, segundos, ciclo, ciclos, onTerminar]);

  const empezar = () => {
    setCiclo(0);
    setSegundos(0);
    setFase("inhala");
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative grid h-44 w-44 place-items-center">
        <div
          key={`${fase}-${ciclo}`}
          className={`absolute inset-0 rounded-full bg-razon-soft ring-2 ring-razon ${fase === "inhala" ? "inhala" : fase === "exhala" ? "exhala" : ""}`}
          style={{ transform: fase === "quieto" || fase === "listo" ? "scale(0.7)" : undefined }}
          aria-hidden="true"
        />
        <div className="relative" aria-live="assertive">
          {fase === "inhala" && <p className="font-display text-xl font-semibold">{textos.inhala}</p>}
          {fase === "exhala" && <p className="font-display text-xl font-semibold">{textos.exhala}</p>}
          {(fase === "inhala" || fase === "exhala") && <p className="text-3xl font-semibold tabular-nums">{(fase === "inhala" ? 3 : 6) - segundos}</p>}
        </div>
      </div>
      {(fase === "inhala" || fase === "exhala") && (
        <p className="text-sm text-muted">
          {ciclo + 1} / {ciclos}
        </p>
      )}
      {fase === "listo" && (
        <p className="font-semibold text-razon" role="status">
          {textos.listo}
        </p>
      )}
      {(fase === "quieto" || fase === "listo") && (
        <button type="button" className={btnPrimario} onClick={empezar}>
          {textos.boton}
        </button>
      )}
    </div>
  );
}
