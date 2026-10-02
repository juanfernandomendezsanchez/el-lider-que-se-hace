"use client";

import type { InteractivoId } from "@/content/schema";
import { CaminoPausa } from "./CaminoPausa";
import { FlipAntimodelos } from "./FlipAntimodelos";
import { HabitoSemana } from "./HabitoSemana";
import { HeredadoVsEntrenado } from "./HeredadoVsEntrenado";
import { MoldeQyQ } from "./MoldeQyQ";
import { Piramide } from "./Piramide";
import { PrincipiosCialdini } from "./PrincipiosCialdini";
import { Prueba20 } from "./Prueba20";
import { Reencuadre } from "./Reencuadre";
import { SalidaDigna } from "./SalidaDigna";
import { Sistema1vs2 } from "./Sistema1vs2";
import { TresPilotos } from "./TresPilotos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapa: Record<InteractivoId, React.ComponentType<{ datos: any }>> = {
  "heredado-vs-entrenado": HeredadoVsEntrenado,
  "flip-antimodelos": FlipAntimodelos,
  "prueba-20": Prueba20,
  piramide: Piramide,
  sistema1vs2: Sistema1vs2,
  "tres-pilotos": TresPilotos,
  reencuadre: Reencuadre,
  "molde-qyq": MoldeQyQ,
  "principios-cialdini": PrincipiosCialdini,
  "salida-digna": SalidaDigna,
  "habito-semana": HabitoSemana,
  "camino-pausa": CaminoPausa,
};

export function Interactivo({ id, datos }: { id: InteractivoId; datos: unknown }) {
  const Componente = mapa[id];
  return <Componente datos={datos} />;
}
