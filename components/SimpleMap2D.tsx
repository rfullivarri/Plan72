"use client";

import { useEffect, useRef, useState } from "react";

const MAPLIBRE_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

type MapLibreModule = typeof import("maplibre-gl");

type MapLibreMap = InstanceType<MapLibreModule["Map"]>;

type MapLibreMarker = InstanceType<MapLibreModule["Marker"]>;

type SimpleMap2DProps = {
  center: { lat: number; lng: number };
  zoom?: number;
  className?: string;
};

const createMarkerElement = () => {
  const element = document.createElement("div");
  element.className = "h-4 w-4 rounded-full border-2 border-ink bg-olive shadow-[2px_2px_0_rgba(27,26,20,0.2)]";
  return element;
};

const loadMapLibre = async () => {
  if (typeof window === "undefined") {
    throw new Error("MapLibre is only available in the browser.");
  }

  const maplibreModule = await import("maplibre-gl");
  const resolved = (maplibreModule.default ?? maplibreModule) as unknown as MapLibreModule;

  return resolved;
};

export default function SimpleMap2D({ center, zoom = 15, className }: SimpleMap2DProps) {
  const [maplibre, setMaplibre] = useState<MapLibreModule | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const clampedZoom = Math.min(Math.max(zoom, 14), 16);

  useEffect(() => {
    if (maplibre || typeof window === "undefined") return;

    loadMapLibre()
      .then((lib) => setMaplibre(lib))
      .catch((error) => {
        console.warn("MapLibre failed to load", error);
        setMapError("Map is unavailable on this device.");
      });
  }, [maplibre]);

  useEffect(() => {
    if (!maplibre || !mapContainerRef.current || mapRef.current || mapError) return;

    let map: MapLibreMap | null = null;

    try {
      map = new maplibre.Map({
        container: mapContainerRef.current,
        style: MAPLIBRE_STYLE,
        center: [center.lng, center.lat],
        zoom: clampedZoom,
        attributionControl: false,
      });

      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "bottom-right");

      map.on("load", () => {
        setMapReady(true);
      });

      mapRef.current = map;
    } catch (error) {
      console.warn("MapLibre failed to initialize", error);
      map?.remove();
      mapRef.current = null;
      setMapError("Map is unavailable on this device.");
    }

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map?.remove();
    };
  }, [maplibre, center.lat, center.lng, clampedZoom, mapError]);

  useEffect(() => {
    if (!maplibre || !mapRef.current || !mapReady || mapError) return;

    const map = mapRef.current;
    const nextCenter: [number, number] = [center.lng, center.lat];

    if (!markerRef.current) {
      markerRef.current = new maplibre.Marker({ element: createMarkerElement(), anchor: "bottom" })
        .setLngLat(nextCenter)
        .addTo(map);
    } else {
      markerRef.current.setLngLat(nextCenter);
    }

    map.flyTo({ center: nextCenter, zoom: clampedZoom, duration: 800 });
  }, [maplibre, mapReady, mapError, center.lat, center.lng, clampedZoom]);

  useEffect(() => {
    if (!mapRef.current) return;

    const handleResize = () => mapRef.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (mapError) {
    return (
      <div
        className={`flex h-96 w-full items-center justify-center rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.7)] text-center text-sm text-ink/70 ${
          className ?? ""
        }`.trim()}
      >
        {mapError}
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className={`h-96 w-full overflow-hidden rounded-xl border-2 border-ink shadow-[10px_12px_0_rgba(27,26,20,0.16)] ${
        className ?? ""
      }`.trim()}
    />
  );
}
