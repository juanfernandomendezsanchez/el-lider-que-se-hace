import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EscenarioPlayer } from "@/components/simulador/Escenario";
import { getEscenarios } from "@/content/load";
import { S } from "@/lib/sitio";

export const dynamicParams = false;

export function generateStaticParams() {
  return getEscenarios().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = getEscenarios().find((x) => x.slug === slug);
  return { title: e?.titulo, description: e?.resumen };
}

export default async function EscenarioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const escenario = getEscenarios().find((e) => e.slug === slug);
  if (!escenario) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <nav className="text-sm text-muted" aria-label="Migas">
        <Link href="/simulador/" className="hover:underline">
          {S.simuladorUI.titulo}
        </Link>
      </nav>
      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{escenario.titulo}</h1>
      <p className="mt-2 text-muted">{escenario.resumen}</p>
      <div className="mt-6">
        <EscenarioPlayer key={escenario.id} escenario={escenario} />
      </div>
    </div>
  );
}
