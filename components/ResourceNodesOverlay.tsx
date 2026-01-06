"use client";

import { useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";

import { buildMockNodesForRoute, RESOURCE_NODE_LEGEND } from "@/lib/mockNodes";
import type { MockRouteResult } from "@/lib/mockRoute";
import type { Coordinate } from "@/lib/schema";

type LeafletLib = typeof import("leaflet");

type Props = {
  leafletLib: LeafletLib | null;
  mapRef: MutableRefObject<LeafletMap | null>;
  layerRef: MutableRefObject<LayerGroup | null>;
  start: Coordinate;
  routePreview: MockRouteResult | null;
};

export default function ResourceNodesOverlay({ leafletLib, mapRef, layerRef, start, routePreview }: Props) {
  const [showNodes, setShowNodes] = useState(false);

  const nodes = useMemo(() => {
    const polyline = routePreview?.polyline ?? [start];
    return buildMockNodesForRoute(polyline);
  }, [routePreview?.polyline, start]);

  useEffect(() => {
    if (!leafletLib || !mapRef.current || !layerRef.current) return;

    layerRef.current.clearLayers();
    if (!showNodes || nodes.length === 0) return;

    nodes.forEach((node) => {
      const type = node.types[0];
      const legend = RESOURCE_NODE_LEGEND[type];
      const marker = leafletLib.circleMarker([node.lat, node.lng], {
        radius: 7,
        weight: 2,
        color: "#314e36",
        fillColor: legend?.icon ? "#fefcf7" : "#ffffff",
        fillOpacity: 0.95,
      });
      marker.bindTooltip(`${legend?.icon ?? "📍"} ${node.label}`, { permanent: false, direction: "top" });
      marker.addTo(layerRef.current as LayerGroup);
    });
  }, [leafletLib, layerRef, mapRef, nodes, showNodes]);

  return (
    <div className="rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.82)] p-4 shadow-[6px_8px_0_rgba(27,26,20,0.12)] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Nodos de recursos</p>
          <h4 className="font-display text-xl leading-tight">A💧 / B🍚 / C🧥 / D⛑️</h4>
          <p className="text-xs text-ink/70">Propios o cedidos con consentimiento. Sin caches ocultas.</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={showNodes}
            onChange={(e) => setShowNodes(e.target.checked)}
            aria-label="Mostrar nodos en la ruta"
          />
          Mostrar nodos en la ruta
        </label>
      </div>

      <p className="text-sm text-ink/80">
        Nodos ligeros alineados a tu ruta mock para visualizar agua, comida, abrigo y asistencia básica.
      </p>

      <div className="grid gap-2 sm:grid-cols-4">
        {(["A", "B", "C", "D"] as const).map((code) => (
          <div
            key={code}
            className="rounded-md border-2 border-ink bg-[rgba(241,245,238,0.8)] px-3 py-2 text-sm flex items-center gap-2"
          >
            <span className="text-lg" aria-hidden>
              {RESOURCE_NODE_LEGEND[code].icon}
            </span>
            <div>
              <p className="font-semibold">
                {RESOURCE_NODE_LEGEND[code].title} · {RESOURCE_NODE_LEGEND[code].description}
              </p>
              <p className="text-[11px] text-ink/70">Ubicaciones ofrecidas, nunca escondites.</p>
            </div>
          </div>
        ))}
      </div>

      {!showNodes && <p className="text-xs text-ink/70">Activa el toggle para ver marcadores mock junto a la ruta.</p>}
    </div>
  );
}
