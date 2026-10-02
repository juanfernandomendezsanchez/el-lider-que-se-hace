"use client";

import { useProgreso } from "@/lib/progress";
import { ui } from "@/lib/sitio";

export function ProgresoRecorrido({ ids }: { ids: string[] }) {
  const p = useProgreso();
  const n = ids.filter((id) => p.lecciones[id]?.completada).length;
  return (
    <div className="mt-6 max-w-md">
      <p className="text-sm text-muted">
        {n} {ui.deLecciones}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={n} aria-label={ui.progreso}>
        <div className="h-full rounded-full bg-razon transition-all" style={{ width: `${(n / ids.length) * 100}%` }} />
      </div>
    </div>
  );
}
