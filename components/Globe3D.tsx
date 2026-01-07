"use client";

import Globe, { type GlobeMethods } from "react-globe.gl";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";

type CountryProperties = {
  name?: string;
  iso_a2?: string;
  iso_a3?: string;
};

export type Globe3DHandle = {
  focusCountry: (countryCode: string) => void;
  focusCity: (lat: number, lng: number) => void;
};

type Globe3DProps = {
  selectedCountry?: string;
  selectedCity?: { name?: string; lat: number; lng: number };
};

type NetworkPoint = {
  name: string;
  lat: number;
  lng: number;
};

const DEFAULT_VIEW = { lat: 15, lng: 5, altitude: 2.2 };

function collectBounds(coords: unknown, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === "number" && typeof coords[1] === "number") {
    const [lng, lat] = coords as [number, number];
    bounds.minLat = Math.min(bounds.minLat, lat);
    bounds.maxLat = Math.max(bounds.maxLat, lat);
    bounds.minLng = Math.min(bounds.minLng, lng);
    bounds.maxLng = Math.max(bounds.maxLng, lng);
    return;
  }
  coords.forEach((entry) => collectBounds(entry, bounds));
}

function getGeometryCenter(geometry: Geometry): { lat: number; lng: number } | null {
  const bounds = { minLat: Infinity, maxLat: -Infinity, minLng: Infinity, maxLng: -Infinity };
  collectBounds(geometry.coordinates, bounds);
  if (!Number.isFinite(bounds.minLat) || !Number.isFinite(bounds.minLng)) return null;
  return {
    lat: (bounds.minLat + bounds.maxLat) / 2,
    lng: (bounds.minLng + bounds.maxLng) / 2,
  };
}

const NETWORK_POINTS: NetworkPoint[] = [
  { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
  { name: "Reykjavík", lat: 64.1466, lng: -21.9426 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
];

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(({ selectedCountry, selectedCity }, ref) => {
  const globeRef = useRef<GlobeMethods | null>(null);
  const [countries, setCountries] = useState<FeatureCollection<Geometry, CountryProperties> | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/data/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setCountries(data);
      })
      .catch(() => {
        if (isMounted) setCountries(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      setDimensions({ width: node.clientWidth, height: node.clientHeight });
    });
    observer.observe(node);
    setDimensions({ width: node.clientWidth, height: node.clientHeight });
    return () => observer.disconnect();
  }, []);

  const resolveCountryMatch = (countryCode?: string) => {
    const target = countryCode?.trim().toUpperCase();
    if (!target || !countries) return null;
    return countries.features.find((feature) => {
      const props = feature.properties ?? {};
      const name = props.name?.toUpperCase();
      return (
        props.iso_a2?.toUpperCase() === target ||
        props.iso_a3?.toUpperCase() === target ||
        name === target
      );
    });
  };

  const focusCountry = (countryCode: string) => {
    if (!countries) return;
    const match = resolveCountryMatch(countryCode);
    if (!match) return;
    const center = getGeometryCenter(match.geometry);
    if (!center) return;
    globeRef.current?.pointOfView({ ...center, altitude: 1.4 }, 1400);
  };

  const focusCity = (lat: number, lng: number) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    globeRef.current?.pointOfView({ lat, lng, altitude: 0.55 }, 1200);
  };

  useImperativeHandle(ref, () => ({ focusCountry, focusCity }), [countries]);

  useEffect(() => {
    if (!selectedCountry) return;
    focusCountry(selectedCountry);
  }, [selectedCountry, countries]);

  useEffect(() => {
    if (!selectedCity) return;
    focusCity(selectedCity.lat, selectedCity.lng);
  }, [selectedCity?.lat, selectedCity?.lng]);

  const arcsData = useMemo(() => {
    return [
      { start: NETWORK_POINTS[0], end: NETWORK_POINTS[2] },
      { start: NETWORK_POINTS[2], end: NETWORK_POINTS[4] },
      { start: NETWORK_POINTS[4], end: NETWORK_POINTS[1] },
      { start: NETWORK_POINTS[1], end: NETWORK_POINTS[3] },
    ].map(({ start, end }) => ({
      startLat: start.lat,
      startLng: start.lng,
      endLat: end.lat,
      endLng: end.lng,
    }));
  }, []);

  const selectedMatch = resolveCountryMatch(selectedCountry);
  const selectedCountryName = selectedMatch?.properties?.name?.toUpperCase();

  const highlightedCity = selectedCity
    ? [{ lat: selectedCity.lat, lng: selectedCity.lng, name: selectedCity.name ?? "Selected city" }]
    : [];

  return (
    <div
      ref={containerRef}
      className="relative h-64 w-full overflow-hidden rounded-xl border-2 border-ink bg-[radial-gradient(circle_at_top,_rgba(179,90,42,0.2),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(74,90,58,0.3),_transparent_60%)]"
    >
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="/textures/globe-minimal.svg"
        bumpImageUrl=""
        showAtmosphere
        atmosphereColor="rgba(245,232,204,0.45)"
        atmosphereAltitude={0.15}
        arcsData={arcsData}
        arcColor={() => ["rgba(74,90,58,0.6)", "rgba(179,90,42,0.4)"]}
        arcStroke={0.4}
        arcAltitude={0.2}
        arcDashLength={0.4}
        arcDashGap={1.2}
        arcDashInitialGap={() => Math.random()}
        arcDashAnimateTime={2200}
        pointsData={highlightedCity}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "rgba(179,90,42,0.9)"}
        pointAltitude={0.02}
        pointRadius={0.45}
        pointLabel={(d) => `<div class='font-mono text-xs'>${(d as { name: string }).name}</div>`}
        polygonsData={countries?.features ?? []}
        polygonCapColor={(feature) => {
          const props = (feature as Feature<Geometry, CountryProperties>).properties ?? {};
          const name = props.name?.toUpperCase();
          const isSelected = !!selectedCountryName && selectedCountryName === name;
          return isSelected ? "rgba(179,90,42,0.35)" : "rgba(255,255,255,0.03)";
        }}
        polygonSideColor={() => "rgba(27,26,20,0.15)"}
        polygonStrokeColor={() => "rgba(27,26,20,0.35)"}
        polygonAltitude={(feature) => {
          const props = (feature as Feature<Geometry, CountryProperties>).properties ?? {};
          const name = props.name?.toUpperCase();
          return selectedCountryName && selectedCountryName === name ? 0.04 : 0.01;
        }}
        onGlobeReady={() => {
          globeRef.current?.pointOfView(DEFAULT_VIEW, 1200);
        }}
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border-2 border-ink/60 bg-[rgba(255,255,255,0.8)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-olive">
        Globe3D
      </div>
    </div>
  );
});

Globe3D.displayName = "Globe3D";

export default Globe3D;
