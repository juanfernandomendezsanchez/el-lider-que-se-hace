import type { Metadata } from "next";
import Link from "next/link";
import { EstadoOffline } from "@/components/Pwa";
import { Icon } from "@/components/ui/Icon";
import { S } from "@/lib/sitio";

export const metadata: Metadata = { title: "Más" };

export default function Mas() {
  const t = S.mas;
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">{t.titulo}</h1>
      <ul className="mt-8 grid gap-2">
        {t.enlaces.map((e) => (
          <li key={e.href}>
            <Link href={e.href} className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 hover:border-brand">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{e.titulo}</span>
                <span className="block text-sm text-muted">{e.texto}</span>
              </span>
              <Icon name="flecha" className="h-5 w-5 text-muted transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
      <section className="mt-8 rounded-2xl border border-line bg-surface-2 p-5" aria-labelledby="offline">
        <h2 id="offline" className="text-xl font-semibold">
          {t.instalarTitulo}
        </h2>
        <p className="mt-1">{t.instalarTexto}</p>
        <EstadoOffline />
      </section>
    </div>
  );
}
