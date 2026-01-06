"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LatLngBoundsExpression, LayerGroup, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";

import { geocodePlace, type GeocodeResult } from "@/lib/geocode";
import { generateMockRoute, type MockRouteResult } from "@/lib/mockRoute";
import { usePlan } from "./PlanContext";
import ResourceNodesOverlay from "./ResourceNodesOverlay";

type LeafletLib = typeof import("leaflet");

const iconUrls = {
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
};

const DEFAULT_COORD = { lat: 41.387, lng: 2.17 };
const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";

export default function RealMap() {
  const { input, updateInput } = usePlan();
  const [leafletLib, setLeafletLib] = useState<LeafletLib | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const routeLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const resourceLayerRef = useRef<LayerGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState(() => (input.city && input.city !== "BCN" ? input.city : "Barcelona"));
  const [status, setStatus] = useState<string | null>("Mapa listo para buscar.");
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const [lastResult, setLastResult] = useState<GeocodeResult | null>(null);
  const [routePreview, setRoutePreview] = useState<MockRouteResult | null>(null);
  const hasBootstrapped = useRef(false);

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
    if (!leafletLib || !mapContainerRef.current || mapRef.current) return;

    const map = leafletLib
      .map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
      })
      .setView([input.start.lat || DEFAULT_COORD.lat, input.start.lng || DEFAULT_COORD.lng], 12);

    leafletLib.tileLayer(TILE_URL, {
      maxZoom: 18,
      minZoom: 2,
      attribution: "© OpenStreetMap contributors · Carto basemap",
    }).addTo(map);

    routeLayerRef.current = leafletLib.layerGroup().addTo(map);
    resourceLayerRef.current = leafletLib.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [input.start.lat, input.start.lng, leafletLib]);

  const locationLabel = useMemo(() => {
    if (lastResult) return lastResult.displayName.split(",")[0];
    if (input.start.label) return input.start.label;
    return "Sin marcador";
  }, [input.start.label, lastResult]);

  const placeTypeHint = useMemo(() => {
    if (!lastResult) return "Sin ubicación";
    if (lastResult.type === "country" || lastResult.addresstype === "country") return "País detectado";
    if (lastResult.type === "city" || lastResult.addresstype === "city") return "Ciudad detectada";
    return "Referencia puntual";
  }, [lastResult]);

  const applyResultToMap = useCallback(
    (result: GeocodeResult) => {
      if (!leafletLib || !mapRef.current) return;

      const map = mapRef.current;
      const label = result.displayName.split(",")[0] || "Start";

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = leafletLib
        .marker([result.lat, result.lng], {
          title: label,
          riseOnHover: true,
        })
        .addTo(map);

      if (result.boundingBox) {
        const bounds: LatLngBoundsExpression = [
          [result.boundingBox[0], result.boundingBox[2]],
          [result.boundingBox[1], result.boundingBox[3]],
        ];
        map.fitBounds(bounds, { padding: [18, 18] });
      } else {
        const zoom = result.type === "country" || result.addresstype === "country" ? 5 : 12;
        map.setView([result.lat, result.lng], zoom);
      }

      const startLabel = label || query || "Start";
      updateInput("start", { lat: result.lat, lng: result.lng, label: startLabel });
      updateInput("city", query || label);
    },
    [leafletLib, query, updateInput],
  );

  const handleSearch = useCallback(
    async (forcedQuery?: string) => {
      const searchFor = (forcedQuery ?? query).trim();
      if (!searchFor) {
        setStatus("Escribe un país o ciudad para localizar.");
        return;
      }

      setIsSearching(true);
      setStatus("Resolviendo ubicación real…");

      try {
        const result = await geocodePlace(searchFor);
        if (!result) {
          setStatus("Sin resultados. Prueba otro nombre o usa una ciudad cercana.");
          return;
        }

        setLastResult(result);
        applyResultToMap(result);
        const label = result.displayName.split(",")[0];
        setStatus(`Marcador fijado en ${label || result.displayName}`);
      } catch (error) {
        if (error instanceof Error && error.message === "RATE_LIMIT") {
          setStatus("Rate limit de Nominatim. Espera 1s y reintenta.");
        } else {
          setStatus("No se pudo geocodificar. Revisa tu conexión.");
        }
      } finally {
        setIsSearching(false);
      }
    },
    [applyResultToMap, query],
  );

  useEffect(() => {
    if (!leafletLib || !mapRef.current || hasBootstrapped.current) return;
    hasBootstrapped.current = true;
    void handleSearch(query);
  }, [handleSearch, leafletLib, query]);

  useEffect(() => {
    if (!leafletLib || !routePreview || !routeLayerRef.current || !mapRef.current) return;

    routeLayerRef.current.clearLayers();

    const coords = routePreview.polyline.map((point) => [point.lat, point.lng]) as [number, number][];

    coords.forEach((coord, idx) => {
      const label = routePreview.polyline[idx]?.label ?? `P${idx}`;
      const marker = leafletLib.circleMarker(coord, {
        radius: idx === 0 || idx === coords.length - 1 ? 7 : 6,
        weight: 2,
        color: idx === 0 ? "#d9480f" : idx === coords.length - 1 ? "#1d4ed8" : "#3b5bdb",
        fillColor: "white",
        fillOpacity: 0.9,
      });
      marker.bindTooltip(label, { permanent: false, direction: "top" });
      marker.addTo(routeLayerRef.current as import("leaflet").LayerGroup);
    });

    leafletLib
      .polyline(coords, { color: "#314e36", weight: 4, opacity: 0.85 })
      .addTo(routeLayerRef.current as import("leaflet").LayerGroup);

    try {
      const bounds = leafletLib.latLngBounds(coords);
      mapRef.current.fitBounds(bounds, { padding: [18, 18] });
    } catch (error) {
      console.warn("Leaflet fitBounds failed", error);
    }
  }, [leafletLib, routePreview]);

  const handleGenerateRoute = () => {
    if (isGeneratingRoute) return;
    setIsGeneratingRoute(true);
    setStatus("Calculando ruta mock de escape…");
    const delayMs = 2000 + Math.random() * 1800;
    window.setTimeout(() => {
      const mock = generateMockRoute(input.start, input.city);
      setRoutePreview(mock);
      setStatus("Ruta mock dibujada. Ajusta DP1..DP3 si lo necesitas.");
      setIsGeneratingRoute(false);
    }, delayMs);
  };

  const constraints = [
    "Evitar underground",
    "Preferir desplazamiento a pie directo",
    "Evitar nodos estratégicos (hospitales, embajadas, infra crítica)",
  ];

  return (
    <div className="card-frame p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-olive">Step 1 · Location</p>
          <h2 className="font-display text-2xl">Mapa real: país / ciudad</h2>
          <p className="text-sm text-ink/80">Zoom real con Nominatim + OSM. Estilo simplificado retro.</p>
        </div>
        <div className="rounded-full border-2 border-ink bg-[rgba(245,232,204,0.9)] px-3 py-1 text-xs font-mono">
          {placeTypeHint}
        </div>
      </div>

      <form
        className="grid gap-2 sm:grid-cols-[1fr,auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSearch();
        }}
      >
        <label className="space-y-1 text-sm font-semibold">
          País o ciudad
          <input
            className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.78)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Barcelona, España"
            aria-label="Buscar país o ciudad"
          />
        </label>
        <button
          type="submit"
          className="ink-button h-fit whitespace-nowrap"
          disabled={isSearching}
          aria-label="Resolver ubicación en mapa real"
        >
          {isSearching ? "Buscando…" : "Centrar mapa"}
        </button>
      </form>

      <div className="relative">
        <div
          ref={mapContainerRef}
          className="h-80 w-full overflow-hidden rounded-xl border-2 border-ink bg-[radial-gradient(circle_at_20%_20%,rgba(210,189,152,0.3),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(166,177,150,0.28),transparent_42%)] shadow-[10px_12px_0_rgba(27,26,20,0.14)]"
          aria-label="Mapa real interactivo"
        />
        {isSearching && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-[rgba(245,232,204,0.6)] text-sm font-semibold">
            Cargando mapa…
          </div>
        )}
        {isGeneratingRoute && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-[rgba(241,245,238,0.7)] text-sm font-semibold">
            Generando ruta de escape…
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.75)] p-3 text-sm shadow-[6px_8px_0_rgba(27,26,20,0.12)]">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Marcador</p>
          <p className="font-semibold">{locationLabel}</p>
          <p className="text-xs text-ink/70">Actualiza el punto de inicio del plan automáticamente.</p>
        </div>
        <div className="rounded-lg border-2 border-dashed border-ink/60 bg-[rgba(241,245,238,0.7)] p-3 text-xs">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Estado</p>
          <p className="mt-1 font-semibold">{status}</p>
          <p className="mt-1 text-ink/70">Datos de OpenStreetMap / Nominatim. Basemap simplificado para modo papel.</p>
        </div>
      </div>

      <div className="rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.85)] p-4 shadow-[8px_10px_0_rgba(27,26,20,0.14)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Step 2 · Ruta mock</p>
            <h3 className="font-display text-xl">Generar ruta de escape</h3>
            <p className="text-sm text-ink/75">Start = tu ubicación · Destino fijo Collserola (BCN) · DP1..DP3 interpolados.</p>
          </div>
          <button
            type="button"
            className="ink-button"
            onClick={handleGenerateRoute}
            disabled={isGeneratingRoute}
            aria-label="Generar ruta de escape mock"
          >
            {isGeneratingRoute ? "Trazando…" : "Generar ruta de escape"}
          </button>
        </div>

        {routePreview ? (
          <div className="grid gap-3 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-2 rounded-lg border-2 border-ink bg-[rgba(241,245,238,0.75)] p-3 text-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Resumen</p>
              <p className="font-semibold">{routePreview.summary}</p>
              <p className="text-ink/80">{routePreview.distanceLabel} · {routePreview.etaLabel}</p>
              <p className="text-xs text-ink/70">Dibujo sobre el mapa real. Ajustes manuales aún no aplicados.</p>
            </div>
            <div className="space-y-2 rounded-lg border-2 border-dashed border-ink/60 bg-[rgba(255,255,255,0.78)] p-3 text-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Decision points</p>
              <ol className="space-y-1 text-sm">
                {routePreview.decisionPoints.map((dp) => (
                  <li key={dp.label} className="flex items-start gap-2">
                    <span className="rounded-md bg-[rgba(74,90,58,0.14)] px-2 py-1 font-mono text-[11px] text-olive">{dp.label}</span>
                    <div>
                      <p className="font-semibold">{dp.label}</p>
                      <p className="text-xs text-ink/70">
                        {dp.lat.toFixed(3)}, {dp.lng.toFixed(3)}
                      </p>
                    </div>
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <span className="rounded-md bg-[rgba(29,78,216,0.14)] px-2 py-1 font-mono text-[11px] text-olive">Destino</span>
                  <div>
                    <p className="font-semibold">{routePreview.destination.label ?? "Destino"}</p>
                    <p className="text-xs text-ink/70">
                      {routePreview.destination.lat.toFixed(3)}, {routePreview.destination.lng.toFixed(3)}
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-ink/60 bg-[rgba(245,232,204,0.55)] p-3 text-sm">
            <p className="font-semibold">Pulsa &quot;Generar ruta de escape&quot; para dibujar DP1..DP3 y destino en el mapa.</p>
            <p className="text-xs text-ink/70">Usa tu ubicación actual como origen. Tarda 2–4s en simular la heurística.</p>
          </div>
        )}

        <div className="rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.75)] p-3 text-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Restricciones (mock)</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink/80">
            {constraints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <ResourceNodesOverlay
          leafletLib={leafletLib}
          mapRef={mapRef}
          layerRef={resourceLayerRef}
          start={input.start}
          routePreview={routePreview}
        />
      </div>
    </div>
  );
}
