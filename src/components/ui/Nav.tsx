"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { S, ui } from "@/lib/sitio";
import { Icon } from "./Icon";

function activo(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.replace(/\/$/, ""));
}

function ThemeToggle() {
  const [oscuro, setOscuro] = useState<boolean | null>(null);
  useEffect(() => {
    setOscuro(document.documentElement.dataset.theme === "dark");
  }, []);
  const cambiar = () => {
    const nuevo = !oscuro;
    setOscuro(nuevo);
    document.documentElement.dataset.theme = nuevo ? "dark" : "light";
    try {
      localStorage.setItem("llqsh:tema", nuevo ? "dark" : "light");
    } catch {
      /* sin almacenamiento: el cambio dura hasta cerrar */
    }
  };
  return (
    <button
      type="button"
      onClick={cambiar}
      className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
      aria-label={ui.tema}
      title={ui.tema}
    >
      <Icon name={oscuro ? "sol" : "luna"} />
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur no-print">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        {ui.saltar}
      </a>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <Logo />
          <span>{S.nombre}</span>
        </Link>
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {S.navEscritorio.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={activo(pathname, n.href) ? "page" : undefined}
                  className="rounded-full px-3 py-2 text-[0.95rem] text-muted hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-surface-2 aria-[current=page]:font-semibold aria-[current=page]:text-ink"
                >
                  {n.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegación inferior" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur md:hidden no-print">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {S.nav.map((n) => (
          <li key={n.href}>
            <Link
              href={n.href}
              aria-current={activo(pathname, n.href) ? "page" : undefined}
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[0.7rem] leading-tight text-muted aria-[current=page]:font-semibold aria-[current=page]:text-brand"
            >
              <Icon name={n.icono} className="h-5 w-5" />
              <span className="text-center">{n.texto}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Marca propia: tres puntos (instinto, emoción, razón) que convergen en uno. Sin emblemas oficiales. */
export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="var(--brand)" />
      <circle cx="10" cy="12" r="3" fill="var(--instinto)" stroke="var(--surface)" strokeWidth="1" />
      <circle cx="22" cy="12" r="3" fill="var(--emocion-fill)" stroke="var(--surface)" strokeWidth="1" />
      <circle cx="16" cy="22" r="4" fill="var(--razon)" stroke="var(--surface)" strokeWidth="1" />
    </svg>
  );
}
