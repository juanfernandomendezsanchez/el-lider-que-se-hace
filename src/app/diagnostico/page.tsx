import type { Metadata } from "next";
import { Diagnostico } from "@/components/Diagnostico";
import { getAntimodelos, getDiagnostico, getLecciones } from "@/content/load";

export const metadata: Metadata = { title: "¿Qué delegado eres hoy?" };

export default function DiagnosticoPage() {
  const datos = getDiagnostico();
  const lecciones = Object.fromEntries(getLecciones().map((l) => [l.id, { slug: l.slug, titulo: l.titulo, orden: l.orden }]));
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="mb-4 text-4xl font-semibold sm:text-5xl">{datos.titulo}</h1>
      <Diagnostico datos={datos} antimodelos={getAntimodelos()} lecciones={lecciones} />
    </div>
  );
}
