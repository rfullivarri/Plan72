"use client";

import dynamic from "next/dynamic";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Feature, Geometry } from "geojson";
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
  locked?: boolean;
  lowMotion?: boolean;
};

type CountryFeature = Feature<Geometry, { name?: string }>;

type PointOfView = {
  lat: number;
  lng: number;
  altitude?: number;
};

type TopologyLike = {
  type: "Topology";
  objects: Record<string, unknown>;
};

const GLOBE_COLOR = "#f0e6cf";
const BORDER_COLOR = "#1b1a14";
const HIGHLIGHT_COLOR = "#b35a2a";
const IDLE_ROTATION_SPEED = 0.35;
const DEFAULT_VIEW: PointOfView = { lat: 10, lng: -10, altitude: 1.6 };
const CITY_VIEW_ALTITUDE = 0.9;

const normalizeName = (value?: string) => value?.trim().toLowerCase() ?? "";

const getFeatureCoordinates = (geometry: Geometry): number[][] => {
  if (geometry.type === "Polygon") return geometry.coordinates.flat();
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  return [];
};

const getFeatureCenter = (
  featureItem: CountryFeature
): { lat: number; lng: number } | null => {
  const coords = getFeatureCoordinates(featureItem.geometry);
  if (!coords.length) return null;

  const sum = coords.reduce(
    (acc, [lngValue, latValue]) => ({
      lat: acc.lat + latValue,
      lng: acc.lng + lngValue,
    }),
    { lat: 0, lng: 0 }
  );

  return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
};

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(
  ({ selectedCountry, selectedCity, locked = false, lowMotion = false }, ref) => {
    const globeRef = useRef<GlobeMethods | undefined>(undefined);
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lockedRef = useRef(locked);
    const lowMotionRef = useRef(lowMotion);
    const [highlightedCountry, setHighlightedCountry] = useState<string | null>(
      null
    );
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isWebGlAvailable, setIsWebGlAvailable] = useState(true);

    // Material for a clean monochrome sphere (no earth texture)
    const globeMaterial = useMemo(() => {
      const mat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(GLOBE_COLOR),
        shininess: 10,
      });
      return mat;
    }, []);

    // Convert TopoJSON -> GeoJSON features array (what react-globe.gl expects for polygonsData)
    const countries = useMemo<CountryFeature[]>(() => {
      const topo = countriesData as unknown as TopologyLike;
      const obj = (countriesData as unknown as { objects?: { countries?: unknown } })
        .objects?.countries;

      if (!obj) return [];

      const result = feature(topo as any, obj as any) as unknown;

      if (
        result &&
        typeof result === "object" &&
        (result as any).type === "FeatureCollection" &&
        Array.isArray((result as any).features)
      ) {
        return (result as any).features as CountryFeature[];
      }

      if (
        result &&
        typeof result === "object" &&
        (result as any).type === "Feature"
      ) {
        return [result as CountryFeature];
      }

      return [];
    }, []);

    const countryLookup = useMemo(() => {
      const lookup = new Map<string, CountryFeature>();
      for (const c of countries) {
        const key = normalizeName(c.properties?.name);
        if (key) lookup.set(key, c);
      }
      return lookup;
    }, [countries]);

    const updateAutoRotate = useCallback((enabled: boolean) => {
      const controls = globeRef.current?.controls();
      if (!controls) return;
      controls.autoRotate = enabled && !lowMotionRef.current;
      controls.autoRotateSpeed = IDLE_ROTATION_SPEED;
    }, []);

    const animateToPoint = useCallback((point: PointOfView, duration = 1400) => {
      globeRef.current?.pointOfView(point, duration);
    }, []);

    const scheduleIdleReset = useCallback(() => {
      if (lockedRef.current || lowMotionRef.current) return;
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => updateAutoRotate(true), 1600);
    }, [updateAutoRotate]);

    const focusCountry = useCallback(
      (countryName: string) => {
        const normalized = normalizeName(countryName);
        if (!normalized) return;

        const match = countryLookup.get(normalized);
        if (!match) return;

        const center = getFeatureCenter(match);
        if (!center) return;

        updateAutoRotate(false);
        setHighlightedCountry(normalized);
        animateToPoint({ lat: center.lat, lng: center.lng, altitude: 1.3 }, 1500);
        scheduleIdleReset();
      },
      [animateToPoint, countryLookup, scheduleIdleReset, updateAutoRotate]
    );

    const focusCity = useCallback(
      (lat: number, lng: number) => {
        updateAutoRotate(false);
        animateToPoint({ lat, lng, altitude: CITY_VIEW_ALTITUDE }, 1400);
        scheduleIdleReset();
      },
      [animateToPoint, scheduleIdleReset, updateAutoRotate]
    );

    const resetIdle = useCallback(() => {
      setHighlightedCountry(null);
      animateToPoint(DEFAULT_VIEW, 1200);
      if (!lockedRef.current && !lowMotionRef.current) {
        updateAutoRotate(true);
      }
    }, [animateToPoint, updateAutoRotate]);

    useImperativeHandle(
      ref,
      () => ({ focusCountry, focusCity, resetIdle }),
      [focusCountry, focusCity, resetIdle]
    );

    useEffect(() => {
      updateAutoRotate(true);
    }, [updateAutoRotate]);

    useEffect(() => {
      lockedRef.current = locked;
      if (locked) {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        updateAutoRotate(false);
      } else {
        updateAutoRotate(true);
      }
    }, [locked, updateAutoRotate]);

    useEffect(() => {
      lowMotionRef.current = lowMotion;
      if (lowMotion) {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        updateAutoRotate(false);
      } else {
        updateAutoRotate(true);
      }
    }, [lowMotion, updateAutoRotate]);

    useEffect(() => {
      if (selectedCountry) focusCountry(selectedCountry);
    }, [focusCountry, selectedCountry]);

    useEffect(() => {
      if (selectedCity) focusCity(selectedCity.lat, selectedCity.lng);
    }, [focusCity, selectedCity]);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
      updatePreference();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", updatePreference);
      } else {
        mediaQuery.addListener(updatePreference);
      }
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", updatePreference);
        } else {
          mediaQuery.removeListener(updatePreference);
        }
      };
    }, []);

    useEffect(() => {
      if (typeof window === "undefined") return;
      try {
        const canvas = document.createElement("canvas");
        const context =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        setIsWebGlAvailable(Boolean(context));
      } catch (error) {
        setIsWebGlAvailable(false);
      }
    }, []);

    useEffect(() => {
      return () => {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      };
    }, []);

    const pointsData = useMemo(() => {
      if (!selectedCity) return [];
      return [{ lat: selectedCity.lat, lng: selectedCity.lng, name: selectedCity.name }];
    }, [selectedCity]);

    const showFallback = prefersReducedMotion || !isWebGlAvailable;

    return (
      <div className="relative h-64 w-full overflow-hidden rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.6)]">
        {showFallback ? (
          <div className="flex h-full w-full items-center justify-center bg-[rgba(240,230,207,0.35)]">
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              fill="none"
              role="img"
              aria-label="Retro globe placeholder"
            >
              <circle cx="90" cy="90" r="68" fill="#f0e6cf" stroke="#1b1a14" strokeWidth="3" />
              <path
                d="M90 22C104 34 112 60 112 90C112 120 104 146 90 158C76 146 68 120 68 90C68 60 76 34 90 22Z"
                stroke="#1b1a14"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M22 90C34 104 60 112 90 112C120 112 146 104 158 90C146 76 120 68 90 68C60 68 34 76 22 90Z"
                stroke="#1b1a14"
                strokeWidth="2"
                fill="none"
              />
              <path d="M90 22V158" stroke="#1b1a14" strokeWidth="2" />
              <path d="M22 90H158" stroke="#1b1a14" strokeWidth="2" />
              <circle cx="124" cy="84" r="6" fill="#b35a2a" />
            </svg>
          </div>
        ) : (
          <Globe
            ref={globeRef}
            backgroundColor="rgba(0,0,0,0)"
            globeMaterial={globeMaterial}
            // Polygons (country outlines)
            polygonsData={countries}
            polygonCapColor={() => "rgba(0,0,0,0)"}
            polygonSideColor={() => "rgba(0,0,0,0)"}
            polygonStrokeColor={(d) => {
              const name = normalizeName((d as CountryFeature).properties?.name);
              return name && name === highlightedCountry ? HIGHLIGHT_COLOR : BORDER_COLOR;
            }}
            polygonAltitude={0.005}
            // City point
            pointsData={pointsData}
            pointColor={() => HIGHLIGHT_COLOR}
            pointAltitude={0.02}
            pointRadius={0.18}
            // Controls init
            onGlobeReady={() => {
              const controls = globeRef.current?.controls();
              if (controls) {
                controls.enablePan = false;
              }
              updateAutoRotate(true);
              animateToPoint(DEFAULT_VIEW, 0);
            }}
          />
        )}
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border-2 border-ink/60 bg-[rgba(255,255,255,0.85)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-olive">
          Globe
        </div>
        {locked && (
          <div className="pointer-events-none absolute right-4 top-4 rounded-full border-2 border-ink bg-[rgba(255,255,255,0.9)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-ink">
            LOCKED
          </div>
        )}
      </div>
    );
  }
);

Globe3D.displayName = "Globe3D";

export default Globe3D;
