"use client";

import { usePlan } from "./PlanContext";

export default function MapCorridor() {
  const { plan } = usePlan();
  const statusCard = plan.cards.find((card) => card.id.includes("STS"));

  type ResourceNode = {
    id: string;
    label: string;
    lat: number;
    lng: number;
    types: string[];
  };

  const resourceNodes: ResourceNode[] = Array.isArray(statusCard?.front["nodes"])
    ? (statusCard.front["nodes"] as unknown[])
        .map((node) => {
          if (
            node &&
            typeof node === "object" &&
            "id" in node &&
            "label" in node &&
            "lat" in node &&
            "lng" in node &&
            "types" in node
          ) {
            const castNode = node as {
              id: unknown;
              label: unknown;
              lat: unknown;
              lng: unknown;
              types: unknown;
            };

            if (
              typeof castNode.id === "string" &&
              typeof castNode.label === "string" &&
              typeof castNode.lat === "number" &&
              typeof castNode.lng === "number" &&
              Array.isArray(castNode.types)
            ) {
              return {
                id: castNode.id,
                label: castNode.label,
                lat: castNode.lat,
                lng: castNode.lng,
                types: castNode.types.map(String),
              } satisfies ResourceNode;
            }
          }

          return null;
        })
        .filter(Boolean) as ResourceNode[]
    : [];

  return (
    <div className="card-frame p-4">
      <div className="font-display text-xl">Corridor</div>
      <p className="text-sm text-ink/80">
        Mapa esencial con origen, DP1..DP3 y destino. Mientras llega el render visual, listamos cada punto con coordenadas para
        imprimir en la carta.
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
        {plan.routes.base.alts.length > 0 && (
          <div className="mt-3 space-y-1 text-sm">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-olive">Alternativas</p>
            <ul className="list-disc pl-4 space-y-1">
              {plan.routes.base.alts.map((alt) => (
                <li key={alt.id}>{alt.id} · {alt.label}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-olive">Resource Nodes</p>
        <ul className="text-sm space-y-1">
          {resourceNodes.length > 0 ? (
            resourceNodes.map((node) => (
              <li key={node.id}>
                📍 {node.label} ({node.lat.toFixed(3)}, {node.lng.toFixed(3)}) · {node.types.join(",")}
              </li>
            ))
          ) : (
            <li>Agrega nodos en el wizard.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
