"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import { usePlan } from "./PlanContext";

const iconUrls = {
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
};

type LeafletLib = typeof import("leaflet");

type MapCorridorProps = {
  embedded?: boolean;
  showSummary?: boolean;
  showHeader?: boolean;
  title?: string;
  description?: string;
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
};

export default function MapCorridor({
  embedded = false,
  showSummary = true,
  showHeader = true,
  title = "Mini-map",
  description = "Start, DP1..DP3 y destino en un solo vistazo.",
  className,
  initialCenter,
  initialZoom = 12,
}: MapCorridorProps) {
  const { plan } = usePlan();
  const [leafletLib, setLeafletLib] = useState<LeafletLib | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (leafletLib || typeof window === "undefined") return;

    const loadLeaflet = async () => {
      const L = await import("leaflet");
      L.Icon.Default.mergeOptions(iconUrls);
      setLeafletLib(L);
    };

    loadLeaflet();
  }, [leafletLib]);

  useEffect(() => {
    if (typeof window === "undefined" || !leafletLib) return;
    if (mapRef.current || !mapContainerRef.current) return;

    const startingLat = initialCenter?.lat ?? 41.39;
    const startingLng = initialCenter?.lng ?? 2.16;

    const map = leafletLib.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
    }).setView([startingLat, startingLng], initialZoom);

    leafletLib.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = leafletLib.layerGroup().addTo(map);

    mapRef.current = map;
    layerRef.current = layerGroup;

    return () => {
      map.remove();
    };
  }, [leafletLib]);

  useEffect(() => {
    if (!leafletLib || !mapRef.current || !layerRef.current) return;

    const corridor = plan.routes.base.corridor;
    const coords = corridor.map((point) => [point.lat, point.lng]) as [number, number][];
    layerRef.current.clearLayers();

    if (coords.length === 0) {
      if (initialCenter) {
        mapRef.current.setView([initialCenter.lat, initialCenter.lng], initialZoom, { animate: false });
      }
      return;
    }

    const labels = corridor.map((point, idx) => {
      if (idx === 0) return point.label || "Start";
      if (idx === corridor.length - 1) return point.label || "Destination";
      return point.label || `DP${idx}`;
    });

    coords.forEach((coord, idx) => {
      const marker = leafletLib.marker(coord, { title: labels[idx] });
      marker.bindPopup(labels[idx]);
      marker.addTo(layerRef.current as LayerGroup);
    });

    leafletLib.polyline(coords, { color: "#1b4332", weight: 4, opacity: 0.8 }).addTo(layerRef.current);

    if (coords.length === 1) {
      mapRef.current.setView(coords[0], initialZoom, { animate: true });
      return;
    }

    const bounds = leafletLib.latLngBounds(coords);
    try {
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    } catch (error) {
      console.warn("Leaflet fitBounds failed", error);
    }
  }, [leafletLib, plan.routes.base.corridor, initialCenter, initialZoom]);

  const corridorSummary = useMemo(
    () => plan.routes.base.corridor.map((point) => point.label ?? "").join(" → "),
    [plan.routes.base.corridor],
  );

  return (
    <div className={`${embedded ? "space-y-3" : "card-frame p-4 space-y-3"} ${className ?? ""}`.trim()}>
      {showHeader && (
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-display text-xl">{title}</div>
            <p className="text-sm text-ink/80">{description}</p>
          </div>
          <span className="rounded-full border-2 border-ink px-3 py-1 text-xs font-mono uppercase text-olive">
            {plan.routes.base.intent}
          </span>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="h-64 w-full overflow-hidden rounded-xl border-2 border-ink shadow-[10px_12px_0_rgba(27,26,20,0.16)]"
      />

      {showSummary && (
        <div className="rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.7)] p-3 text-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Corridor</p>
          <p className="font-semibold">{corridorSummary}</p>
          <ul className="mt-2 space-y-1 text-[13px]">
            {plan.routes.base.corridor.map((point, idx) => (
              <li key={point.label ?? idx}>
                {String(idx + 1).padStart(2, "0")}. {point.label ?? `DP${idx}`} — {point.lat.toFixed(3)},{" "}
                {point.lng.toFixed(3)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
