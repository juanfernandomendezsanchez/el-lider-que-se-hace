import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Interactivo } from "@/components/interactivos/Interactivo";
import { EstadoLeccion, RepasoLeccion } from "@/components/leccion/Leccion";
import { Icon } from "@/components/ui/Icon";
import { getAntimodelos, getJSON, getLeccion, getLecciones, getPreguntas } from "@/content/load";
import type { InteractivoId } from "@/content/schema";
import { S, ui } from "@/lib/sitio";

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
  const anterior = lecciones[i - 1];
  const siguiente = lecciones[i + 1];
  const preguntas = getPreguntas().filter((p) => p.leccionId === leccion.id);
  const modulo = S.modulos.find((m) => m.id === leccion.modulo);

  const bloqueInteractivo = (
    <section aria-labelledby="interactivo" className="not-prose my-8 rounded-3xl border border-line bg-surface p-5 sm:p-7">
      <h2 id="interactivo" className="text-2xl font-semibold">
        {leccion.interactivoTitulo}
      </h2>
      <div className="mt-4">
        <Interactivo id={leccion.interactivo} datos={datosInteractivo(leccion.interactivo)} />
      </div>
    </section>
  );
  const enLinea = leccion.cuerpo.includes("<Interactivo");

  return (
    <article className="mx-auto max-w-3xl px-4 pt-8">
      <nav aria-label={ui.migas} className="text-sm text-muted">
        <Link href="/recorrido/" className="hover:underline">
          {S.recorrido.titulo}
        </Link>{" "}
        · {modulo?.titulo}
      </nav>
      <p className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-wide text-brass">
        <span>
          {ui.leccion} {leccion.orden} {ui.de} {lecciones.length}
        </span>
        <span className="font-normal normal-case tracking-normal text-muted">
          ~{leccion.minutos} {ui.minutos}
        </span>
        <EstadoLeccion id={leccion.id} />
      </p>
      <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{leccion.titulo}</h1>

      <div className="mt-6 rounded-2xl border-l-4 border-brand bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{ui.ideaClave}</p>
        <p className="mt-1 font-display text-xl leading-snug sm:text-2xl">{leccion.ideaClave}</p>
      </div>

      <div className="prose-leccion mt-8">
        <MDXRemote
          source={leccion.cuerpo}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          components={{ Interactivo: () => bloqueInteractivo }}
        />
      </div>

      {!enLinea && bloqueInteractivo}

      <section aria-labelledby="ejemplo" className="mt-8 rounded-3xl bg-surface-2 p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-brass">{ui.ejemplo}</p>
        <h2 id="ejemplo" className="mt-1 text-2xl font-semibold">
          {leccion.ejemploMUN.titulo}
        </h2>
        <p className="mt-3">{leccion.ejemploMUN.situacion}</p>
        <p className="mt-2">{leccion.ejemploMUN.desarrollo}</p>
        <p className="mt-3 font-semibold">{leccion.ejemploMUN.leccion}</p>
      </section>

      <section aria-labelledby="pruebalo" className="mt-6 rounded-3xl border-2 border-dashed border-razon p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-razon">{ui.pruebaloHoy}</p>
        <h2 id="pruebalo" className="mt-1 text-2xl font-semibold">
          {leccion.pruebaloHoy.titulo}
        </h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          {leccion.pruebaloHoy.pasos.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </section>

      <RepasoLeccion
        key={leccion.id}
        leccionId={leccion.id}
        preguntas={preguntas}
        siguiente={siguiente ? { slug: siguiente.slug, titulo: siguiente.titulo } : undefined}
      />

      <nav aria-label="Lecciones" className="mt-10 flex justify-between gap-3 border-t border-line pt-6 text-sm">
        {anterior ? (
          <Link href={`/recorrido/${anterior.slug}/`} className="flex max-w-[48%] items-center gap-2 text-muted hover:text-ink">
            <Icon name="flechaIzq" className="h-4 w-4 shrink-0" /> {anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {siguiente && (
          <Link href={`/recorrido/${siguiente.slug}/`} className="flex max-w-[48%] items-center gap-2 text-right text-muted hover:text-ink">
            {siguiente.titulo} <Icon name="flecha" className="h-4 w-4 shrink-0" />
          </Link>
        )}
      </nav>
    </article>
  );
}
