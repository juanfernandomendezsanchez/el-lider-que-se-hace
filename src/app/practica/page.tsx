import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { S } from "@/lib/sitio";

export const metadata: Metadata = { title: "Practicar" };

export default function Practica() {
  const t = S.practica;
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">{t.titulo}</h1>
      <p className="mt-3 text-lg text-muted">{t.bajada}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {t.tarjetas.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-surface p-5 hover:border-brand">
              <span>
                <span className="block font-display text-2xl font-semibold">{c.titulo}</span>
                <span className="mt-1 block text-muted">{c.texto}</span>
              </span>
              <Icon name="flecha" className="mt-4 h-5 w-5 text-muted transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
