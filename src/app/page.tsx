import Link from "next/link";
import { BloqueDiagnostico, Continuar, RepasaHoy } from "@/components/Portada";
import { Icon } from "@/components/ui/Icon";
import { getAntimodelos, getJSON, getLecciones, getPreguntas } from "@/content/load";
import { S, clasesPiloto, type PilotoNombre } from "@/lib/sitio";

export default function Home() {
  const lecciones = getLecciones().map(({ id, slug, titulo, orden }) => ({ id, slug, titulo, orden }));
  const habitos = getJSON<{ habitos: { id: string; habilidad: string; entrenar: string }[] }>("interactivos/habito-semana.json").habitos;
  const pilotos = Object.entries(S.pilotos) as [PilotoNombre, { nombre: string; texto: string }][];

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="pt-10 pb-8 sm:pt-16">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brass">{S.portada.antetitulo}</p>
        <h1 className="mt-3 max-w-3xl text-[2.6rem] font-semibold sm:text-6xl">{S.portada.pregunta}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">{S.portada.bajada}</p>

        <ul className="mt-6 flex flex-wrap gap-2" aria-label={S.portada.pilotosTitulo}>
          {pilotos.map(([id, p]) => (
            <li key={id} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${clasesPiloto[id].borde} ${clasesPiloto[id].fondo}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${clasesPiloto[id].punto}`} aria-hidden="true" />
              <strong className={clasesPiloto[id].texto}>{p.nombre}</strong>
              <span className="hidden text-ink sm:inline">· {p.texto}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Accesos" className="grid gap-3 sm:grid-cols-3">
        {S.portada.accesos.map((a, i) => (
          <Link
            key={a.href}
            href={a.href}
            className={`group flex flex-col justify-between rounded-3xl border p-5 transition-colors sm:min-h-44 ${
              i === 0 ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface hover:border-brand"
            }`}
          >
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">{a.titulo}</h2>
              <p className={`mt-1.5 ${i === 0 ? "opacity-90" : "text-muted"}`}>{a.texto}</p>
            </div>
            <Icon name="flecha" className="mt-4 h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </section>

      <div className="mt-8 grid gap-6">
        <Continuar lecciones={lecciones} habitos={habitos} />
        <RepasaHoy preguntas={getPreguntas()} />
        <div className="grid gap-4 sm:grid-cols-2">
          <BloqueDiagnostico nombres={Object.fromEntries(getAntimodelos().map((a) => [a.id, a.nombre]))} />
          <Link href="/cerebros/" className="group flex h-full flex-col justify-between rounded-3xl border border-line bg-surface p-5 hover:border-brand">
            <span>
              <span className="block font-display text-2xl font-semibold">{S.portada.cerebros.titulo}</span>
              <span className="mt-1 block text-muted">{S.portada.cerebros.texto}</span>
            </span>
            <span className="mt-4 inline-flex items-center gap-2 font-semibold text-brand">
              {S.portada.cerebros.boton} <Icon name="flecha" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>

      <p className="mx-auto mt-14 max-w-2xl text-center font-display text-2xl italic text-muted">{S.portada.cierre}</p>
    </div>
  );
}
