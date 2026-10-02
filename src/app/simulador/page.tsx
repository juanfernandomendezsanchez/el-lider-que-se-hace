import type { Metadata } from "next";
import Link from "next/link";
import { EstadoEscenario } from "@/components/simulador/Escenario";
import { Icon } from "@/components/ui/Icon";
import { getEscenarios } from "@/content/load";
import { S } from "@/lib/sitio";

export const metadata: Metadata = { title: "Simulador de crisis" };

export default function Simulador() {
  const escenarios = getEscenarios();
  const t = S.simuladorUI;
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">{t.titulo}</h1>
      <p className="mt-3 text-lg text-muted">{t.bajada}</p>
      <ul className="mt-8 grid gap-3">
        {escenarios.map((e) => (
          <li key={e.id}>
            <Link href={`/simulador/${e.slug}/`} className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 hover:border-brand">
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-semibold">{e.titulo}</span>
                <span className="mt-1 block text-muted">{e.resumen}</span>
                <span className="mt-2 block">
                  <EstadoEscenario id={e.id} />
                </span>
              </span>
              <Icon name="flecha" className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
