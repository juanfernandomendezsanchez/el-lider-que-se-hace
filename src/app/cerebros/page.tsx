import type { Metadata } from "next";
import Link from "next/link";
import { DosCerebros } from "@/components/cerebros/DosCerebros";
import { getCerebros } from "@/content/load";
import { S, clasesPiloto } from "@/lib/sitio";

export const metadata: Metadata = { title: "Dos cerebros" };

export default function CerebrosPage() {
  const datos = getCerebros();
  const t = S.cerebrosUI;
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <h1 className="text-4xl font-semibold sm:text-5xl">{datos.titulo}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{datos.intro}</p>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Leyenda">
        {datos.leyenda.map((l) => (
          <li key={l.piloto} className="flex items-center gap-2 text-sm">
            <span className={`h-3 w-3 rounded-full ${clasesPiloto[l.piloto].punto}`} aria-hidden="true" />
            <strong className={clasesPiloto[l.piloto].texto}>{l.nombre}</strong>
            <span className="text-muted">{l.texto}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <DosCerebros datos={datos} textos={t} />
      </div>

      <details className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <summary className="cursor-pointer font-display text-xl font-semibold">{t.saberMas}</summary>
        <ul className="mt-3 grid gap-2">
          {datos.saberMas.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <Link href="/saber-mas/" className="mt-3 inline-block font-semibold text-brand underline underline-offset-2">
          {t.verFuentes}
        </Link>
      </details>
    </div>
  );
}
