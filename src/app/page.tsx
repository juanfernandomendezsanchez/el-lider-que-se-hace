import Link from "next/link";
import { Hoy, RepasaHoy } from "@/components/Portada";
import { Icon } from "@/components/ui/Icon";
import { getJSON, getLecciones, getPreguntas } from "@/content/load";
import { S, clasesPiloto, type PilotoNombre } from "@/lib/sitio";

export default function Home() {
  const lecciones = getLecciones().map(({ id, slug, titulo, orden, minutos }) => ({ id, slug, titulo, orden, minutos }));
  const habitos = getJSON<{ habitos: { id: string; habilidad: string; entrenar: string }[] }>("interactivos/habito-semana.json").habitos;
  const pilotos = Object.entries(S.pilotos) as [PilotoNombre, { nombre: string; texto: string }][];
  const [, practica, kit] = S.portada.accesos;
  const explora = [
    { href: practica.href, titulo: practica.titulo, texto: practica.texto, icono: "simulador" },
    { href: "/cerebros/", titulo: S.portada.cerebros.titulo, texto: S.portada.cerebros.texto, icono: "cerebro" },
    { href: "/diagnostico/", titulo: S.portada.diagnostico.titulo, texto: S.portada.diagnostico.texto, icono: "info" },
    { href: kit.href, titulo: kit.titulo, texto: kit.texto, icono: "kit" },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4">
      <section className="pt-8 pb-6 sm:pt-12">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brass">{S.portada.antetitulo}</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{S.portada.pregunta}</h1>
        <p className="mt-4 text-lg text-muted">{S.portada.bajada}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label={S.portada.pilotosTitulo}>
          {pilotos.map(([id, p]) => (
            <li key={id} title={p.texto} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${clasesPiloto[id].borde} ${clasesPiloto[id].fondo}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${clasesPiloto[id].punto}`} aria-hidden="true" />
              <strong className={clasesPiloto[id].texto}>{p.nombre}</strong>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6">
        <Hoy lecciones={lecciones} habitos={habitos} />
        <RepasaHoy preguntas={getPreguntas()} />
      </div>

      <section aria-labelledby="explora" className="mt-12">
        <h2 id="explora" className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
          {S.inicioUI.explora}
        </h2>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {explora.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="group flex items-center gap-4 p-4 hover:bg-surface-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface-2 text-brand group-hover:bg-surface">
                  <Icon name={e.icono} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{e.titulo}</span>
                  <span className="block truncate text-sm text-muted">{e.texto}</span>
                </span>
                <Icon name="flecha" className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mx-auto mt-14 max-w-xl text-center font-display text-xl italic text-muted">{S.portada.cierre}</p>
    </div>
  );
}
