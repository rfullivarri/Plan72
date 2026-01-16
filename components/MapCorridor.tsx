"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { usePlan } from "./PlanContext";

const MAPLIBRE_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const ROUTE_SOURCE_ID = "corridor-route";
const ROUTE_LAYER_ID = "corridor-line";

type RouteFeature = {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: [number, number][] };
  properties: Record<string, unknown>;
};

type RouteFeatureCollection = {
  type: "FeatureCollection";
  features: RouteFeature[];
};

const emptyFeatureCollection: RouteFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

type MapLibreModule = typeof import("maplibre-gl");
type MapLibreLngLatBounds = InstanceType<MapLibreModule["LngLatBounds"]>;
type MapLibreMap = InstanceType<MapLibreModule["Map"]>;
type MapLibreMarker = InstanceType<MapLibreModule["Marker"]>;
type MapLibrePopup = InstanceType<MapLibreModule["Popup"]>;

type MapCorridorProps = {
  embedded?: boolean;
  showSummary?: boolean;
  showHeader?: boolean;
  showResourceNodes?: boolean;
  title?: string;
  description?: string;
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  showStartMarker?: boolean;
  initialMarkerLabel?: string;
  focusCenter?: { lat: number; lng: number };
  focusZoom?: number;
  lockOnFocus?: boolean;
};

const loadMapLibre = async () => {
  if (typeof window === "undefined") {
    throw new Error("MapLibre is only available in the browser.");
  }

  const maplibreModule = await import("maplibre-gl");
  // TS: ESM/CJS interop cast for dynamic import
  const resolved = (maplibreModule.default ?? maplibreModule) as unknown as MapLibreModule;

  return resolved;
};

const createMarkerElement = (label: string, variant: "route" | "resource") => {
  const element = document.createElement("div");
  element.className = `map-marker map-marker--${variant}`;
  element.textContent = label;
  return element;
};

