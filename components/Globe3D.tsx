"use client";

import dynamic from "next/dynamic";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GlobeMethods } from "react-globe.gl";
import * as THREE from "three";

import countriesData from "world-atlas/countries-110m.json";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export type Globe3DHandle = {
  focusCountry: (countryName: string) => void;
  focusCity: (lat: number, lng: number) => void;
  resetIdle: () => void;
};

type Globe3DProps = {
  selectedCountry?: string;
  selectedCity?: { name?: string; lat: number; lng: number };
};

type CountryFeature = Feature<Geometry, { name?: string }>;

type PointOfView = {
  lat: number;
  lng: number;
  altitude?: number;
};

const GLOBE_COLOR = "#f0e6cf";
const BORDER_COLOR = "#1b1a14";
const HIGHLIGHT_COLOR = "#b35a2a";
const IDLE_ROTATION_SPEED = 0.35;
const DEFAULT_VIEW: PointOfView = { lat: 10, lng: -10, altitude: 1.6 };

const normalizeName = (value?: string) => value?.trim().toLowerCase();

const getFeatureCoordinates = (geometry: Geometry): number[][] => {
  if (geometry.type === "Polygon") {
    return geometry.coordinates.flat();
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flat(2);
  }
  return [];
};

const getFeatureCenter = (featureItem: CountryFeature): { lat: number; lng: number } | null => {
  const coords = getFeatureCoordinates(featureItem.geometry);
  if (!coords.length) return null;
  const { lat, lng } = coords.reduce(
    (acc, [lngValue, latValue]) => ({
      lat: acc.lat + latValue,
      lng: acc.lng + lngValue,
    }),
    { lat: 0, lng: 0 }
  );
  return {
    lat: lat / coords.length,
    lng: lng / coords.length,
  };
};

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(({ selectedCountry, selectedCity }, ref) => {
  const globeRef = useRef<GlobeMethods | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);

  const countries = useMemo(() => {
    const collection = feature(
      countriesData as unknown as { type: "Topology"; objects: Record<string, unknown> },
      (countriesData as { objects: { countries: unknown } }).objects.countries
    ) as FeatureCollection<Geometry, { name?: string }>;
    return collection.features as CountryFeature[];
  }, []);

  const globeMaterial = useMemo(() => new THREE.MeshPhongMaterial({ color: GLOBE_COLOR }), []);

  const updateAutoRotate = useCallback((enabled: boolean) => {
    const controls = globeRef.current?.controls();
    if (!controls) return;
    controls.autoRotate = enabled;
    controls.autoRotateSpeed = IDLE_ROTATION_SPEED;
  }, []);

  const animateToPoint = useCallback((point: PointOfView, duration = 1400) => {
    globeRef.current?.pointOfView(point, duration);
  }, []);

  const scheduleIdleReset = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      updateAutoRotate(true);
    }, 1600);
  }, [updateAutoRotate]);

  const focusCountry = useCallback(
    (countryName: string) => {
      const normalized = normalizeName(countryName);
      if (!normalized) return;
      const match = countries.find((country) => normalizeName(country.properties?.name) === normalized);
      if (!match) return;
      const center = getFeatureCenter(match);
      if (!center) return;
      updateAutoRotate(false);
      setHighlightedCountry(normalized);
      animateToPoint({ lat: center.lat, lng: center.lng, altitude: 1.3 }, 1500);
      scheduleIdleReset();
    },
    [animateToPoint, countries, scheduleIdleReset, updateAutoRotate]
  );

  const focusCity = useCallback(
    (lat: number, lng: number) => {
      updateAutoRotate(false);
      animateToPoint({ lat, lng, altitude: 1.2 }, 1400);
      scheduleIdleReset();
    },
    [animateToPoint, scheduleIdleReset, updateAutoRotate]
  );

  const resetIdle = useCallback(() => {
    setHighlightedCountry(null);
    animateToPoint(DEFAULT_VIEW, 1200);
    updateAutoRotate(true);
  }, [animateToPoint, updateAutoRotate]);

  useImperativeHandle(
    ref,
    () => ({
      focusCountry,
      focusCity,
      resetIdle,
    }),
    [focusCountry, focusCity, resetIdle]
  );

  useEffect(() => {
    updateAutoRotate(true);
  }, [updateAutoRotate]);

  useEffect(() => {
    if (selectedCountry) {
      focusCountry(selectedCountry);
    }
  }, [focusCountry, selectedCountry]);

  useEffect(() => {
    if (selectedCity) {
      focusCity(selectedCity.lat, selectedCity.lng);
    }
  }, [focusCity, selectedCity]);

  useEffect(() => () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
  }, []);

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.6)]">
      <Globe
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={globeMaterial}
        polygonsData={countries}
        polygonCapColor={() => "rgba(0,0,0,0)"}
        polygonSideColor={() => "rgba(0,0,0,0)"}
        polygonStrokeColor={(d) =>
          normalizeName((d as CountryFeature).properties?.name) === highlightedCountry ? HIGHLIGHT_COLOR : BORDER_COLOR
        }
        polygonAltitude={0.005}
        onGlobeReady={() => {
          updateAutoRotate(true);
          animateToPoint(DEFAULT_VIEW, 0);
        }}
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border-2 border-ink/60 bg-[rgba(255,255,255,0.85)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-olive">
        Globe3D
      </div>
    </div>
  );
});

Globe3D.displayName = "Globe3D";

export default Globe3D;
