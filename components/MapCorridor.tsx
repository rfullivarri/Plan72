"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

import { geocodeAddress, type GeocodeResult } from "@/lib/geocode";
import { usePlan } from "./PlanContext";

const iconUrls = {
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
};

type LeafletLib = typeof import("leaflet");

export default function MapCorridor() {
  const { input, plan, updateInput } = usePlan();
  const [leafletLib, setLeafletLib] = useState<LeafletLib | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [latInput, setLatInput] = useState<string>(() => input.start.lat.toString());
  const [lngInput, setLngInput] = useState<string>(() => input.start.lng.toString());
  const [labelInput, setLabelInput] = useState<string>(() => input.start.label ?? "Start");

  useEffect(() => {
    setLatInput(input.start.lat.toString());
    setLngInput(input.start.lng.toString());
    setLabelInput(input.start.label ?? "Start");
  }, [input.start.lat, input.start.lng, input.start.label]);

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

    const map = leafletLib.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
    }).setView([input.start.lat, input.start.lng], 13);

    leafletLib.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = leafletLib.layerGroup().addTo(map);

    mapRef.current = map;
    layerRef.current = layerGroup;

    return () => {
      map.remove();
    };
  }, [leafletLib, input.start.lat, input.start.lng]);

  useEffect(() => {
    if (!leafletLib || !mapRef.current || !layerRef.current) return;

    const corridor = plan.routes.base.corridor;
    const coords = corridor.map((point) => [point.lat, point.lng]) as [number, number][];
    layerRef.current.clearLayers();

    if (coords.length === 0) return;

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

    const bounds = leafletLib.latLngBounds(coords);
    mapRef.current.fitBounds(bounds, { padding: [20, 20] });
  }, [leafletLib, plan.routes.base.corridor]);

  useEffect(() => {
    if (!addressQuery || addressQuery.trim().length < 3) {
      setGeocodeResults([]);
      setStatus(null);
      return;
    }

    setStatus("Buscando…");
    const handle = setTimeout(async () => {
      try {
        const results = await geocodeAddress(addressQuery);
        setGeocodeResults(results);
        setStatus(results.length === 0 ? "Sin resultados. Usa lat/lng." : null);
      } catch (error) {
        if (error instanceof Error && error.message === "RATE_LIMIT") {
          setStatus("Rate limit alcanzado. Espera 1s y reintenta.");
          return;
        }
        setStatus("Geocoding no disponible. Usa lat/lng manual.");
      }
    }, 450);

    return () => clearTimeout(handle);
  }, [addressQuery]);

  const corridorSummary = useMemo(
    () => plan.routes.base.corridor.map((point) => point.label ?? "").join(" → "),
    [plan.routes.base.corridor],
  );

  const handleApplyCoords = (coords?: { lat: number; lng: number; label?: string }) => {
    const lat = coords?.lat ?? parseFloat(latInput);
    const lng = coords?.lng ?? parseFloat(lngInput);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setStatus("Coord inválidas. Usa formato decimal.");
      return;
    }

    const label = coords?.label ?? (labelInput?.trim() || input.start.label || "Start");
    setLatInput(lat.toString());
    setLngInput(lng.toString());
    setLabelInput(label);
    updateInput("start", { lat, lng, label });
    setStatus("Coordenadas aplicadas.");
  };

  return (
    <div className="card-frame p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-display text-xl">Corridor</div>
          <p className="text-sm text-ink/80">Mapa minimalista con origen, DP1..DP3 y destino.</p>
        </div>
        <span className="rounded-full border-2 border-ink px-3 py-1 text-xs font-mono uppercase text-olive">{plan.routes.base.intent}</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-2 rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.75)] p-3 shadow-[6px_8px_0_rgba(27,26,20,0.14)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-olive">Input / fallback</p>
          <label className="text-sm font-semibold">
            Address / POI
            <input
              className="mt-1 w-full rounded-lg border-2 border-ink bg-white px-3 py-2 font-mono text-sm"
              placeholder="Carrer Aragó 200, BCN"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Lat manual
              <input
                className="mt-1 w-full rounded-lg border-2 border-ink bg-white px-3 py-2 font-mono text-sm"
                type="number"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              Lng manual
              <input
                className="mt-1 w-full rounded-lg border-2 border-ink bg-white px-3 py-2 font-mono text-sm"
                type="number"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr,auto] sm:items-end">
            <label className="text-sm font-semibold">
              Label
              <input
                className="mt-1 w-full rounded-lg border-2 border-ink bg-white px-3 py-2 font-mono text-sm"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
              />
            </label>
            <button className="ink-button" onClick={() => handleApplyCoords()}>
              Aplicar coords
            </button>
          </div>
          {status && <p className="text-xs font-mono text-olive">{status}</p>}
          {geocodeResults.length > 0 && (
            <div className="space-y-1 rounded-lg border-2 border-dashed border-ink/60 bg-[rgba(240,245,238,0.7)] p-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Sugerencias</p>
              <ul className="space-y-1 text-sm">
                {geocodeResults.map((hit) => (
                  <li key={`${hit.displayName}-${hit.lat}-${hit.lng}`}>
                    <button
                      className="underline decoration-dotted"
                      onClick={() => handleApplyCoords({ lat: hit.lat, lng: hit.lng, label: hit.displayName.split(",")[0] })}
                    >
                      {hit.displayName}
                    </button>
                    <span className="ml-2 font-mono text-xs text-ink/70">
                      {hit.lat.toFixed(4)}, {hit.lng.toFixed(4)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div
            ref={mapContainerRef}
            className="h-72 w-full overflow-hidden rounded-xl border-2 border-ink shadow-[10px_12px_0_rgba(27,26,20,0.16)]"
          />
          <div className="rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.7)] p-3 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Corridor</p>
            <p className="font-semibold">{corridorSummary}</p>
            <ul className="mt-2 space-y-1 text-[13px]">
              {plan.routes.base.corridor.map((point, idx) => (
                <li key={point.label ?? idx}>
                  {String(idx + 1).padStart(2, "0")}. {point.label ?? `DP${idx}`} — {point.lat.toFixed(3)}, {point.lng.toFixed(3)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
