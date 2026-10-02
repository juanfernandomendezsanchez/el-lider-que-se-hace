import type { Metadata } from "next";
import Link from "next/link";
import { Racha } from "@/components/gimnasio/Gimnasio";
import { Icon } from "@/components/ui/Icon";
import { getJSON } from "@/content/load";
import { ui } from "@/lib/sitio";

export const metadata: Metadata = { title: "Gimnasio" };

type G = { titulo: string; bajada: string; rachaTitulo: string; rachaDias: string; rachaDia: string; rachaCero: string; rachaNota: string; hoyListo: string; herramientas: { href: string; titulo: string; texto: string; minutos: number }[] };

export default function Gimnasio() {
  const g = getJSON<G>("gimnasio.json");
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">{g.titulo}</h1>
      <p className="mt-3 text-lg text-muted">{g.bajada}</p>
      <div className="mt-6">
        <Racha textos={g} />
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {g.herramientas.map((h) => (
          <li key={h.href}>
            <Link href={h.href} className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-5 hover:border-brand">
              <span>
                <span className="block font-display text-xl font-semibold">{h.titulo}</span>
                <span className="mt-1 block text-muted">{h.texto}</span>
              </span>
              <span className="mt-3 flex items-center justify-between text-sm text-muted">
                ~{h.minutos} {ui.minutos}
                <Icon name="flecha" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
