"use client";

import { useEffect, useState } from "react";
import { S, ui } from "@/lib/sitio";
import { Icon } from "./ui/Icon";
import { btnPrimario } from "./ui/estilos";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let eventoInstalar: EventoInstalar | null = null;
const oyentesInstalar = new Set<() => void>();

/** Registra el service worker (solo en producción) y avisa cuando no hay conexión. */
export function RegistrarSW() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* sin service worker la plataforma funciona igual, solo que no sin conexión */
      });
    }
    const guardar = (e: Event) => {
      e.preventDefault();
      eventoInstalar = e as EventoInstalar;
      oyentesInstalar.forEach((f) => f());
    };
    const cambio = () => setOffline(!navigator.onLine);
    cambio();
    window.addEventListener("beforeinstallprompt", guardar);
    window.addEventListener("online", cambio);
    window.addEventListener("offline", cambio);
    return () => {
      window.removeEventListener("beforeinstallprompt", guardar);
      window.removeEventListener("online", cambio);
      window.removeEventListener("offline", cambio);
    };
  }, []);

  if (!offline) return null;
  return (
    <p role="status" className="bg-surface-2 px-4 py-2 text-center text-sm">
      {ui.offline}
    </p>
  );
}

export function EstadoOffline() {
  const [listo, setListo] = useState(false);
  const [puedeInstalar, setPuedeInstalar] = useState(false);

  useEffect(() => {
    const actualizar = () => setPuedeInstalar(!!eventoInstalar);
    actualizar();
    oyentesInstalar.add(actualizar);
    if ("serviceWorker" in navigator) navigator.serviceWorker.ready.then(() => setListo(true)).catch(() => {});
    return () => {
      oyentesInstalar.delete(actualizar);
    };
  }, []);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      {listo && (
        <p className="flex items-center gap-2 font-semibold text-razon">
          <Icon name="check" className="h-4 w-4" /> {S.mas.offlineListo}
        </p>
      )}
      {puedeInstalar && (
        <button
          type="button"
          className={btnPrimario}
          onClick={async () => {
            await eventoInstalar?.prompt();
            eventoInstalar = null;
            setPuedeInstalar(false);
          }}
        >
          {S.mas.instalar}
        </button>
      )}
    </div>
  );
}
