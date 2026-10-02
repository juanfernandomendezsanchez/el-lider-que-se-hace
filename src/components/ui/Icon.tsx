const paths: Record<string, string> = {
  inicio: "M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5",
  recorrido: "M5 19c0-4 3-4 7-4s7 0 7-4-3-4-7-4H8M8 7l2-2M8 7l2 2M5 19h.01",
  cerebro:
    "M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h1V4H9Zm6 0a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h-1V4h1Z",
  simulador: "M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  libro: "M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5Zm0 15a2 2 0 0 0 2 2h13v-4",
  sol: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z",
  luna: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  flecha: "M5 12h14m-6-6 6 6-6 6",
  flechaIzq: "M19 12H5m6-6-6 6 6 6",
  reloj: "M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
  expandir: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  insignia: "M12 3 14.5 8l5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9L9.5 8 12 3Z",
  candado: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5V11Z",
  cerrar: "M6 6l12 12M18 6 6 18",
  kit: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 7h16v12H4V7Zm0 5h16",
  mas: "M5 6h.01M12 6h.01M19 6h.01M5 12h.01M12 12h.01M19 12h.01M5 18h.01M12 18h.01M19 18h.01",
  imprimir: "M7 9V3h10v6M7 17H5v-6h14v6h-2M7 14h10v7H7v-7Z",
  descargar: "M12 4v11m-5-5 5 5 5-5M5 20h14",
  fuego: "M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9Z",
  info: "M12 8h.01M11 12h1v5h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z",
};

export function Icon({ name, className = "h-5 w-5", label }: { name: string; className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <path d={paths[name] ?? paths.info} />
    </svg>
  );
}
