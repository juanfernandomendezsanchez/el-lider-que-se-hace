import type { Metadata } from "next";
import { MiMapa } from "@/components/MiMapa";
import { getJSON, validarMapa } from "@/content/load";

export const metadata: Metadata = { title: "Mi mapa de líder" };

export default function MiMapaPage() {
  validarMapa();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datos = getJSON<any>("mapa-lider.json");
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">{datos.titulo}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{datos.bajada}</p>
      <div className="mt-8">
        <MiMapa datos={datos} />
      </div>
    </div>
  );
}
