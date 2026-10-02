import type { Metadata } from "next";
import { DetectaSecuestro } from "@/components/gimnasio/Gimnasio";
import { getJSON } from "@/content/load";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const datos = () => getJSON<Record<string, any>>("gimnasio.json").secuestro;

export function generateMetadata(): Metadata {
  return { title: datos().titulo };
}

export default function Pagina() {
  const d = datos();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <h1 className="mb-4 text-3xl font-semibold sm:text-4xl">{d.titulo}</h1>
      <DetectaSecuestro datos={d} />
    </div>
  );
}
