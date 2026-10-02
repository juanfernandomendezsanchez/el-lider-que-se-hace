import type { Metadata } from "next";
import { ConstructorPropuesta, JuegoClasificar, Principios } from "@/components/persuasion/Laboratorio";
import { getJSON } from "@/content/load";

export const metadata: Metadata = { title: "Laboratorio de persuasión" };

type Lab = {
  titulo: string;
  bajada: string;
  secciones: Record<"principios" | "clasificar" | "claves" | "constructor" | "etica", string>;
  principiosIntro: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clasificar: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor: any;
  etica: { intro: string; persuadir: { titulo: string; puntos: string[] }; manipular: { titulo: string; puntos: string[] }; protegerte: { titulo: string; texto: string } };
};
type Cialdini = { porQue: string; enMUN: string; principios: { id: string; nombre: string; porQue: string; enMUN: string }[] };
type Claves = { claves: { nombre: string; texto: string; ejemplo: string }[] };

export default function Persuasion() {
  const lab = getJSON<Lab>("persuasion.json");
  const c = getJSON<Cialdini>("interactivos/principios-cialdini.json");
  const claves = getJSON<Claves>("interactivos/salida-digna.json").claves;
  const s = lab.secciones;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">{lab.titulo}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{lab.bajada}</p>

      <nav aria-label="Secciones" className="mt-6 flex flex-wrap gap-2 text-sm">
        {(Object.keys(s) as (keyof typeof s)[]).map((k) => (
          <a key={k} href={`#${k}`} className="rounded-full border border-line bg-surface px-3 py-1.5 hover:border-brand">
            {s[k]}
          </a>
        ))}
      </nav>

      <section id="principios" className="mt-10 scroll-mt-20" aria-labelledby="h-principios">
        <h2 id="h-principios" className="mb-3 text-3xl font-semibold">
          {s.principios}
        </h2>
        <Principios intro={lab.principiosIntro} principios={c.principios} porQue={c.porQue} enMUN={c.enMUN} />
      </section>

      <section id="clasificar" className="mt-12 scroll-mt-20" aria-labelledby="h-clasificar">
        <h2 id="h-clasificar" className="mb-3 text-3xl font-semibold">
          {s.clasificar}
        </h2>
        <JuegoClasificar datos={lab.clasificar} principios={c.principios} />
      </section>

      <section id="claves" className="mt-12 scroll-mt-20" aria-labelledby="h-claves">
        <h2 id="h-claves" className="mb-3 text-3xl font-semibold">
          {s.claves}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {claves.map((k) => (
            <li key={k.nombre} className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-display text-lg font-semibold">{k.nombre}</p>
              <p className="text-sm text-muted">{k.texto}</p>
              <p className="mt-2 text-[0.95rem] italic">{k.ejemplo}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="constructor" className="mt-12 scroll-mt-20" aria-labelledby="h-constructor">
        <h2 id="h-constructor" className="mb-3 text-3xl font-semibold">
          {s.constructor}
        </h2>
        <ConstructorPropuesta datos={lab.constructor} />
      </section>

      <section id="etica" className="mt-12 scroll-mt-20" aria-labelledby="h-etica">
        <h2 id="h-etica" className="mb-3 text-3xl font-semibold">
          {s.etica}
        </h2>
        <p>{lab.etica.intro}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-razon bg-razon-soft p-5">
            <h3 className="text-xl font-semibold text-razon">{lab.etica.persuadir.titulo}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {lab.etica.persuadir.puntos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-instinto bg-instinto-soft p-5">
            <h3 className="text-xl font-semibold text-instinto">{lab.etica.manipular.titulo}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {lab.etica.manipular.puntos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
        <aside className="mt-3 rounded-2xl bg-surface-2 p-5">
          <h3 className="text-lg font-semibold">{lab.etica.protegerte.titulo}</h3>
          <p className="mt-1">{lab.etica.protegerte.texto}</p>
        </aside>
      </section>
    </div>
  );
}
