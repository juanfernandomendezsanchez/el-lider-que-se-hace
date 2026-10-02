import type { Metadata } from "next";
import { getJSON } from "@/content/load";

export const metadata: Metadata = { title: "Para saber más" };

type Fuentes = {
  titulo: string;
  bajada: string;
  fuentes: { autor: string; obra: string; idea: string; dondeLoVes: string }[];
  avisos: { titulo: string; texto: string }[];
};

export default function SaberMas() {
  const d = getJSON<Fuentes>("fuentes.json");
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">{d.titulo}</h1>
      <p className="mt-3 text-lg text-muted">{d.bajada}</p>

      <div className="mt-8 grid gap-3">
        {d.avisos.map((a) => (
          <aside key={a.titulo} className="rounded-2xl border-l-4 border-emocion bg-emocion-soft p-5">
            <h2 className="text-lg font-semibold">{a.titulo}</h2>
            <p className="mt-1">{a.texto}</p>
          </aside>
        ))}
      </div>

      <ul className="mt-8 grid gap-4">
        {d.fuentes.map((f) => (
          <li key={f.autor} className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-xl font-semibold">{f.autor}</h2>
            <p className="italic text-muted">{f.obra}</p>
            <p className="mt-2">{f.idea}</p>
            <p className="mt-2 text-sm text-muted">{f.dondeLoVes}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
