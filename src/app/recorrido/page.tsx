import type { Metadata } from "next";
import { ListaInsignias } from "@/components/Insignias";
import { ProgresoRecorrido } from "@/components/leccion/Leccion";
import { Ruta } from "@/components/leccion/Ruta";
import { getLecciones } from "@/content/load";
import { S } from "@/lib/sitio";

export const metadata: Metadata = { title: "Recorrido" };

export default function Recorrido() {
  const lecciones = getLecciones();
  return (
    <div className="mx-auto max-w-xl px-4 pt-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">{S.recorrido.titulo}</h1>
      <p className="mt-3 text-lg text-muted">{S.recorrido.bajada}</p>
      <ProgresoRecorrido ids={lecciones.map((l) => l.id)} />

      <Ruta lecciones={lecciones.map(({ id, slug, titulo, orden, minutos, modulo }) => ({ id, slug, titulo, orden, minutos, modulo }))} />

      <details className="group mt-14 rounded-3xl border border-line bg-surface p-5">
        <summary className="cursor-pointer list-none text-xl font-semibold marker:hidden">
          <span className="inline-flex items-center gap-2">
            {S.recorrido.insigniasTitulo}
            <span className="text-muted transition-transform group-open:rotate-90" aria-hidden="true">
              ›
            </span>
          </span>
        </summary>
        <div className="mt-4">
          <ListaInsignias />
        </div>
      </details>
    </div>
  );
}
