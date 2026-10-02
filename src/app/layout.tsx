import type { Metadata, Viewport } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { BottomNav, Header } from "@/components/ui/Nav";
import { InsigniasWatcher } from "@/components/Insignias";
import { RegistrarSW } from "@/components/Pwa";
import { getJSON, getLecciones } from "@/content/load";
import { S } from "@/lib/sitio";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "opsz"], variable: "--font-fraunces", display: "swap" });
const source = Source_Sans_3({ subsets: ["latin"], variable: "--font-source", display: "swap" });

export const metadata: Metadata = {
  title: { default: S.nombre, template: `%s · ${S.nombre}` },
  description: S.descripcion,
  applicationName: S.nombre,
  appleWebApp: { capable: true, title: "Líder MUN", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#10141c" },
  ],
};

/** Aplica el tema guardado antes de pintar, para evitar un parpadeo. */
const temaInicial = `try{var t=localStorage.getItem("llqsh:tema");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const catalogo = getLecciones().map((l) => ({ id: l.id, modulo: l.modulo }));
  const extra = { checklistIds: getJSON<{ checklist: { items: { id: string }[] } }>("kit.json").checklist.items.map((i) => i.id) };
  return (
    <html lang="es" className={`${fraunces.variable} ${source.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaInicial }} />
      </head>
      <body className="min-h-dvh antialiased">
        <Header />
        <RegistrarSW />
        <InsigniasWatcher catalogo={catalogo} extra={extra} />
        <main id="contenido" className="pb-24 md:pb-12">
          {children}
        </main>
        <footer className="mx-auto max-w-6xl px-4 pb-28 text-sm text-muted md:pb-10">
          <p className="border-t border-line pt-6">{S.aviso}</p>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
