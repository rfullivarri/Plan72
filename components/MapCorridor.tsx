"use client";

import { usePlan } from "./PlanContext";

export default function MapCorridor() {
  const { plan } = usePlan();

  return (
    <div className="card-frame p-4">
      <div className="font-display text-xl">Corridor</div>
      <p className="text-sm text-ink/80">
        Map placeholder for decision points y Resource Nodes. Por ahora mostramos la lista con mock pin.
      </p>
      <div className="mt-3 h-40 bg-[repeating-linear-gradient(45deg,var(--paper-shadow),var(--paper-shadow)_10px,var(--paper-edge)_10px,var(--paper-edge)_20px)] border-2 border-ink rounded-lg p-3 overflow-y-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-olive">Corridor</p>
        <ul className="text-sm space-y-1">
          {plan.routes.base.corridor.map((point, idx) => (
            <li key={point.label ?? idx}>
              {String(idx + 1).padStart(2, "0")}. {point.label} — {point.lat.toFixed(3)}, {point.lng.toFixed(3)}
            </li>
          ))}
        </ul>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-olive">Resource Nodes</p>
        <ul className="text-sm space-y-1">
          {plan.cards
            .find((card) => card.id.includes("STS"))?.front["nodes"]
            ?.map((node: any) => (
              <li key={node.id}>
                📍 {node.label} ({node.lat.toFixed(3)}, {node.lng.toFixed(3)}) · {node.types.join(",")}
              </li>
            )) || <li>Agrega nodos en el wizard.</li>}
        </ul>
      </div>
    </div>
  );
}
