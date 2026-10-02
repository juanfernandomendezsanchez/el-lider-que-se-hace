import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Interactivo } from "@/components/interactivos/Interactivo";
import { Reproductor, type Pieza } from "@/components/leccion/Reproductor";
import { getAntimodelos, getJSON, getLeccion, getLecciones, getPreguntas } from "@/content/load";
import type { InteractivoId } from "@/content/schema";
import { partirEnTarjetas } from "@/content/tarjetas";
import { S } from "@/lib/sitio";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLecciones().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const l = getLeccion((await params).slug);
  return { title: l?.titulo, description: l?.ideaClave };
}

/** Datos que necesita cada elemento interactivo; todos vienen de /content. */
function datosInteractivo(id: InteractivoId) {
  if (id === "flip-antimodelos") {
    const lecciones = Object.fromEntries(getLecciones().map((l) => [l.id, { slug: l.slug, titulo: l.titulo, orden: l.orden }]));
    return { antimodelos: getAntimodelos(), lecciones };
  }
  if (id === "camino-pausa") return getJSON("pausa.json");
  return getJSON(`interactivos/${id}.json`);
}

export default async function LeccionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const leccion = getLeccion(slug);
  if (!leccion) notFound();

  const lecciones = getLecciones();
  const i = lecciones.findIndex((l) => l.id === leccion.id);
  const siguiente = lecciones[i + 1];

  // Cada tarjeta de texto se renderiza en el servidor; el reproductor solo las muestra de una en una.
  const piezas: Pieza[] = partirEnTarjetas(leccion.cuerpo).map((t) =>
    t.tipo === "interactivo"
      ? t
      : { tipo: "texto", nodo: <MDXRemote source={t.fuente} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} components={{ Interactivo: () => null }} /> },
  );

  return (
    <Reproductor
      key={leccion.id}
      leccion={{
        id: leccion.id,
        orden: leccion.orden,
        total: lecciones.length,
        titulo: leccion.titulo,
        modulo: S.modulos.find((m) => m.id === leccion.modulo)?.titulo ?? "",
        ideaClave: leccion.ideaClave,
        minutos: leccion.minutos,
        interactivoTitulo: leccion.interactivoTitulo,
        ejemploMUN: leccion.ejemploMUN,
        pruebaloHoy: leccion.pruebaloHoy,
      }}
      piezas={piezas}
      interactivo={<Interactivo id={leccion.interactivo} datos={datosInteractivo(leccion.interactivo)} />}
      preguntas={getPreguntas().filter((p) => p.leccionId === leccion.id)}
      siguiente={siguiente ? { slug: siguiente.slug, titulo: siguiente.titulo } : undefined}
    />
  );
}
