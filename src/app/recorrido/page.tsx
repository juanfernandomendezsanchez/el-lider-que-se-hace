import type { Metadata } from "next";
import Link from "next/link";
import { ListaInsignias } from "@/components/Insignias";
import { EstadoLeccion, ProgresoRecorrido } from "@/components/leccion/Leccion";
import { Icon } from "@/components/ui/Icon";
import { getLecciones } from "@/content/load";
import { S, ui } from "@/lib/sitio";

export const metadata: Metadata = { title: "Recorrido" };

export default function Recorrido() {
  const lecciones = getLecciones();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">{S.recorrido.titulo}</h1>
      <p className="mt-3 text-lg text-muted">{S.recorrido.bajada}</p>
      <ProgresoRecorrido ids={lecciones.map((l) => l.id)} />

      {S.modulos.map((m) => (
        <section key={m.id} aria-labelledby={`m-${m.id}`} className="mt-10">
          <h2 id={`m-${m.id}`} className="text-2xl font-semibold">
            {m.titulo}
          </h2>
          <p className="text-muted">{m.texto}</p>
          <ol className="mt-4 grid gap-2">
            {lecciones
              .filter((l) => l.modulo === m.id)
              .map((l) => (
                <li key={l.id}>
                  <Link href={`/recorrido/${l.slug}/`} className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-brand">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 font-display text-lg font-semibold" aria-hidden="true">
                      {l.orden}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">
                        <span className="sr-only">
                          {ui.leccion} {l.orden}:{" "}
                        </span>
                        {l.titulo}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">
                        <span>
                          ~{l.minutos} {ui.minutos}
                        </span>
                        <EstadoLeccion id={l.id} />
                      </span>
                    </span>
                    <Icon name="flecha" className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
          </ol>
        </section>
      ))}

      <section aria-labelledby="insignias" className="mt-12">
        <h2 id="insignias" className="mb-4 text-2xl font-semibold">
          {S.recorrido.insigniasTitulo}
        </h2>
        <ListaInsignias />
      </section>
    </div>
  );
}
