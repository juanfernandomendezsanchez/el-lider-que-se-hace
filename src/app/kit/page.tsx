import type { Metadata } from "next";
import type { DatosPausa } from "@/components/interactivos/CaminoPausa";
import { ChecklistPrevio, ReflexionPosterior, TarjetaPausa } from "@/components/Kit";
import { getJSON } from "@/content/load";

export const metadata: Metadata = { title: "Kit para tu próximo modelo" };

export default function KitPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kit = getJSON<any>("kit.json");
  const pausa = getJSON<DatosPausa>("pausa.json");
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <div className="no-print">
        <h1 className="text-4xl font-semibold sm:text-5xl">{kit.titulo}</h1>
        <p className="mt-3 text-lg text-muted">{kit.bajada}</p>
        <nav aria-label="Secciones" className="mt-6 flex flex-wrap gap-2 text-sm">
          {Object.entries(kit.secciones as Record<string, string>).map(([k, v]) => (
            <a key={k} href={`#${k}`} className="rounded-full border border-line bg-surface px-3 py-1.5 hover:border-brand">
              {v}
            </a>
          ))}
        </nav>
      </div>

      <section id="antes" className="kit-seccion mt-10 scroll-mt-20" aria-labelledby="h-antes">
        <h2 id="h-antes" className="mb-3 text-3xl font-semibold">
          {kit.secciones.antes}
        </h2>
        <ChecklistPrevio datos={kit.checklist} />
      </section>

      <section id="durante" className="kit-tarjeta mt-12 scroll-mt-20" aria-labelledby="h-durante">
        <h2 id="h-durante" className="mb-3 text-3xl font-semibold no-print">
          {kit.secciones.durante}
        </h2>
        <TarjetaPausa pausa={pausa} datos={kit.tarjeta} />
      </section>

      <section id="despues" className="kit-seccion mt-12 scroll-mt-20" aria-labelledby="h-despues">
        <h2 id="h-despues" className="mb-3 text-3xl font-semibold">
          {kit.secciones.despues}
        </h2>
        <ReflexionPosterior datos={kit.reflexion} />
      </section>
    </div>
  );
}