export default function MapCorridor({
  embedded = false,
  showSummary = true,
  showHeader = true,
  showResourceNodes = false,
  title = "Mini-map",
  description = "Start, DP1..DP3 y destino en un solo vistazo.",
  className,
  initialCenter,
  initialZoom = 12,
  showStartMarker = false,
  initialMarkerLabel = "Start",
  focusCenter,
  focusZoom,
  lockOnFocus = false,
}: MapCorridorProps) {
  const { plan, input } = usePlan();
  const mapCard = plan.mapCard;
  const corridor = mapCard.map.corridor;
  const [maplibre, setMaplibre] = useState<MapLibreModule | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (maplibre || typeof window === "undefined") return;

    loadMapLibre()
      .then((lib) => setMaplibre(lib))
      .catch((error) => {
        console.warn("MapLibre failed to load", error);
        setMapError("No se pudo cargar el mapa.");
      });
  }, [maplibre]);

  useEffect(() => {
    if (!maplibre || !mapContainerRef.current || mapRef.current || mapError) return;

    const startingLat = initialCenter?.lat ?? 41.39;
    const startingLng = initialCenter?.lng ?? 2.16;

    let map: MapLibreMap | null = null;

    try {
      map = new maplibre.Map({
        container: mapContainerRef.current,
        style: MAPLIBRE_STYLE,
        center: [startingLng, startingLat],
        zoom: initialZoom,
        attributionControl: false,
      });

      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "bottom-right");

      map.on("load", () => {
        if (!map?.getSource(ROUTE_SOURCE_ID)) {
          map?.addSource(ROUTE_SOURCE_ID, {
            type: "geojson",
            data: emptyFeatureCollection,
          });
        }

        map?.addLayer({
          id: ROUTE_LAYER_ID,
          type: "line",
          source: ROUTE_SOURCE_ID,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#1b4332",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });

        setMapReady(true);
      });

      mapRef.current = map;
    } catch (error) {
      console.warn("MapLibre failed to initialize", error);
      map?.remove();
      mapRef.current = null;
      setMapError("El mapa no está disponible en este dispositivo.");
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map?.remove();
    };
  }, [maplibre, initialCenter, initialZoom, mapError]);

  useEffect(() => {
    if (!maplibre || !mapRef.current || !mapReady || mapError) return;

    const map = mapRef.current;
    const coords = corridor.map((point) => [point.lng, point.lat]) as [number, number][];

    const source = map.getSource(ROUTE_SOURCE_ID);
    if (source) {
      const routeFeature: RouteFeature | null =
        coords.length > 1
          ? {
              type: "Feature",
              geometry: {
                type: "LineString",
                coordinates: coords,
              },
              properties: {},
            }
          : null;

      source.setData(
        routeFeature
          ? {
              type: "FeatureCollection",
              features: [routeFeature],
            }
          : emptyFeatureCollection,
      );
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (lockOnFocus && focusCenter) {
      if (showStartMarker) {
        const marker = new maplibre.Marker({
          element: createMarkerElement(initialMarkerLabel, "route"),
          anchor: "bottom",
        })
          .setLngLat([focusCenter.lng, focusCenter.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }
      map.flyTo({
        center: [focusCenter.lng, focusCenter.lat],
        zoom: focusZoom ?? initialZoom,
        duration: 800,
      });
      return;
    }

    if (coords.length === 0) {
      if (initialCenter) {
        if (showStartMarker) {
          const marker = new maplibre.Marker({
            element: createMarkerElement(initialMarkerLabel, "route"),
            anchor: "bottom",
          })
            .setLngLat([initialCenter.lng, initialCenter.lat])
            .addTo(map);
          markersRef.current.push(marker);
        }
        map.jumpTo({ center: [initialCenter.lng, initialCenter.lat], zoom: initialZoom });
      }
      return;
    }

    const labels = corridor.map((point, idx) => {
      if (idx === 0) return "Start";
      if (idx === corridor.length - 1) return "Destination";
      return `DP${idx}`;
    });

    coords.forEach((coord, idx) => {
      const markerLabel = labels[idx];
      const detail = corridor[idx]?.label ? ` · ${corridor[idx]?.label}` : "";
      const popup = new maplibre.Popup({ offset: 16 }).setText(`${markerLabel}${detail}`);
      const marker = new maplibre.Marker({
        element: createMarkerElement(markerLabel, "route"),
        anchor: "bottom",
      })
        .setLngLat(coord)
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    });

    if (showResourceNodes) {
      input.resourceNodes.forEach((node) => {
        const typeLabel = node.types[0] ?? "A";
        const popup = new maplibre.Popup({ offset: 16 }).setText(`${node.label} · ${node.types.join(", ")}`);
        const marker = new maplibre.Marker({
          element: createMarkerElement(typeLabel, "resource"),
          anchor: "bottom",
        })
          .setLngLat([node.lng, node.lat])
          .setPopup(popup)
          .addTo(map);
        markersRef.current.push(marker);
      });
    }

    if (coords.length === 1) {
      map.jumpTo({ center: coords[0], zoom: initialZoom });
      return;
    }

    const bounds = new maplibre.LngLatBounds(coords[0], coords[0]);
    coords.slice(1).forEach((coord) => bounds.extend(coord));
    map.fitBounds(bounds, { padding: 20, duration: 0 });
  }, [
    maplibre,
    mapReady,
    mapError,
    corridor,
    input.resourceNodes,
    showResourceNodes,
    initialCenter,
    initialZoom,
    showStartMarker,
    initialMarkerLabel,
    focusCenter,
    focusZoom,
    lockOnFocus,
  ]);

  useEffect(() => {
    if (!mapRef.current) return;

    const handleResize = () => mapRef.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const corridorSummary = useMemo(
    () => corridor.map((point) => point.label ?? "").join(" → "),
    [corridor],
  );

  if (mapError) {
    return (
      <div className={`${embedded ? "space-y-3" : "card-frame p-4 space-y-3"} ${className ?? ""}`.trim()}>
        {showHeader && (
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-display text-xl">{title}</div>
              <p className="text-sm text-ink/80">{description}</p>
            </div>
            <span className="rounded-full border-2 border-ink px-3 py-1 text-xs font-mono uppercase text-olive">
              {mapCard.map.intent}
            </span>
          </div>
        )}

        <div className="flex h-64 w-full items-center justify-center rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.7)] text-center text-sm text-ink/70">
          {mapError}
        </div>

        {showSummary && (
          <div className="rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.7)] p-3 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Corridor</p>
            <p className="font-semibold">{corridorSummary}</p>
            <ul className="mt-2 space-y-1 text-[13px]">
              {corridor.map((point, idx) => (
                <li key={point.label ?? idx}>
                  {String(idx + 1).padStart(2, "0")}. {point.label ?? `DP${idx}`} — {point.lat.toFixed(3)}, {" "}
                  {point.lng.toFixed(3)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${embedded ? "space-y-3" : "card-frame p-4 space-y-3"} ${className ?? ""}`.trim()}>
      {showHeader && (
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-display text-xl">{title}</div>
            <p className="text-sm text-ink/80">{description}</p>
          </div>
          <span className="rounded-full border-2 border-ink px-3 py-1 text-xs font-mono uppercase text-olive">
            {mapCard.map.intent}
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
            {corridor.map((point, idx) => (
              <li key={point.label ?? idx}>
                {String(idx + 1).padStart(2, "0")}. {point.label ?? `DP${idx}`} — {point.lat.toFixed(3)}, {" "}
                {point.lng.toFixed(3)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
