import type { MetadataRoute } from "next";
import { BASE } from "@/lib/base";
import { S } from "@/lib/sitio";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: S.nombre,
    short_name: "Líder MUN",
    description: S.descripcion,
    lang: "es",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#26375a",
    icons: [
      { src: `${BASE}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE}/icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
