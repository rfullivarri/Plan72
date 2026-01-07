"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type Globe3DHandle = {
  focusCountry: (countryCode: string) => void;
  focusCity: (lat: number, lng: number) => void;
};

type Globe3DProps = {
  selectedCountry?: string;
  selectedCity?: { name?: string; lat: number; lng: number };
};

const MAPLIBRE_STYLE = "https://demotiles.maplibre.org/style.json";
const MAPLIBRE_SCRIPT = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
const MAPLIBRE_CSS = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css";

type MapLibreMap = {
  on: (event: string, callback: () => void) => void;
  remove: () => void;
  resize: () => void;
  flyTo: (options: { center: [number, number]; zoom?: number; speed?: number; curve?: number; essential?: boolean }) => void;
  jumpTo: (options: { center: [number, number]; zoom?: number }) => void;
  setFog?: (options: Record<string, unknown>) => void;
};

type MapLibreMarker = {
  setLngLat: (coord: [number, number]) => MapLibreMarker;
  addTo: (map: MapLibreMap) => MapLibreMarker;
  remove: () => void;
};

type MapLibreModule = {
  __isStub?: boolean;
  Map: new (options: {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
    projection?: string;
    attributionControl?: boolean;
  }) => MapLibreMap;
  Marker: new (options?: { element?: HTMLElement }) => MapLibreMarker;
};

type MapLibreWindow = Window & { maplibregl?: MapLibreModule };

let maplibrePromise: Promise<MapLibreModule> | null = null;

const getGlobalMapLibre = () => (window as MapLibreWindow).maplibregl;

const loadMapLibre = async () => {
  if (typeof window === "undefined") {
    throw new Error("MapLibre is only available in the browser.");
  }

  const globalMapLibre = getGlobalMapLibre();
  if (globalMapLibre) {
    return globalMapLibre;
  }

  if (!maplibrePromise) {
    maplibrePromise = new Promise<MapLibreModule>((resolve, reject) => {
      if (!document.getElementById("maplibre-gl-css")) {
        const link = document.createElement("link");
        link.id = "maplibre-gl-css";
        link.rel = "stylesheet";
        link.href = MAPLIBRE_CSS;
        document.head.appendChild(link);
      }

      const existingScript = document.getElementById("maplibre-gl-js") as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          const globalMapLibre = getGlobalMapLibre();
          if (globalMapLibre) {
            resolve(globalMapLibre);
          } else {
            reject(new Error("MapLibre script loaded without global."));
          }
        });
        existingScript.addEventListener("error", () => reject(new Error("Failed to load MapLibre script.")));
        return;
      }

      const script = document.createElement("script");
      script.id = "maplibre-gl-js";
      script.src = MAPLIBRE_SCRIPT;
      script.async = true;
      script.onload = () => {
        const globalMapLibre = getGlobalMapLibre();
        if (globalMapLibre) {
          resolve(globalMapLibre);
        } else {
          reject(new Error("MapLibre script loaded without global."));
        }
      };
      script.onerror = () => reject(new Error("Failed to load MapLibre script."));
      document.head.appendChild(script);
    });
  }

  return maplibrePromise;
};

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(({ selectedCountry, selectedCity }, ref) => {
  const [maplibre, setMaplibre] = useState<MapLibreModule | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<MapLibreMarker | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      focusCountry: () => {
        if (!mapRef.current) return;
        mapRef.current.flyTo({ center: [0, 20], zoom: 1.4, speed: 0.6, curve: 1.2, essential: true });
      },
      focusCity: (lat, lng) => {
        if (!mapRef.current) return;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 3.2, speed: 0.7, curve: 1.4, essential: true });
      },
    }),
    []
  );

  useEffect(() => {
    if (maplibre || typeof window === "undefined") return;

    loadMapLibre()
      .then((lib) => setMaplibre(lib))
      .catch((error) => {
        console.warn("MapLibre failed to load", error);
        setMapError("No se pudo cargar el globo 3D.");
      });
  }, [maplibre]);

  useEffect(() => {
    if (!maplibre || !mapContainerRef.current || mapRef.current || mapError) return;

    const fallbackCenter: [number, number] = [0, 20];
    const fallbackZoom = 1.3;

    let map: MapLibreMap | null = null;

    try {
      map = new maplibre.Map({
        container: mapContainerRef.current,
        style: MAPLIBRE_STYLE,
        center: selectedCity ? [selectedCity.lng, selectedCity.lat] : fallbackCenter,
        zoom: selectedCity ? 2.8 : fallbackZoom,
        projection: "globe",
        attributionControl: false,
      });

      map.on("load", () => {
        if (!map) return;
        map.setFog?.({});
        setMapReady(true);
      });

      mapRef.current = map;
    } catch (error) {
      console.warn("MapLibre failed to initialize", error);
      map?.remove();
      mapRef.current = null;
      setMapError("El globo 3D no está disponible en este dispositivo.");
    }

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map?.remove();
      mapRef.current = null;
    };
  }, [maplibre, mapError, selectedCity]);

  useEffect(() => {
    if (!maplibre || !mapRef.current || !mapReady || mapError) return;

    if (!selectedCity) {
      mapRef.current.jumpTo({ center: [0, 20], zoom: 1.3 });
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const coords: [number, number] = [selectedCity.lng, selectedCity.lat];
    mapRef.current.flyTo({ center: coords, zoom: 3.2, speed: 0.7, curve: 1.4, essential: true });

    if (!markerRef.current) {
      const markerEl = document.createElement("div");
      markerEl.className = "map-marker map-marker--route";
      markerEl.textContent = selectedCity.name?.slice(0, 2).toUpperCase() || "★";
      markerRef.current = new maplibre.Marker({ element: markerEl }).setLngLat(coords).addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat(coords);
    }
  }, [maplibre, mapReady, mapError, selectedCity]);

  useEffect(() => {
    if (!mapRef.current) return;

    const handleResize = () => mapRef.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const title = selectedCountry ?? selectedCity?.name ?? "Globe3D";
  const location = selectedCity ? `${selectedCity.lat.toFixed(2)}, ${selectedCity.lng.toFixed(2)}` : "—";

  if (mapError) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.6)] text-xs font-mono text-olive">
        {mapError}
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border-2 border-ink">
      <div ref={mapContainerRef} className="absolute inset-0" aria-label="Mapa globo 3D" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(248,240,220,0.9)] via-[rgba(248,240,220,0.6)] to-transparent p-3 text-center text-xs text-ink/80">
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="font-mono text-[11px] text-ink/60">Selected city: {location}</div>
      </div>
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border-2 border-ink/60 bg-[rgba(255,255,255,0.85)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-olive">
        Globe3D
      </div>
    </div>
  );
});

Globe3D.displayName = "Globe3D";

export default Globe3D;
